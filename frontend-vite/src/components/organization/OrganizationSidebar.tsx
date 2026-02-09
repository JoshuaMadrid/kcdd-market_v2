/**
 * Organization Sidebar Component
 * Displays organization info card with logo, stats, contact, and CTA
 */

import { MapPin, Globe, Mail, Phone, Users, Calendar, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrganizationLogo } from './OrganizationLogo'
import type { OrganizationProfile } from '@/lib/supabase'

interface OrganizationSidebarProps {
  organization: OrganizationProfile
  requestStats?: {
    open: number
    fulfilled: number
    totalRaised: number
  }
  showSupportButton?: boolean
}

export function OrganizationSidebar({
  organization,
  requestStats,
  showSupportButton = true
}: OrganizationSidebarProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="w-[340px] sticky top-6 p-6 space-y-6 border-[#f5f5f5] rounded-[10px]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <OrganizationLogo
          logoUrl={organization.logo_url}
          logoEmoji={organization.logo_emoji}
          name={organization.name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-[#0a0a0a] truncate">
            {organization.name}
          </h2>
          {organization.organization_type && (
            <p className="text-sm text-[#737373]">{organization.organization_type}</p>
          )}
          {organization.user_profile?.is_vetted && (
            <Badge className="mt-1 bg-[#d1fae5] text-[#059669] hover:bg-[#d1fae5]">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      {requestStats && (
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#f5f5f5]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0a0a0a]">{requestStats.open}</p>
            <p className="text-xs text-[#737373]">Open</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0a0a0a]">{requestStats.fulfilled}</p>
            <p className="text-xs text-[#737373]">Fulfilled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#ea580c]">
              {formatCurrency(requestStats.totalRaised)}
            </p>
            <p className="text-xs text-[#737373]">Raised</p>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-3">
        {organization.address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-[#737373] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-[#0a0a0a]">{organization.address}</span>
          </div>
        )}
        {organization.zipcode && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <span className="text-sm text-[#0a0a0a]">{organization.zipcode}</span>
          </div>
        )}
        {organization.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#ea580c] hover:underline truncate"
            >
              {organization.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {organization.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <a
              href={`mailto:${organization.email}`}
              className="text-sm text-[#0a0a0a] hover:text-[#ea580c]"
            >
              {organization.email}
            </a>
          </div>
        )}
        {organization.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <a
              href={`tel:${organization.phone}`}
              className="text-sm text-[#0a0a0a] hover:text-[#ea580c]"
            >
              {organization.phone}
            </a>
          </div>
        )}
      </div>

      {/* Organization Details */}
      <div className="space-y-3 py-4 border-y border-[#f5f5f5]">
        {organization.organization_size && (
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <span className="text-sm text-[#0a0a0a]">{organization.organization_size}</span>
          </div>
        )}
        {organization.year_founded && (
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <span className="text-sm text-[#0a0a0a]">Founded {organization.year_founded}</span>
          </div>
        )}
        {organization.ein && (
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-[#737373] flex-shrink-0" />
            <span className="text-sm text-[#737373]">EIN: {organization.ein}</span>
          </div>
        )}
      </div>

      {/* Cause Areas */}
      {organization.cause_areas && organization.cause_areas.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[#737373]">Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {organization.cause_areas.map((cause) => (
              <Badge
                key={cause.id}
                variant="secondary"
                className="bg-[#eaeaea] text-[#737373] font-normal"
              >
                {cause.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Support CTA */}
      {showSupportButton && (
        <Link to={`/requests?organization=${organization.id}`}>
          <Button className="w-full bg-[#ea580c] hover:bg-[#dc4c06] text-white rounded-full">
            Support This Organization
          </Button>
        </Link>
      )}
    </Card>
  )
}
