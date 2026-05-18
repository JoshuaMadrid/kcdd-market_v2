/**
 * Phase 8.5 — In-Kind Pledge Endpoints
 *
 * POST /api/requests/pledge-in-kind         — Donor submits a device pledge (claims the request)
 * POST /api/requests/accept-pledge          — CBO accepts a pending pledge
 * POST /api/requests/confirm-in-kind-receipt — CBO confirms physical receipt (→ fulfilled)
 * POST /api/requests/reject-pledge          — CBO rejects a pending pledge (request reopens)
 *
 * `clerkAuth` middleware is applied at mount time in server.js, so every
 * handler has `req.auth.userId` populated with a verified Clerk user ID.
 */

import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Verify the authenticated user owns the org that owns the request.
// Mirrors the helper in routes/requests.js to keep ownership logic identical.
async function verifyOwnership(requestId, userId) {
  const { data: request, error } = await supabase
    .from('requests')
    .select(
      'id, status, donor_id, donation_type, pledge_id, organization_id, organizations!inner(user_id)'
    )
    .eq('id', requestId)
    .single()

  if (error || !request) {
    return { error: 'Request not found', status: 404 }
  }

  if (request.organizations.user_id !== userId) {
    return { error: 'Forbidden', status: 403 }
  }

  return { request }
}

function deviceBreakdownHasAny(breakdown) {
  if (!breakdown || typeof breakdown !== 'object') return false
  return Object.values(breakdown).some((v) => Number(v) > 0)
}

/**
 * POST /api/requests/pledge-in-kind
 * Donor pledges in-kind devices for an open request.
 * Atomicity is guaranteed by the `create_in_kind_pledge` Postgres RPC.
 */
router.post('/pledge-in-kind', async (req, res) => {
  const { requestId, device_breakdown, donor_notes, delivery_address } = req.body
  const donorId = req.auth?.userId

  if (!donorId) return res.status(401).json({ error: 'Unauthorized' })
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' })
  if (!delivery_address || !delivery_address.trim()) {
    return res.status(400).json({ error: 'delivery_address is required' })
  }
  if (!deviceBreakdownHasAny(device_breakdown)) {
    return res.status(400).json({ error: 'At least one device count must be greater than 0' })
  }

  const { data: pledgeId, error } = await supabase.rpc('create_in_kind_pledge', {
    p_request_id: requestId,
    p_donor_id: donorId,
    p_device_breakdown: device_breakdown,
    p_donor_notes: donor_notes ?? null,
    p_delivery_address: delivery_address,
  })

  if (error) {
    console.error('create_in_kind_pledge RPC error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create pledge' })
  }
  if (!pledgeId) {
    return res.status(409).json({ error: 'Request is no longer available' })
  }

  // Notify the CBO that owns the request.
  const { data: ownerRow } = await supabase
    .from('requests')
    .select('amount, organizations!inner(user_id, name)')
    .eq('id', requestId)
    .single()

  if (ownerRow) {
    await supabase.from('request_notifications').insert({
      request_id: requestId,
      recipient_id: ownerRow.organizations.user_id,
      notification_type: 'claimed',
      title: 'Device pledge received',
      message: `A donor has pledged devices for your request. Review and accept to proceed.`,
    })
  }

  return res.status(200).json({ success: true, pledgeId })
})

/**
 * POST /api/requests/accept-pledge
 * CBO accepts a pending in-kind pledge. Inserts a fulfillment_records row
 * (unconfirmed) and notifies the donor.
 */
router.post('/accept-pledge', async (req, res) => {
  const { requestId } = req.body
  const userId = req.auth?.userId

  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' })

  const ownership = await verifyOwnership(requestId, userId)
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error })
  }
  const { request } = ownership

  if (request.status !== 'claimed' || request.donation_type !== 'in_kind' || !request.pledge_id) {
    return res.status(409).json({ error: 'Request is not in a pending in-kind state' })
  }

  // Mark the pledge accepted
  const { error: pledgeError } = await supabase
    .from('in_kind_pledges')
    .update({ pledge_status: 'accepted' })
    .eq('id', request.pledge_id)

  if (pledgeError) {
    return res.status(500).json({ error: pledgeError.message })
  }

  // Create an unconfirmed fulfillment record so /confirm-in-kind-receipt has something to flip.
  const { error: frError } = await supabase.from('fulfillment_records').insert({
    request_id: requestId,
    donor_id: request.donor_id,
    fulfillment_method: 'in_kind',
    confirmed_by_cbo: false,
  })

  if (frError) {
    return res.status(500).json({ error: frError.message })
  }

  // Audit log + donor notification
  await supabase.from('request_history').insert({
    request_id: requestId,
    changed_by_id: userId,
    old_status: 'claimed',
    new_status: 'claimed',
  })

  await supabase.from('request_notifications').insert({
    request_id: requestId,
    recipient_id: request.donor_id,
    notification_type: 'approved',
    title: 'Pledge accepted',
    message: 'The organization has accepted your device pledge. Coordinate delivery details with them.',
  })

  return res.status(200).json({ success: true })
})

