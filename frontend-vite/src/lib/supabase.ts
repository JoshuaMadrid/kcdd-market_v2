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

// Bridge object for App.tsx compatibility — wraps registerClerkTokenGetter.
export const ClerkSupabaseBridge = {
  setTokenGetter: registerClerkTokenGetter,
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
 * @deprecated Use registerClerkTokenGetter instead.
 * Preserved for backwards compatibility.
 */
export const setSupabaseAuth = async (_clerkToken: string | null) => {
  // no-op; preserved for backwards compatibility with callers
}

/**
 * @deprecated Not used - Clerk handles all authentication
 * This function exists for potential future use but currently
 * always returns true since Clerk manages auth state.
 */
export const isSupabaseAuthenticated = (): boolean => {
  return true // Clerk handles auth - this is intentionally always true
}

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
  const channel = supabase
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

// Fetch all open requests
export const fetchOpenRequests = async () => {
  const { data, error } = await supabase
    .from('requests')
    .select(
      `
      *,
      organization:organizations(*),
      cause_area:cause_areas(*)
    `
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single()

  if (error) throw error
  return data
}

// Claim a request
export const claimRequest = async (requestId: string, donorId: string) => {
  const updateData: Database['public']['Tables']['requests']['Update'] = {
    status: 'claimed',
    donor_id: donorId,
    claimed_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create a new request
export const createRequest = async (request: any) => {
  const { data, error } = await supabase.from('requests').insert(request).select().single()

  if (error) throw error
  return data
}

/**
 * Newsletter subscription
 * Saves email to newsletter_subscriptions table
 */
export const subscribeToNewsletter = async (email: string, source: string = 'footer') => {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        source,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      },
      {
        onConflict: 'email',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Onboarding Functions
 */

// Check if user has completed onboarding
export const checkOnboardingStatus = async (
  userId: string,
  userType: 'donor' | 'cbo' = 'donor'
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('onboarding_complete, user_type')
    .eq('id', userId)
    .single()

  if (error) {
    // If no profile exists, create one and return incomplete status
    if (error.code === 'PGRST116') {
      // Create the user profile
      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: userId,
        user_type: userType,
        onboarding_complete: false,
        wants_updates: false,
      })

      if (insertError) {
        console.error('Error creating user profile:', insertError)
      }

      return { onboarding_complete: false, user_type: userType }
    }
    throw error
  }
  return data
}

// Save organization onboarding data
export const saveOrganizationOnboarding = async (
  userId: string,
  data: {
    name: string
    website: string | null
    ein: string | null
    mission: string
    email: string
    logo?: File | null
  }
) => {
  let logoUrl = null

  // Upload logo if provided
  if (data.logo) {
    const fileExt = data.logo.name.split('.').pop()
    const fileName = `${userId}-logo-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(fileName, data.logo)

    if (uploadError) {
      console.error('Logo upload error:', uploadError)
      // Continue without logo
    } else {
      const { data: urlData } = supabase.storage.from('organization-logos').getPublicUrl(fileName)
      logoUrl = urlData.publicUrl
    }
  }

  // Check if org already exists for this user
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const orgPayload = {
    user_id: userId,
    name: data.name,
    website: data.website,
    ein: data.ein,
    mission: data.mission,
    email: data.email,
    logo_url: logoUrl,
    updated_at: new Date().toISOString(),
  }

  // Approval gate: new orgs are not vetted by default. Admin must set
  // user_profiles.is_vetted=true before this org becomes publicly visible.
  if (existing) {
    const { data: orgData, error } = await supabase
      .from('organizations')
      .update(orgPayload)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return orgData
  }

  const { data: orgData, error } = await supabase
    .from('organizations')
    .insert({
      ...orgPayload,
      id: crypto.randomUUID(),
      zipcode: '',
    })
    .select()
    .single()

  if (error) throw error
  return orgData
}

// Mark onboarding as complete
export const completeOnboarding = async (userId: string, wantsUpdates: boolean = false) => {
  // First try to update
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      onboarding_complete: true,
      wants_updates: wantsUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  // If update failed (no row), try to insert
  if (error) {
    if (error.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          onboarding_complete: true,
          wants_updates: wantsUpdates,
          user_type: 'donor',
        })
        .select()
        .single()

      if (insertError) throw insertError
      return insertData
    }
    throw error
  }
  return data
}

// Get organization by user ID
export const getOrganizationByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Update organization info
export const updateOrganization = async (
  organizationId: string,
  updates: {
    name?: string
    mission?: string
    description?: string
    email?: string
    phone?: string | null
    website?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zipcode?: string
    tagline?: string | null
    organization_type?: string | null
    organization_size?: string | null
    year_founded?: number | null
    technology_barriers?: string | null
    cover_image_url?: string | null
    logo_url?: string | null
    program_description?: string | null
    service_area_description?: string | null
    ages_served?: string[] | null
    pre_eligibility_status?: string | null
    ein?: string | null
    facebook_url?: string
    twitter_url?: string
    instagram_url?: string
    linkedin_url?: string
    youtube_url?: string
    tiktok_url?: string
  }
) => {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', organizationId)
    .select()
    .single()

  return { data, error }
}

// Save donor onboarding data
export const saveDonorOnboarding = async (
  userId: string,
  data: {
    displayName: string
    website: string | null
    phone: string | null
    bio: string | null
    email: string
    logo?: File | null
    causeAreas?: string[]
  }
) => {
  let profilePictureUrl = null

  // Upload profile picture if provided
  if (data.logo) {
    const fileExt = data.logo.name.split('.').pop()
    const fileName = `${userId}-profile-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, data.logo)

    if (uploadError) {
      console.error('Profile picture upload error:', uploadError)
    } else {
      const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(fileName)
      profilePictureUrl = urlData.publicUrl
    }
  }

  // First update user_profiles with email info
  await supabase.from('user_profiles').upsert(
    {
      id: userId,
      email: data.email,
      phone: data.phone,
      profile_picture_url: profilePictureUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  // Upsert donor profile
  const { data: profileData, error } = await supabase
    .from('donor_profiles')
    .upsert(
      {
        user_id: userId,
        display_name: data.displayName,
        name: data.displayName,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        website: data.website,
        profile_picture_url: profilePictureUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error

  // Save donor cause area preferences if any
  if (data.causeAreas && data.causeAreas.length > 0) {
    await saveDonorCauseAreas(userId, data.causeAreas)
  }

  return profileData
}

// Save donor cause area preferences
export const saveDonorCauseAreas = async (userId: string, causeAreas: string[]) => {
  // Get cause area IDs from names
  const { data: causeAreaRecords, error: fetchError } = await supabase
    .from('cause_areas')
    .select('id, name')
    .in('name', causeAreas)

  if (fetchError) throw fetchError

  if (!causeAreaRecords || causeAreaRecords.length === 0) {
    console.warn('No matching cause areas found in database')
    return []
  }

  // Create donor_cause_areas records
  const records = causeAreaRecords.map((ca) => ({
    donor_id: userId,
    cause_area_id: ca.id,
  }))

  // Delete existing associations first
  await (supabase as any).from('donor_cause_areas').delete().eq('donor_id', userId)

  // Insert new associations
  const { data, error } = await (supabase as any).from('donor_cause_areas').insert(records).select()

  if (error) throw error
  return data
}

// Save organization cause areas
export const saveOrganizationCauseAreas = async (organizationId: string, causeAreas: string[]) => {
  // First, get the cause area IDs from names
  const { data: causeAreaRecords, error: fetchError } = await supabase
    .from('cause_areas')
    .select('id, name')
    .in('name', causeAreas)

  if (fetchError) throw fetchError

  // If no matching cause areas found, create them or skip
  if (!causeAreaRecords || causeAreaRecords.length === 0) {
    console.warn('No matching cause areas found in database')
    return []
  }

  // Create organization_cause_areas records
  const records = causeAreaRecords.map((ca) => ({
    organization_id: organizationId,
    cause_area_id: ca.id,
  }))

  // Delete existing associations first (to handle updates)
  await supabase.from('organization_cause_areas').delete().eq('organization_id', organizationId)

  // Insert new associations
  const { data, error } = await supabase.from('organization_cause_areas').insert(records).select()

  if (error) throw error
  return data
}

// ============================================
// DASHBOARD DATA FETCHING
// ============================================

export interface DonorDashboardStats {
  totalDonations: number
  requestsFulfilled: number
  requestsClaimed: number
  causesSupported: number
}

export interface CBODashboardStats {
  totalReceived: number
  activeRequests: number
  fulfilledRequests: number
  pendingRequests: number
  beneficiariesHelped: number
}

export interface DonationRecord {
  id: string
  description: string
  amount: number
  status: 'open' | 'claimed' | 'fulfilled' | 'denied'
  urgency: 'low' | 'medium' | 'high'
  organization_name: string
  organization_logo_emoji: string
  cause_area_name: string
  created_at: string
  claimed_at: string | null
  fulfilled_at: string | null
}

export interface RequestRecord {
  id: string
  description: string
  amount: number
  status: 'open' | 'claimed' | 'fulfilled' | 'denied'
  urgency: 'low' | 'medium' | 'high'
  zipcode: string
  cause_area_name: string
  donor_email: string | null
  created_at: string
  claimed_at: string | null
  fulfilled_at: string | null
}

// Fetch donor dashboard statistics. Counts BOTH requests-style donations
// (where this donor claimed/fulfilled a specific request row) and
// campaign-style donations (recorded as payment_transactions).
export const fetchDonorDashboardStats = async (donorId: string): Promise<DonorDashboardStats> => {
  const [requestsResult, txResult] = await Promise.all([
    supabase.from('requests').select('id, amount, status, cause_area_id').eq('donor_id', donorId),
    supabase
      .from('payment_transactions')
      .select('id, amount_total, status')
      .eq('donor_id', donorId),
  ])

  if (requestsResult.error) throw requestsResult.error
  if (txResult.error) throw txResult.error

  const requestRows = requestsResult.data || []
  const txRows = (txResult.data || []) as any[]

  const fulfilledFromRequests = requestRows.filter((d) => d.status === 'fulfilled')
  const claimedFromRequests = requestRows.filter((d) => d.status === 'claimed')

  // Campaign tx donations: 'succeeded' → counts toward fulfilled,
  // 'pending' → counts toward claimed (intent created, awaiting webhook).
  const fulfilledFromTx = txRows.filter((d) => d.status === 'succeeded')
  const claimedFromTx = txRows.filter((d) => d.status === 'pending')

  const totalDonations =
    fulfilledFromRequests.reduce((sum, d) => sum + Number(d.amount), 0) +
    fulfilledFromTx.reduce((sum, d) => sum + Number(d.amount_total || 0) / 100, 0)

  // Campaigns aren't tagged with cause areas in the current schema, so
  // campaign donations don't contribute to the unique-causes count.
  const causeIds = new Set<string>()
  requestRows.forEach((d) => d.cause_area_id && causeIds.add(d.cause_area_id))

  return {
    totalDonations,
    requestsFulfilled: fulfilledFromRequests.length + fulfilledFromTx.length,
    requestsClaimed: claimedFromRequests.length + claimedFromTx.length,
    causesSupported: causeIds.size,
  }
}

// Fetch donor's donation history
// Donor donation history merges two parallel sources:
// (1) `requests` rows where the donor claimed a single request directly
// (2) `payment_transactions` rows from campaign-style donations
// Stripe tx status is mapped onto the DonationRecord status union so the
// dashboard filters (claimed / fulfilled / etc.) work for both shapes:
//   tx 'succeeded' -> 'fulfilled'   (money received)
//   tx 'pending'   -> 'claimed'     (intent created, not yet confirmed)
//   tx 'failed'/'canceled' -> 'denied'
const mapTxStatusToDonationStatus = (
  txStatus: string | null
): 'open' | 'claimed' | 'fulfilled' | 'denied' => {
  switch (txStatus) {
    case 'succeeded':
      return 'fulfilled'
    case 'failed':
    case 'canceled':
      return 'denied'
    case 'pending':
    default:
      return 'claimed'
  }
}

export const fetchDonorDonations = async (
  donorId: string,
  filters?: { status?: string; search?: string }
): Promise<DonationRecord[]> => {
  // Source 1: requests-style donations
  let requestsQuery = supabase
    .from('requests')
    .select(
      `
      id,
      description,
      amount,
      status,
      urgency,
      created_at,
      claimed_at,
      fulfilled_at,
      organization:organizations(name, logo_emoji),
      cause_area:cause_areas(name)
    `
    )
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    requestsQuery = requestsQuery.eq('status', filters.status as any)
  }
  if (filters?.search) {
    requestsQuery = requestsQuery.ilike('description', `%${filters.search}%`)
  }

  // Source 2: campaign-style donations recorded as Stripe transactions.
  // Note: campaigns has no cause_area_id column (see migrations), so we
  // can't pull cause area from the join — donations get tagged 'General'.
  const txQuery = supabase
    .from('payment_transactions')
    .select(
      `
      id,
      amount_total,
      status,
      created_at,
      completed_at,
      campaign:campaigns(id, title, slug),
      organization:organizations(name, logo_emoji)
    `
    )
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false })

  const [requestsResult, txResult] = await Promise.all([requestsQuery, txQuery])

  if (requestsResult.error) throw requestsResult.error
  if (txResult.error) throw txResult.error

  const requestDonations: DonationRecord[] = (requestsResult.data || []).map((item: any) => ({
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    status: item.status,
    urgency: item.urgency,
    organization_name: item.organization?.name || 'Unknown Organization',
    organization_logo_emoji: item.organization?.logo_emoji || 'building2',
    cause_area_name: item.cause_area?.name || 'General',
    created_at: item.created_at,
    claimed_at: item.claimed_at,
    fulfilled_at: item.fulfilled_at,
  }))

  const campaignDonations: DonationRecord[] = (txResult.data || []).map((item: any) => {
    const mappedStatus = mapTxStatusToDonationStatus(item.status)
    return {
      id: item.id,
      description: item.campaign?.title || 'Campaign donation',
      // payment_transactions.amount_total is stored in cents
      amount: Number(item.amount_total || 0) / 100,
      status: mappedStatus,
      urgency: 'medium',
      organization_name: item.organization?.name || 'KC DIME',
      organization_logo_emoji: item.organization?.logo_emoji || 'building2',
      cause_area_name: 'General',
      created_at: item.created_at,
      claimed_at: item.created_at,
      fulfilled_at: mappedStatus === 'fulfilled' ? item.completed_at || item.created_at : null,
    }
  })

  // Apply search/status filters to campaign donations client-side so the
  // shape lines up with the requests query's filters.
  let filteredCampaigns = campaignDonations
  if (filters?.status && filters.status !== 'all') {
    filteredCampaigns = filteredCampaigns.filter((d) => d.status === filters.status)
  }
  if (filters?.search) {
    const needle = filters.search.toLowerCase()
    filteredCampaigns = filteredCampaigns.filter((d) =>
      d.description.toLowerCase().includes(needle)
    )
  }

  return [...requestDonations, ...filteredCampaigns].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )
}

// Fetch CBO dashboard statistics
export const fetchCBODashboardStats = async (userId: string): Promise<CBODashboardStats> => {
  // First get the organization for this user
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (orgError) {
    return {
      totalReceived: 0,
      activeRequests: 0,
      fulfilledRequests: 0,
      pendingRequests: 0,
      beneficiariesHelped: 0,
    }
  }

  const { data: requests, error } = await supabase
    .from('requests')
    .select('id, amount, status, beneficiaries_count')
    .eq('organization_id', org.id)

  if (error) throw error

  const fulfilled = requests?.filter((r) => r.status === 'fulfilled') || []
  const active = requests?.filter((r) => r.status === 'claimed') || []
  const pending = requests?.filter((r) => r.status === 'open') || []

  return {
    totalReceived: fulfilled.reduce((sum, r) => sum + Number(r.amount), 0),
    activeRequests: active.length,
    fulfilledRequests: fulfilled.length,
    pendingRequests: pending.length,
    beneficiariesHelped: fulfilled.reduce(
      (sum, r: any) => sum + Number(r.beneficiaries_count ?? 1),
      0
    ),
  }
}

// Fetch CBO's requests
export const fetchCBORequests = async (
  userId: string,
  filters?: { status?: string; search?: string }
): Promise<RequestRecord[]> => {
  // First get the organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (orgError) return []

  let query = supabase
    .from('requests')
    .select(
      `
      id,
      description,
      amount,
      status,
      urgency,
      zipcode,
      created_at,
      claimed_at,
      fulfilled_at,
      cause_area:cause_areas(name),
      donor:user_profiles!requests_donor_id_fkey(id)
    `
    )
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as any)
  }

  if (filters?.search) {
    query = query.ilike('description', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    status: item.status,
    urgency: item.urgency,
    zipcode: item.zipcode,
    cause_area_name: item.cause_area?.name || 'General',
    donor_email: item.donor ? 'Donor assigned' : null,
    created_at: item.created_at,
    claimed_at: item.claimed_at,
    fulfilled_at: item.fulfilled_at,
  }))
}

