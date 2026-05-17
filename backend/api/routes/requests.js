/**
 * Request Lifecycle Endpoints
 *
 * POST /api/requests/fulfill — CBO marks a claimed request as fulfilled
 * POST /api/requests/deny    — CBO denies an open or claimed request
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

// Verify the authenticated user owns the organization that owns the request
async function verifyOwnership(requestId, userId) {
  const { data: request, error } = await supabase
    .from('requests')
    .select('id, status, donor_id, organization_id, organizations!inner(user_id)')
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

/**
 * POST /api/requests/fulfill
 * Mark a claimed request as fulfilled by the CBO.
 */
router.post('/fulfill', async (req, res) => {
  const { requestId, fulfillment_method, tracking_number, notes } = req.body
  const userId = req.auth?.userId

  if (!requestId) {
    return res.status(400).json({ error: 'Missing requestId' })
  }

  const { request, error, status } = await verifyOwnership(requestId, userId)
  if (error) return res.status(status).json({ error })

  if (request.status !== 'claimed') {
    return res.status(409).json({ error: `Request must be claimed to fulfill (current: ${request.status})` })
  }

  const now = new Date().toISOString()

  // Update request status
  const { error: updateError } = await supabase
    .from('requests')
    .update({ status: 'fulfilled', fulfilled_at: now })
    .eq('id', requestId)

  if (updateError) {
    console.error('Error fulfilling request:', updateError)
    return res.status(500).json({ error: 'Failed to update request' })
  }

  // Record fulfillment details
  if (request.donor_id) {
    await supabase.from('fulfillment_records').insert({
      request_id: requestId,
      donor_id: request.donor_id,
      fulfillment_method: fulfillment_method || null,
      tracking_number: tracking_number || null,
      notes: notes || null,
      confirmed_by_cbo: true,
    })

    // Notify donor
    await supabase.from('request_notifications').insert({
      request_id: requestId,
      notification_type: 'fulfilled',
      title: 'Donation Fulfilled!',
      message: 'Your donation has been received and fulfilled by the organization. Thank you!',
      recipient_id: request.donor_id,
    })
  }

  // Audit history
  await supabase.from('request_history').insert({
    request_id: requestId,
    changed_by_id: userId,
    old_status: 'claimed',
    new_status: 'fulfilled',
  })

  res.json({ success: true })
})

/**
 * POST /api/requests/deny
 * CBO denies an open or claimed request.
 */
router.post('/deny', async (req, res) => {
  const { requestId, denial_reason } = req.body
  const userId = req.auth?.userId

  if (!requestId || !denial_reason) {
    return res.status(400).json({ error: 'Missing requestId or denial_reason' })
  }

  const { request, error, status } = await verifyOwnership(requestId, userId)
  if (error) return res.status(status).json({ error })

  if (!['open', 'claimed'].includes(request.status)) {
    return res.status(409).json({ error: `Cannot deny a request with status: ${request.status}` })
  }

  const oldStatus = request.status
  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('requests')
    .update({
      status: 'denied',
      denial_reason,
      denied_at: now,
    })
    .eq('id', requestId)

  if (updateError) {
    console.error('Error denying request:', updateError)
    return res.status(500).json({ error: 'Failed to deny request' })
  }

  // If a donor had claimed this request, notify them
  if (oldStatus === 'claimed' && request.donor_id) {
    await supabase.from('request_notifications').insert({
      request_id: requestId,
      notification_type: 'denied',
      title: 'Request Denied',
      message: `A request you donated to has been denied by the organization. Reason: ${denial_reason}`,
      recipient_id: request.donor_id,
    })
  }

  // Audit history
  await supabase.from('request_history').insert({
    request_id: requestId,
    changed_by_id: userId,
    old_status: oldStatus,
    new_status: 'denied',
    note: denial_reason,
  })

  res.json({ success: true })
})

export default router
