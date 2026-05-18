/**
 * Supabase Client Configuration
 * 
 * This client is configured to work with Clerk authentication.
 * The Clerk JWT token is automatically included in requests.
 * 
 * Documentation:
 * - Supabase JS Client: https://supabase.com/docs/reference/javascript/introduction
 * - Clerk + Supabase: https://clerk.com/docs/integrations/databases/supabase
 */

import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '@/config'
import type { Database } from '@/types/database'

// Module-level holder for the Clerk token getter.
// useClerkSupabase registers a function here on mount; supabase-js then calls
// it before every request via the accessToken option below.
let clerkTokenGetter: (() => Promise<string | null>) | null = null

export const registerClerkTokenGetter = (
  fn: (() => Promise<string | null>) | null
) => {
  clerkTokenGetter = fn
}

// Create Supabase client.
// `accessToken` is the supabase-js v2.45+ hook for external auth providers
// (Clerk, Auth0, Firebase). Each REST/realtime/storage request will call it
// to get a fresh JWT and put it on the Authorization header, replacing the
// publishable-key default. Combined with Supabase Third-Party Auth (see
// _docs/clerk-supabase-auth.md), this is what makes RLS read clerk_user_id().
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.publishableKey,
  {
    auth: {
      persistSession: false, // Clerk owns the session
      autoRefreshToken: false,
    },
    accessToken: async () => {
      if (!clerkTokenGetter) return null
      try {
        return await clerkTokenGetter()
      } catch {
        return null
      }
    },
  }
)

/**
 * Real-time subscription helper
 * 
 * Example usage:
 * ```ts
 * const subscription = subscribeToRequests((payload) => {
 *   console.log('New request:', payload)
 * })
 * 
 * // Later, unsubscribe:
 * subscription.unsubscribe()
 * ```
 */
export const subscribeToRequests = (
  callback: (payload: any) => void,
  filters?: { status?: string; organization_id?: string }
) => {
  let channel = supabase
    .channel('requests-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: filters ? `status=eq.${filters.status}` : undefined,
      },
      callback
    )
    .subscribe()

  return channel
}

/**
 * Helper functions for common database operations
 */