// Get donor profile
export const getDonorProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Get all cause areas
export const fetchCauseAreas = async () => {
  const { data, error } = await supabase
    .from('cause_areas')
    .select('id, name, description')
    .order('name')

  if (error) throw error
  return data || []
}

// Create a new request (for CBO)
export const createNewRequest = async (request: {
  organization_id: string
  cause_area_id: string
  description: string
  amount: number
  urgency: 'low' | 'medium' | 'high'
  zipcode: string
  beneficiaries_count?: number
}) => {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...request,
      id: crypto.randomUUID(),
      status: 'open',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update request status
export const updateRequestStatus = async (
  requestId: string,
  status: 'open' | 'claimed' | 'fulfilled' | 'denied',
  additionalData?: { donor_id?: string; donor_note?: string; denial_reason?: string }
) => {
  const updateData: any = { status }

  if (status === 'claimed') {
    updateData.claimed_at = new Date().toISOString()
    if (additionalData?.donor_id) updateData.donor_id = additionalData.donor_id
    if (additionalData?.donor_note) updateData.donor_note = additionalData.donor_note
  } else if (status === 'fulfilled') {
    updateData.fulfilled_at = new Date().toISOString()
  } else if (status === 'denied') {
    updateData.denied_at = new Date().toISOString()
    if (additionalData?.denial_reason) updateData.denial_reason = additionalData.denial_reason
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// CAMPAIGN FUNCTIONS
// ============================================

export interface CampaignData {
  organization_id: string
  created_by: string
  title: string
  creator_name?: string
  creator_role?: string
  cause_area_ids?: string[]
  funding_goal: number
  short_description?: string
  story_title?: string
  story_content?: string
  contact_email: string
  image_url?: string
  logo_url?: string
  phone?: string | null
  // Social media links
  facebook_url?: string | null
  twitter_url?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
  youtube_url?: string | null
  tiktok_url?: string | null
  website_url?: string | null
}

// Create a new campaign
export const createCampaign = async (campaignData: CampaignData) => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      ...campaignData,
      status: 'pending',
      amount_raised: 0,
      supporters_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get campaign by slug or id
export const getCampaignBySlug = async (slugOrId: string) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      `
      *,
      organization:organizations(id, name, slug, mission, logo_url)
    `
    )
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .single()

  if (error) throw error
  return data
}

// Get campaigns by organization
export const getCampaignsByOrganization = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Update campaign
export const updateCampaign = async (
  campaignId: string,
  updates: Partial<CampaignData> & { status?: string }
) => {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get active campaigns (for public listing)
// includePending: also show pending campaigns. Default false so unapproved
// campaigns aren't visible on the public Browse page.
export const getActiveCampaigns = async (limit: number = 10, includePending: boolean = false) => {
  let query = supabase.from('campaigns').select(`
      *,
      organization:organizations(id, name, slug, logo_url)
    `)

  if (includePending) {
    // Show both active and pending campaigns
    query = query.in('status', ['active', 'pending'])
  } else {
    // Only show active campaigns
    query = query.eq('status', 'active')
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) throw error
  return data || []
}

// Upload campaign image
export const uploadCampaignImage = async (file: File, campaignId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${campaignId}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('campaign-images')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('campaign-images').getPublicUrl(fileName)

  return urlData.publicUrl
}

// Question type for dashboard
export interface OrganizationQuestion {
  id: string
  campaign_id: string
  campaign_title: string
  question: string
  submitter_name: string | null
  submitter_email: string | null
  status: 'pending' | 'answered' | 'rejected'
  answer: string | null
  is_public: boolean
  created_at: string
  answered_at: string | null
  answered_by: string | null
}

// Fetch all questions for an organization's campaigns
export const fetchOrganizationQuestions = async (
  organizationId: string
): Promise<OrganizationQuestion[]> => {
  // Get all campaigns for this org
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('id, title')
    .eq('organization_id', organizationId)

  if (campaignsError) {
    console.error('Error fetching campaigns:', campaignsError)
    return []
  }

  if (!campaigns?.length) return []

  const campaignIds = campaigns.map((c) => c.id)

  // Get all questions for these campaigns
  const { data: questions, error: questionsError } = await (
    (supabase as any).from('campaign_questions')
  )
    .select('*')
    .in('campaign_id', campaignIds)
    .order('created_at', { ascending: false })

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
    return []
  }

  // Join campaign titles to questions
  return (questions || []).map((q: any) => ({
    ...q,
    campaign_title: campaigns.find((c) => c.id === q.campaign_id)?.title || 'Unknown Campaign',
  }))
}

// Answer a question
export const answerQuestion = async (
  questionId: string,
  answer: string,
  isPublic: boolean,
  userId: string
) => {
  const { error } = await ((supabase as any).from('campaign_questions'))
    .update({
      answer: answer.trim(),
      status: 'answered',
      is_public: isPublic,
      answered_at: new Date().toISOString(),
      answered_by: userId,
    })
    .eq('id', questionId)

  if (error) throw error
}

// Dismiss/reject a question
export const dismissQuestion = async (questionId: string) => {
  const { error } = await ((supabase as any).from('campaign_questions'))
    .update({ status: 'rejected' })
    .eq('id', questionId)

  if (error) throw error
}

// ============================================
// DONOR DOCUMENTS
// ============================================

export interface DonorDocument {
  id: string
  user_id: string
  name: string
  type: string // 'tax_receipt' | 'annual_summary' | 'quarterly_statement'
  size: string
  file_url: string | null
  year: number
  quarter: number | null
  status: string
  created_at: string
  // Extended fields for receipts
  organization_id?: string
  organization_name?: string
  organization_ein?: string
  donation_amount?: number
  donation_date?: string
  receipt_number?: string
  request_id?: string
  campaign_id?: string
  donor_name?: string
  donor_email?: string
}

export const fetchDonorDocuments = async (userId: string): Promise<DonorDocument[]> => {
  const { data, error } = await ((supabase as any).from('donor_documents'))
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ready')
    .order('year', { ascending: false })
    .order('donation_date', { ascending: false })

  if (error) {
    console.error('Error fetching donor documents:', error)
    return []
  }
  return data || []
}

/**
 * Get download URL for a document
 */
export const getDocumentDownloadUrl = async (documentId: string): Promise<string | null> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const response = await fetch(`${apiUrl}/api/documents/download/${documentId}`)

    if (!response.ok) {
      console.error('Error fetching download URL')
      return null
    }

    const data = await response.json()
    return data.url || null
  } catch (error) {
    console.error('Error getting document download URL:', error)
    return null
  }
}

