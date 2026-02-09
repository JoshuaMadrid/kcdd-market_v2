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

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: false, // We use Clerk for auth
      autoRefreshToken: false,
    },
  }
)

/**
 * Set Clerk JWT token for Supabase requests
 * Call this after user signs in with Clerk
 */
export const setSupabaseAuth = async (clerkToken: string | null) => {
  if (clerkToken) {
    // Set the authorization header for all future requests
    supabase.rest.headers['Authorization'] = `Bearer ${clerkToken}`
  } else {
    delete supabase.rest.headers['Authorization']
  }
}

/**
 * Helper to check if user is authenticated with Supabase
 */
export const isSupabaseAuthenticated = (): boolean => {
  return !!supabase.rest.headers['Authorization']
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

// Fetch all open requests
export const fetchOpenRequests = async () => {
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
  return data
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
export const claimRequest = async (requestId: string, donorId: string) => {
  const { data, error } = await supabase
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
export const createRequest = async (request: any) => {
  const { data, error } = await supabase
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
export const fetchOrganization = async (id: string) => {
  const { data, error } = await supabase
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
export const fetchOrganizationByUserId = async (userId: string) => {
  const { data, error } = await supabase
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
export const fetchOrganizationRequests = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      cause_area:cause_areas(*)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
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
export const updateOrganization = async (id: string, updates: any) => {
  const { data, error } = await supabase
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