// Fetch a single request by ID with all related data
export const fetchRequestById = async (id: string): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .select(`
      *,
      organization:organizations(id, name, mission, logo_emoji, logo_url, zipcode, website),
      cause_area:cause_areas(id, name),
      challenge_categories:request_challenge_categories(category:challenge_categories(id, name)),
      identity_categories:request_identity_categories(category:identity_categories(id, name))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Fetch all open requests
export const fetchOpenRequests = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      organization:organizations(*),
      cause_area:cause_areas(*)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as any[]
}

const PAGE_SIZE = 12

export const fetchFilteredRequests = async (params: {
  search?: string
  causeAreaId?: string
  urgency?: string
  page?: number
}): Promise<{ data: any[]; count: number }> => {
  const { search, causeAreaId, urgency, page = 0 } = params
  let query = (supabase as any)
    .from('requests')
    .select('*, organization:organizations(*), cause_area:cause_areas(*)', { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (search) query = query.ilike('description', `%${search}%`)
  if (causeAreaId) query = query.eq('cause_area_id', causeAreaId)
  if (urgency) query = query.eq('urgency', urgency)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export const fetchCauseAreas = async () => {
  const { data, error } = await supabase
    .from('cause_areas')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data ?? []
}

// Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Claim a request
export const claimRequest = async (requestId: string, donorId: string): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .update({
      status: 'claimed',
      donor_id: donorId,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create a new request
export const createRequest = async (request: any): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .insert(request)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// ORGANIZATION HELPERS
// ============================================

// Fetch a single organization by ID with related data
export const fetchOrganization = async (id: string): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .select(`
      *,
      cause_areas:organization_cause_areas(cause_area:cause_areas(*)),
      populations:organization_populations(category:identity_categories(*)),
      user_profile:user_profiles(is_vetted)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Fetch organization by user ID (for CBO viewing their own org)
export const fetchOrganizationByUserId = async (userId: string): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .select(`
      *,
      cause_areas:organization_cause_areas(cause_area:cause_areas(*)),
      populations:organization_populations(category:identity_categories(*))
    `)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

// Fetch organization's requests
export const fetchOrganizationRequests = async (organizationId: string): Promise<any[]> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .select(`
      *,
      cause_area:cause_areas(*),
      in_kind_pledge:in_kind_pledges!requests_pledge_id_fkey(pledge_status)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as any) ?? []
}

// Fetch organization updates
export const fetchOrganizationUpdates = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('organization_updates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Fetch organization team members
export const fetchOrganizationTeamMembers = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('organization_team_members')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

// Update organization profile
export const updateOrganization = async (id: string, updates: any): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create a new organization (CBO setup)
export const createOrganization = async (org: any): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .insert(org)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create a request plus its category junction rows atomically
export const createRequestWithCategories = async (
  request: any,
  challengeCategoryIds: string[],
  identityCategoryIds: string[]
): Promise<any> => {
  const db = supabase as any

  const { data: newRequest, error: reqError } = await db
    .from('requests')
    .insert(request)
    .select()
    .single()

  if (reqError) throw reqError

  if (challengeCategoryIds.length > 0) {
    const { error } = await db.from('request_challenge_categories').insert(
      challengeCategoryIds.map((id) => ({
        request_id: newRequest.id,
        challenge_category_id: id,
      }))
    )
    if (error) throw error
  }

  if (identityCategoryIds.length > 0) {
    const { error } = await db.from('request_identity_categories').insert(
      identityCategoryIds.map((id) => ({
        request_id: newRequest.id,
        identity_category_id: id,
      }))
    )
    if (error) throw error
  }

  return newRequest
}

/**
 * Phase 8.5: fetch the in-kind pledge for a given request, if one exists.
 * Returns null when no pledge exists rather than throwing.
 *
 * PII WARNING: the returned row contains `delivery_address` (donor's
 * shipping/pickup address). RLS restricts SELECT to the donor and the
 * owning CBO — never expose this row to anonymous or unrelated users.
 * Must be called via the authenticated Supabase client (Clerk JWT attached).
 */
export const fetchInKindPledgeForRequest = async (
  requestId: string
): Promise<import('@/types/database').InKindPledge | null> => {
  const { data, error } = await (supabase as any)
    .from('in_kind_pledges')
    .select('*')
    .eq('request_id', requestId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

// Fetch all requests where user was the donor
export const fetchDonorRequests = async (userId: string): Promise<any[]> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .select(
      '*, organization:organizations(name, logo_url, logo_emoji), in_kind_pledge:in_kind_pledges!requests_pledge_id_fkey(pledge_status)'
    )
    .eq('donor_id', userId)
    .order('claimed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Upsert donor profile (creates on first save, updates on subsequent saves)
export const upsertDonorProfile = async (userId: string, updates: any): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('donor_profiles')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// Fetch donor profile by user ID
export const fetchDonorProfile = async (userId: string): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('donor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

// Create organization update/news post
export const createOrganizationUpdate = async (update: any) => {
  const { data, error } = await supabase
    .from('organization_updates')
    .insert(update)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create organization team member
export const createOrganizationTeamMember = async (member: any) => {
  const { data, error } = await supabase
    .from('organization_team_members')
    .insert(member)
    .select()
    .single()

  if (error) throw error
  return data
}

// Fetch notifications for a user (most recent first)
export const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('request_notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

// Mark a single notification as read
export const markNotificationRead = async (notificationId: string) => {
  const { error } = await (supabase as any)
    .from('request_notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// Mark all notifications for a user as read
export const markAllNotificationsRead = async (userId: string) => {
  const { error } = await (supabase as any)
    .from('request_notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

// ============================================
// ADMIN HELPERS
// ============================================

// Fetch all organizations (admin: vetting queue)
export const fetchAllOrganizations = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Update org vetting status
export const updateOrganizationVetting = async (
  orgId: string,
  is_vetted: boolean,
  vetting_note?: string
): Promise<any> => {
  // Fetch org first to get user_id for the user_profiles update
  const { data: org, error: fetchError } = await (supabase as any)
    .from('organizations')
    .select('id, user_id')
    .eq('id', orgId)
    .single()

  if (fetchError) throw fetchError

  const { data, error } = await (supabase as any)
    .from('organizations')
    .update({ is_vetted, vetting_note: vetting_note ?? null })
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error

  // RLS for public browse checks user_profiles.is_vetted — keep in sync
  if (org.user_id) {
    await (supabase as any)
      .from('user_profiles')
      .update({ is_vetted })
      .eq('id', org.user_id)
  }

  return data
}

// Fetch all requests for admin moderation
export const fetchAllRequestsAdmin = async (): Promise<any[]> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .select('*, organization:organizations(name, logo_url)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Fetch all request history rows (audit log)
export const fetchRequestHistory = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('request_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return data ?? []
}

