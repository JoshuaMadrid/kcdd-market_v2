export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cause_areas: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      challenge_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      identity_categories: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_type: 'admin' | 'cbo' | 'donor'
          phone: string | null
          is_vetted: boolean
          vetting_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_type?: 'admin' | 'cbo' | 'donor'
          phone?: string | null
          is_vetted?: boolean
          vetting_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_type?: 'admin' | 'cbo' | 'donor'
          phone?: string | null
          is_vetted?: boolean
          vetting_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          user_id: string
          name: string
          website: string | null
          mission: string
          email: string
          phone: string | null
          address: string | null
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          website?: string | null
          mission: string
          email: string
          phone?: string | null
          address?: string | null
          zipcode: string
          ein?: string | null
          logo_url?: string | null
          logo_emoji?: string
          tagline?: string | null
          organization_type?: string | null
          organization_size?: string | null
          year_founded?: number | null
          technology_barriers?: string | null
          cover_image_url?: string | null
          social_links?: Record<string, string> | null
          program_description?: string | null
          service_area_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          website?: string | null
          mission?: string
          email?: string
          phone?: string | null
          address?: string | null
          zipcode?: string
          ein?: string | null
          logo_url?: string | null
          logo_emoji?: string
          tagline?: string | null
          organization_type?: string | null
          organization_size?: string | null
          year_founded?: number | null
          technology_barriers?: string | null
          cover_image_url?: string | null
          social_links?: Record<string, string> | null
          program_description?: string | null
          service_area_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donor_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          bio: string | null
          profile_picture_url: string | null
          name: string
          email: string
          phone: string | null
          max_per_request: number
          service_area_zipcode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          bio?: string | null
          profile_picture_url?: string | null
          name: string
          email: string
          phone?: string | null
          max_per_request?: number
          service_area_zipcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          bio?: string | null
          profile_picture_url?: string | null
          name?: string
          email?: string
          phone?: string | null
          max_per_request?: number
          service_area_zipcode?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          organization_id: string
          cause_area_id: string
          donor_id: string | null
          description: string
          amount: number
          urgency: 'low' | 'medium' | 'high'
          zipcode: string
          program_region_metro: string | null
          program_region_county: string | null
          status: 'open' | 'claimed' | 'fulfilled' | 'denied'
          donor_note: string | null
          denial_reason: string | null
          payment_intent_id: string | null
          created_at: string
          updated_at: string
          claimed_at: string | null
          fulfilled_at: string | null
          denied_at: string | null
          refunded_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          cause_area_id: string
          donor_id?: string | null
          description: string
          amount: number
          urgency?: 'low' | 'medium' | 'high'
          zipcode: string
          program_region_metro?: string | null
          program_region_county?: string | null
          status?: 'open' | 'claimed' | 'fulfilled' | 'denied'
          donor_note?: string | null
          denial_reason?: string | null
          payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
          claimed_at?: string | null
          fulfilled_at?: string | null
          denied_at?: string | null
          refunded_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          cause_area_id?: string
          donor_id?: string | null
          description?: string
          amount?: number
          urgency?: 'low' | 'medium' | 'high'
          zipcode?: string
          program_region_metro?: string | null
          program_region_county?: string | null
          status?: 'open' | 'claimed' | 'fulfilled' | 'denied'
          donor_note?: string | null
          denial_reason?: string | null
          payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
          claimed_at?: string | null
          fulfilled_at?: string | null
          denied_at?: string | null
          refunded_at?: string | null
        }
      }
      organization_cause_areas: {
        Row: {
          id: string
          organization_id: string
          cause_area_id: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          cause_area_id: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          cause_area_id?: string
          created_at?: string
        }
      }
      request_challenge_categories: {
        Row: {
          id: string
          request_id: string
          challenge_category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          challenge_category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          challenge_category_id?: string
          created_at?: string
        }
      }
      request_identity_categories: {
        Row: {
          id: string
          request_id: string
          identity_category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          identity_category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          identity_category_id?: string
          created_at?: string
        }
      }
      fulfillment_records: {
        Row: {
          id: string
          request_id: string
          donor_id: string
          fulfillment_method: string | null
          tracking_number: string | null
          notes: string | null
          confirmed_by_cbo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          donor_id: string
          fulfillment_method?: string | null
          tracking_number?: string | null
          notes?: string | null
          confirmed_by_cbo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          donor_id?: string
          fulfillment_method?: string | null
          tracking_number?: string | null
          notes?: string | null
          confirmed_by_cbo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      request_history: {
        Row: {
          id: string
          request_id: string
          changed_by_id: string | null
          old_status: string | null
          new_status: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          changed_by_id?: string | null
          old_status?: string | null
          new_status: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          changed_by_id?: string | null
          old_status?: string | null
          new_status?: string
          note?: string | null
          created_at?: string
        }
      }
      stripe_events: {
        Row: {
          event_id: string
          event_type: string
          payload: Record<string, unknown> | null
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          payload?: Record<string, unknown> | null
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          payload?: Record<string, unknown> | null
          received_at?: string
        }
      }
      request_notifications: {
        Row: {
          id: string
          request_id: string
          notification_type: 'denied' | 'approved' | 'claimed' | 'fulfilled' | 'edited'
          title: string
          message: string
          recipient_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          notification_type: 'denied' | 'approved' | 'claimed' | 'fulfilled' | 'edited'
          title: string
          message: string
          recipient_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          notification_type?: 'denied' | 'approved' | 'claimed' | 'fulfilled' | 'edited'
          title?: string
          message?: string
          recipient_id?: string
          is_read?: boolean
          created_at?: string
        }
      }
      organization_populations: {
        Row: {
          id: string
          organization_id: string
          identity_category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          identity_category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          identity_category_id?: string
          created_at?: string
        }
      }
      organization_updates: {
        Row: {
          id: string
          organization_id: string
          title: string
          content: string
          image_url: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          content: string
          image_url?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          content?: string
          image_url?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organization_team_members: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          name: string
          role?: string | null
          bio?: string | null
          photo_url?: string | null
          email?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          role?: string | null
          bio?: string | null
          photo_url?: string | null
          email?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'admin' | 'cbo' | 'donor'
      request_status: 'open' | 'claimed' | 'fulfilled' | 'denied'
      urgency_level: 'low' | 'medium' | 'high'
    }
  }
}