/**
 * Generate annual summary for a donor
 */
export const generateAnnualSummary = async (
  donorId: string,
  year: number
): Promise<DonorDocument | null> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const response = await fetch(`${apiUrl}/api/documents/generate-annual-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donorId, year }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate summary')
    }

    const data = await response.json()
    return data.document || null
  } catch (error) {
    console.error('Error generating annual summary:', error)
    throw error
  }
}

// ============================================
// DONOR IMPACT DATA
// ============================================

export interface DonorImpactSummary {
  total_donated: number
  lives_impacted: number
  organizations_helped: number
  months_active: number
}

export interface DonorImpactByCause {
  name: string
  amount: number
  percentage: number
}

export interface DonorMonthlyDonation {
  month: string
  amount: number
}

export interface DonorImpactStory {
  description: string
  organization_name: string
  created_at: string
}

export interface DonorImpactData {
  summary: DonorImpactSummary
  topCauses: DonorImpactByCause[]
  monthlyData: DonorMonthlyDonation[]
  recentImpact: DonorImpactStory[]
}

export const fetchDonorImpactData = async (userId: string): Promise<DonorImpactData | null> => {
  try {
    // Fetch summary
    const { data: summaryData } = await ((supabase as any).from('donor_impact_summary'))
      .select('*')
      .eq('user_id', userId)
      .single()

    // Fetch impact by cause with cause area names
    const { data: causeData } = await ((supabase as any).from('donor_impact_by_cause'))
      .select(
        `
        amount,
        percentage,
        cause_area:cause_areas(name)
      `
      )
      .eq('user_id', userId)
      .order('percentage', { ascending: false })

    // Fetch monthly donations
    const { data: monthlyData } = await ((supabase as any).from('donor_monthly_donations'))
      .select('month, amount')
      .eq('user_id', userId)
      .order('year', { ascending: true })

    // Fetch impact stories
    const { data: storiesData } = await ((supabase as any).from('donor_impact_stories'))
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(4)

    return {
      summary: summaryData || {
        total_donated: 0,
        lives_impacted: 0,
        organizations_helped: 0,
        months_active: 0,
      },
      topCauses: (causeData || []).map((c: any) => ({
        name: c.cause_area?.name || 'Unknown',
        amount: c.amount,
        percentage: c.percentage,
      })),
      monthlyData: monthlyData || [],
      recentImpact: storiesData || [],
    }
  } catch (error) {
    console.error('Error fetching donor impact data:', error)
    return null
  }
}

// ============================================
// SUPPORT FAQS AND CONTACT INFO
// ============================================

export interface SupportFAQ {
  id: string
  question: string
  answer: string
  category: string
  user_type: string
  sort_order: number
}

export interface SupportContactInfo {
  id: string
  type: string
  label: string
  value: string
  description: string | null
  sort_order: number
}

export const fetchSupportFAQs = async (
  userType: 'donor' | 'cbo' | 'all' = 'all'
): Promise<SupportFAQ[]> => {
  let query = ((supabase as any).from('support_faqs'))
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (userType !== 'all') {
    query = query.or(`user_type.eq.${userType},user_type.eq.all`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching support FAQs:', error)
    return []
  }
  return data || []
}

export const fetchSupportContactInfo = async (): Promise<SupportContactInfo[]> => {
  const { data, error } = await ((supabase as any).from('support_contact_info'))
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching support contact info:', error)
    return []
  }
  return data || []
}

// ============================================
// DONOR YEARLY SUMMARY (calculated from donations)
// ============================================

export interface DonorYearlySummary {
  year: number
  total_donations: number
  donation_count: number
  tax_deductible: number
}

export const fetchDonorYearlySummary = async (userId: string): Promise<DonorYearlySummary[]> => {
  // This calculates yearly summaries from the requests table where donor_id matches
  const { data, error } = await supabase
    .from('requests')
    .select('amount, fulfilled_at')
    .eq('donor_id', userId)
    .eq('status', 'fulfilled')
    .not('fulfilled_at', 'is', null)

  if (error) {
    console.error('Error fetching donor yearly summary:', error)
    return []
  }

  // Group by year
  const yearlyData: Record<number, { total: number; count: number }> = {}

  for (const req of data || []) {
    if (req.fulfilled_at) {
      const year = new Date(req.fulfilled_at).getFullYear()
      if (!yearlyData[year]) {
        yearlyData[year] = { total: 0, count: 0 }
      }
      yearlyData[year].total += Number(req.amount) || 0
      yearlyData[year].count += 1
    }
  }

  return Object.entries(yearlyData)
    .map(([year, data]) => ({
      year: parseInt(year),
      total_donations: data.total,
      donation_count: data.count,
      tax_deductible: data.total, // All donations are tax deductible
    }))
    .sort((a, b) => b.year - a.year)
}

// ============================================
// ORGANIZATION PROFILE FUNCTIONS
// ============================================

export interface OrganizationProfile {
  id: string
  user_id: string
  name: string
  website: string | null
  mission: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipcode: string
  ein: string | null
  logo_url: string | null
  logo_emoji: string
  tagline: string | null
  organization_type: string | null
  organization_size: string | null
  year_founded: number | null
  technology_barriers: string | null
  cover_image_url: string | null
  social_links: Record<string, string> | null
  program_description: string | null
  service_area_description: string | null
  ages_served: string[] | null
  pre_eligibility_status: string | null
  created_at: string
  updated_at: string
  cause_areas?: { id: string; name: string }[]
  populations?: { id: string; name: string }[]
  user_profile?: { is_vetted: boolean }
}

export interface OrganizationUpdate {
  id: string
  organization_id: string
  title: string
  content: string
  image_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface OrganizationTeamMember {
  id: string
  organization_id: string
  name: string
  role: string | null
  bio: string | null
  photo_url: string | null
  email: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

// Fetch organization by ID or slug with related data.
// Callers pass either the row's primary key (e.g. "org-harvesters") or the
// public slug (e.g. "harvesters") — we look up by whichever matches.
export const fetchOrganizationProfile = async (
  organizationIdOrSlug: string
): Promise<OrganizationProfile | null> => {
  const { data: org, error } = await supabase
    .from('organizations')
    .select(
      `
      *,
      user_profile:user_profiles!organizations_user_id_fkey(is_vetted)
    `
    )
    .or(`id.eq.${organizationIdOrSlug},slug.eq.${organizationIdOrSlug}`)
    .maybeSingle()

  if (error || !org) {
    if (error) console.error('Error fetching organization:', error)
    return null
  }

  const organizationId = (org as any).id

  // Fetch cause areas
  const { data: causeAreaLinks } = await supabase
    .from('organization_cause_areas')
    .select('cause_area_id')
    .eq('organization_id', organizationId)

  let causeAreas: { id: string; name: string }[] = []
  if (causeAreaLinks && causeAreaLinks.length > 0) {
    const causeAreaIds = causeAreaLinks.map((ca) => ca.cause_area_id)
    const { data: causes } = await supabase
      .from('cause_areas')
      .select('id, name')
      .in('id', causeAreaIds)
    causeAreas = causes || []
  }

  // Fetch populations served
  const { data: populationLinks } = await ((supabase as any).from('organization_populations'))
    .select('identity_category_id')
    .eq('organization_id', organizationId)

  let populations: { id: string; name: string }[] = []
  if (populationLinks && populationLinks.length > 0) {
    const populationIds = populationLinks.map((p: any) => p.identity_category_id)
    const { data: pops } = await supabase
      .from('identity_categories')
      .select('id, name')
      .in('id', populationIds)
    populations = pops || []
  }

  return {
    ...org,
    cause_areas: causeAreas,
    populations: populations,
  } as unknown as OrganizationProfile
}

// Fetch organization by user ID
export const fetchOrganizationByUserId = async (
  userId: string
): Promise<OrganizationProfile | null> => {
  const { data: org, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !org) {
    return null
  }

  return fetchOrganizationProfile(org.id)
}

// Fetch organization's requests
export const fetchOrganizationRequests = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(
      `
      *,
      cause_area:cause_areas(id, name)
    `
    )
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization requests:', error)
    return []
  }

  return data || []
}

// Fetch organization updates
export const fetchOrganizationUpdates = async (
  organizationId: string
): Promise<OrganizationUpdate[]> => {
  const { data, error } = await ((supabase as any).from('organization_updates'))
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization updates:', error)
    return []
  }

  return data || []
}

// Fetch organization team members
export const fetchOrganizationTeamMembers = async (
  organizationId: string
): Promise<OrganizationTeamMember[]> => {
  const { data, error } = await ((supabase as any).from('organization_team_members'))
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data || []
}

// Update organization profile
export const updateOrganizationProfile = async (
  organizationId: string,
  updates: Partial<OrganizationProfile>
) => {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating organization:', error)
    throw error
  }

  return data
}

// Create organization update (news post)
export const createOrganizationUpdate = async (update: {
  organization_id: string
  title: string
  content: string
  image_url?: string
  is_published?: boolean
}) => {
  const { data, error } = await ((supabase as any).from('organization_updates'))
    .insert({
      ...update,
      id: crypto.randomUUID(),
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating organization update:', error)
    throw error
  }

  return data
}

// Create organization team member
export const createOrganizationTeamMember = async (member: {
  organization_id: string
  name: string
  role?: string | null
  bio?: string | null
  photo_url?: string | null
  email?: string | null
  display_order?: number
  is_active?: boolean
}) => {
  const { data, error } = await ((supabase as any).from('organization_team_members'))
    .insert({
      ...member,
      id: crypto.randomUUID(),
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating team member:', error)
    throw error
  }

  return data
}

// Update organization team member
export const updateOrganizationTeamMember = async (
  memberId: string,
  updates: Partial<OrganizationTeamMember>
) => {
  const { data, error } = await ((supabase as any).from('organization_team_members'))
    .update(updates)
    .eq('id', memberId)
    .select()
    .single()

  if (error) {
    console.error('Error updating team member:', error)
    throw error
  }

  return data
}

// Delete organization team member (soft delete)
export const deleteOrganizationTeamMember = async (memberId: string) => {
  const { error } = await ((supabase as any).from('organization_team_members'))
    .update({ is_active: false })
    .eq('id', memberId)

  if (error) {
    console.error('Error deleting team member:', error)
    throw error
  }
}

// Save organization populations
export const saveOrganizationPopulations = async (
  organizationId: string,
  populationIds: string[]
) => {
  // Delete existing populations
  await ((supabase as any).from('organization_populations'))
    .delete()
    .eq('organization_id', organizationId)

  if (populationIds.length === 0) return []

  // Insert new populations
  const records = populationIds.map((id) => ({
    organization_id: organizationId,
    identity_category_id: id,
  }))

  const { data, error } = await ((supabase as any).from('organization_populations'))
    .insert(records)
    .select()

  if (error) {
    console.error('Error saving populations:', error)
    throw error
  }

  return data
}

// Fetch identity categories (for population selection)
export const fetchIdentityCategories = async () => {
  const { data, error } = await supabase
    .from('identity_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching identity categories:', error)
    return []
  }

  return data || []
}

// ============================================
// CAMPAIGN REPORTS
// ============================================

export type CampaignReportReason = 'fraud' | 'inappropriate' | 'spam' | 'misleading' | 'other'

export interface CampaignReportData {
  campaign_id: string
  reporter_id?: string | null
  reporter_email?: string | null
  reason: CampaignReportReason
  description?: string | null
}

export interface CampaignReport extends CampaignReportData {
  id: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  admin_notes?: string | null
  resolved_by?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

// Submit a campaign report
export const submitCampaignReport = async (
  reportData: CampaignReportData
): Promise<CampaignReport> => {
  const { data, error } = await ((supabase as any).from('campaign_reports'))
    .insert({
      campaign_id: reportData.campaign_id,
      reporter_id: reportData.reporter_id || null,
      reporter_email: reportData.reporter_email || null,
      reason: reportData.reason,
      description: reportData.description || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting campaign report:', error)
    throw error
  }

  return data
}

// Fetch campaign reports (for admin)
export const fetchCampaignReports = async (status?: string): Promise<CampaignReport[]> => {
  let query = ((supabase as any).from('campaign_reports'))
    .select(
      `
      *,
      campaign:campaigns(id, title, slug, organization_id)
    `
    )
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching campaign reports:', error)
    return []
  }

  return data || []
}

// Update campaign report status (for admin)
export const updateCampaignReportStatus = async (
  reportId: string,
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed',
  adminId?: string,
  adminNotes?: string
): Promise<CampaignReport | null> => {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'resolved' || status === 'dismissed') {
    updates.resolved_by = adminId
    updates.resolved_at = new Date().toISOString()
  }

  if (adminNotes) {
    updates.admin_notes = adminNotes
  }

  const { data, error } = await ((supabase as any).from('campaign_reports'))
    .update(updates)
    .eq('id', reportId)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign report:', error)
    throw error
  }

  return data
}

// ============================================
// PLATFORM SETTINGS
// ============================================

export interface PlatformSetting {
  id: string
  key: string
  value: string
  value_type: 'string' | 'boolean' | 'number' | 'json'
  description: string | null
  updated_by: string | null
  updated_at: string
}

// Fetch all platform settings
export const fetchPlatformSettings = async (): Promise<Record<string, any>> => {
  const { data, error } = await ((supabase as any).from('platform_settings')).select('*')

  if (error) {
    console.error('Error fetching platform settings:', error)
    return {}
  }

  // Convert to key-value object with proper types
  const settings: Record<string, any> = {}
  for (const setting of data || []) {
    let value: any = setting.value
    if (setting.value_type === 'boolean') {
      value = setting.value === 'true'
    } else if (setting.value_type === 'number') {
      value = Number(setting.value)
    } else if (setting.value_type === 'json') {
      try {
        value = JSON.parse(setting.value)
      } catch {
        value = setting.value
      }
    }
    settings[setting.key] = value
  }

  return settings
}

// Update a platform setting
export const updatePlatformSetting = async (
  key: string,
  value: any,
  adminId?: string
): Promise<void> => {
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

  const { error } = await ((supabase as any).from('platform_settings'))
    .update({
      value: stringValue,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)

  if (error) {
    console.error('Error updating platform setting:', error)
    throw error
  }
}

// Update multiple platform settings at once
export const updatePlatformSettings = async (
  settings: Record<string, any>,
  adminId?: string
): Promise<void> => {
  for (const [key, value] of Object.entries(settings)) {
    await updatePlatformSetting(key, value, adminId)
  }
}

// ============================================
// HISTORICAL DATA FOR ANALYTICS
// ============================================

export interface MonthlyDataPoint {
  month: string
  year: number
  count: number
  amount?: number
}

// Fetch user growth data (users created per month)
export const fetchUserGrowthData = async (months: number = 6): Promise<MonthlyDataPoint[]> => {
  const { data, error } = await ((supabase as any).from('user_profiles'))
    .select('created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching user growth data:', error)
    return []
  }

  // Group by month
  const monthCounts: Record<string, number> = {}
  const now = new Date()

  // Initialize last N months with 0
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthCounts[key] = 0
  }

  // Count users per month
  for (const user of data || []) {
    const date = new Date(user.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (key in monthCounts) {
      monthCounts[key]++
    }
  }

  // Convert to array format
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return Object.entries(monthCounts).map(([key, count]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      month: monthNames[month - 1],
      year,
      count,
    }
  })
}

// Fetch donation trends data (fulfilled requests per month with amounts)
export const fetchDonationTrendsData = async (months: number = 6): Promise<MonthlyDataPoint[]> => {
  const { data, error } = await ((supabase as any).from('requests'))
    .select('fulfilled_at, amount, status')
    .eq('status', 'fulfilled')
    .not('fulfilled_at', 'is', null)
    .order('fulfilled_at', { ascending: true })

  if (error) {
    console.error('Error fetching donation trends:', error)
    return []
  }

  // Group by month
  const monthData: Record<string, { count: number; amount: number }> = {}
  const now = new Date()

  // Initialize last N months with 0
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthData[key] = { count: 0, amount: 0 }
  }

  // Sum donations per month
  for (const request of data || []) {
    if (request.fulfilled_at) {
      const date = new Date(request.fulfilled_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (key in monthData) {
        monthData[key].count++
        monthData[key].amount += Number(request.amount || 0)
      }
    }
  }

  // Convert to array format
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return Object.entries(monthData).map(([key, data]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      month: monthNames[month - 1],
      year,
      count: data.count,
      amount: data.amount,
    }
  })
}

// ============================================
// ADMIN ACTIVITY LOG
// ============================================

export interface AdminActivity {
  id: string
  admin_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, any> | null
  created_at: string
}

// Log admin activity
export const logAdminActivity = async (
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> => {
  const { error } = await ((supabase as any).from('admin_activity_log')).insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  })

  if (error) {
    console.error('Error logging admin activity:', error)
    // Don't throw - activity logging shouldn't break the main operation
  }
}

// Fetch recent admin activity
export const fetchAdminActivity = async (limit: number = 20): Promise<AdminActivity[]> => {
  const { data, error } = await ((supabase as any).from('admin_activity_log'))
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching admin activity:', error)
    return []
  }

  return data || []
}

// ============================================
// ORGANIZATION DOCUMENTS
// ============================================

export interface OrganizationDocument {
  id: string
  organization_id: string
  uploaded_by: string
  name: string
  type: string // 'tax_exempt' | '501c3' | 'annual_report' | 'financial_statement' | 'audit_report' | 'bylaws' | 'insurance' | 'other'
  size: string | null
  file_url: string | null
  year: number | null
  status: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export const ORGANIZATION_DOCUMENT_TYPES = [
  { value: 'tax_exempt', label: 'Tax Exempt Certificate' },
  { value: '501c3', label: '501(c)(3) Determination Letter' },
  { value: 'annual_report', label: 'Annual Report' },
  { value: 'financial_statement', label: 'Financial Statement' },
  { value: 'audit_report', label: 'Audit Report' },
  { value: 'board_minutes', label: 'Board Minutes' },
  { value: 'bylaws', label: 'Organization Bylaws' },
  { value: 'insurance', label: 'Insurance Certificate' },
  { value: 'other', label: 'Other' },
] as const

/**
 * Fetch all documents for an organization
 */
export const fetchOrganizationDocuments = async (
  organizationId: string
): Promise<OrganizationDocument[]> => {
  const { data, error } = await ((supabase as any).from('organization_documents'))
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization documents:', error)
    return []
  }
  return data || []
}

/**
 * Upload a document for an organization
 */
export const uploadOrganizationDocument = async (
  organizationId: string,
  uploadedBy: string,
  file: File,
  metadata: {
    name: string
    type: string
    year?: number
    description?: string
    is_public?: boolean
  }
): Promise<OrganizationDocument | null> => {
  try {
    // Upload file to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${organizationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from('organization-documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('organization-documents').getPublicUrl(fileName)

    // Create document record
    const { data, error } = await ((supabase as any).from('organization_documents'))
      .insert({
        organization_id: organizationId,
        uploaded_by: uploadedBy,
        name: metadata.name,
        type: metadata.type,
        size: formatFileSize(file.size),
        file_url: urlData.publicUrl,
        year: metadata.year || new Date().getFullYear(),
        status: 'ready',
        description: metadata.description || null,
        is_public: metadata.is_public || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating document record:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error uploading organization document:', error)
    return null
  }
}

/**
 * Delete an organization document
 */
export const deleteOrganizationDocument = async (documentId: string): Promise<boolean> => {
  try {
    // Get the document first to get the file URL
    const { data: doc } = await ((supabase as any).from('organization_documents'))
      .select('file_url')
      .eq('id', documentId)
      .single()

    if (doc?.file_url) {
      // Extract file path from URL and delete from storage
      const url = new URL(doc.file_url)
      const filePath = url.pathname.split('/organization-documents/')[1]
      if (filePath) {
        await supabase.storage.from('organization-documents').remove([filePath])
      }
    }

    // Delete document record
    const { error } = await ((supabase as any).from('organization_documents'))
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting organization document:', error)
    return false
  }
}

/**
 * Update document metadata
 */
export const updateOrganizationDocument = async (
  documentId: string,
  updates: Partial<
    Pick<OrganizationDocument, 'name' | 'type' | 'year' | 'description' | 'is_public'>
  >
): Promise<OrganizationDocument | null> => {
  const { data, error } = await ((supabase as any).from('organization_documents'))
    .update(updates)
    .eq('id', documentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    return null
  }

  return data
}

/**
 * Helper function to format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================
// OURS-ONLY HELPERS (Phase 7, 8, 8.5, 9)
// ============================================

// Fetch a single request by ID with full detail joins (Phase 8.5)
export const fetchRequestById = async (id: string): Promise<any> => {
  const { data, error } = await (supabase as any)
    .from('requests')
    .select(`
      *,
      organization:organizations(id, name, logo_url, logo_emoji, zipcode, mission, website, user_id),
      cause_area:cause_areas(*),
      challenge_categories:request_challenge_categories(category:challenge_categories(*)),
      identity_categories:request_identity_categories(category:identity_categories(*)),
      in_kind_pledge:in_kind_pledges!requests_pledge_id_fkey(
        id, pledge_status, device_breakdown, donor_notes, delivery_address, donor_id
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Fetch filtered requests with pagination
export const fetchFilteredRequests = async (params: {
  causeAreaId?: string
  urgency?: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
  donationType?: string
}): Promise<{ requests: any[]; total: number }> => {
  const { causeAreaId, urgency, status = 'open', search, page = 1, pageSize = 12, donationType } = params

  let query = (supabase as any)
    .from('requests')
    .select(
      `
      *,
      organization:organizations(id, name, logo_url, logo_emoji, zipcode),
      cause_area:cause_areas(id, name)
    `,
      { count: 'exact' }
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (causeAreaId) query = query.eq('cause_area_id', causeAreaId)
  if (urgency) query = query.eq('urgency', urgency)
  if (search) query = query.ilike('description', `%${search}%`)
  if (donationType === 'in_kind') {
    query = query.eq('donation_type', 'in_kind')
  } else if (donationType === 'cash') {
    query = query.or('donation_type.eq.cash,donation_type.is.null')
  }

  const { data, error, count } = await query
  if (error) throw error
  return { requests: data ?? [], total: count ?? 0 }
}

// Fetch a single organization by ID with full join data (Phase 7)
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

/**
 * Phase 9: fetch the cause-area IDs this donor has subscribed to for match alerts.
 * @param donorId — Clerk user ID (TEXT, e.g. "user_abc")
 * Returns an empty array when no subscriptions exist; never throws on empty result.
 */
export const fetchDonorCauseAreas = async (donorId: string): Promise<string[]> => {
  const { data, error } = await (supabase as any)
    .from('donor_cause_areas')
    .select('cause_area_id')
    .eq('donor_id', donorId)

  if (error) throw error
  return (data ?? []).map((row: { cause_area_id: string }) => row.cause_area_id)
}

/**
 * Phase 9: atomically replace this donor's cause-area subscriptions.
 * Uses the `set_donor_cause_areas` Postgres RPC (SECURITY DEFINER) so DELETE+INSERT
 * runs inside a single transaction and silent partial loss is impossible.
 * Passing an empty array clears all subscriptions (opt-out).
 */
export const upsertDonorCauseAreas = async (
  donorId: string,
  causeAreaIds: string[]
): Promise<void> => {
  const { error } = await (supabase as any).rpc('set_donor_cause_areas', {
    p_donor_id: donorId,
    p_cause_area_ids: causeAreaIds,
  })
  if (error) throw error
}

/**
 * Phase 8.5 polish: fetch in-kind pledges this donor submitted that were rejected.
 * After rejection, `requests.donor_id` is NULL so `fetchDonorRequests` no longer
 * returns these — query `in_kind_pledges` directly.
 */
export const fetchDonorRejectedPledges = async (userId: string): Promise<any[]> => {
  const { data, error } = await (supabase as any)
    .from('in_kind_pledges')
    .select(
      'id, request_id, device_breakdown, donor_notes, pledge_status, created_at, request:requests(id, description, status, organization:organizations(name, logo_url, logo_emoji))'
    )
    .eq('donor_id', userId)
    .eq('pledge_status', 'rejected')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Fetch all requests where user was the donor (including in-kind pledge join)
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