/**
 * POST /api/requests/confirm-in-kind-receipt
 * CBO confirms physical receipt. Marks the request fulfilled and flips
 * fulfillment_records.confirmed_by_cbo on the latest record.
 */
router.post('/confirm-in-kind-receipt', async (req, res) => {
  const { requestId, notes } = req.body
  const userId = req.auth?.userId

  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' })

  const ownership = await verifyOwnership(requestId, userId)
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error })
  }
  const { request } = ownership

  if (request.status !== 'claimed' || request.donation_type !== 'in_kind' || !request.pledge_id) {
    return res.status(409).json({ error: 'Request is not in an accepted in-kind state' })
  }

  // Confirm pledge was accepted
  const { data: pledge } = await supabase
    .from('in_kind_pledges')
    .select('pledge_status')
    .eq('id', request.pledge_id)
    .single()
  if (!pledge || pledge.pledge_status !== 'accepted') {
    return res.status(409).json({ error: 'Pledge has not been accepted yet' })
  }

  // Fulfilled
  const { error: reqErr } = await supabase
    .from('requests')
    .update({ status: 'fulfilled', fulfilled_at: new Date().toISOString() })
    .eq('id', requestId)
  if (reqErr) return res.status(500).json({ error: reqErr.message })

  // Find the latest fulfillment_record for this request (single-donor model so order is deterministic)
  const { data: fr } = await supabase
    .from('fulfillment_records')
    .select('id')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fr) {
    await supabase
      .from('fulfillment_records')
      .update({ confirmed_by_cbo: true, notes: notes ?? null })
      .eq('id', fr.id)
  }

  // Audit log + donor notification
  await supabase.from('request_history').insert({
    request_id: requestId,
    changed_by_id: userId,
    old_status: 'claimed',
    new_status: 'fulfilled',
  })

  await supabase.from('request_notifications').insert({
    request_id: requestId,
    recipient_id: request.donor_id,
    notification_type: 'fulfilled',
    title: 'Devices received — thank you!',
    message:
      'The organization has confirmed receipt of your devices. You will receive a separate acknowledgment letter for tax purposes.',
  })

  return res.status(200).json({ success: true })
})

/**
 * POST /api/requests/reject-pledge
 * CBO rejects a pending in-kind pledge. Reopens the request.
 */
router.post('/reject-pledge', async (req, res) => {
  const { requestId, reason } = req.body
  const userId = req.auth?.userId

  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' })

  const ownership = await verifyOwnership(requestId, userId)
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error })
  }
  const { request } = ownership

  if (request.status !== 'claimed' || request.donation_type !== 'in_kind' || !request.pledge_id) {
    return res.status(409).json({ error: 'Request is not in a pending in-kind state' })
  }

  // Mark the pledge rejected
  await supabase
    .from('in_kind_pledges')
    .update({ pledge_status: 'rejected' })
    .eq('id', request.pledge_id)

  // Reopen the request — reset donation_type back to 'cash' default and drop pledge link
  const donorId = request.donor_id
  const { error: reqErr } = await supabase
    .from('requests')
    .update({
      status: 'open',
      donor_id: null,
      donation_type: 'cash',
      claimed_at: null,
      pledge_id: null,
    })
    .eq('id', requestId)
  if (reqErr) return res.status(500).json({ error: reqErr.message })

  // Audit log + donor notification
  await supabase.from('request_history').insert({
    request_id: requestId,
    changed_by_id: userId,
    old_status: 'claimed',
    new_status: 'open',
  })

  if (donorId) {
    await supabase.from('request_notifications').insert({
      request_id: requestId,
      recipient_id: donorId,
      notification_type: 'denied',
      title: 'Pledge declined',
      message: reason
        ? `The organization declined your pledge. Reason: ${reason}`
        : 'The organization declined your device pledge. The request is open again.',
    })
  }

  return res.status(200).json({ success: true })
})

export default router
