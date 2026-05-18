import { Globe, Mail, Phone, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrganizationLogo } from './OrganizationLogo'
import type { Database } from '@/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']
type CauseArea = Database['public']['Tables']['cause_areas']['Row']

interface OrganizationSidebarProps {
  organization: Organization
  causeAreas?: Array<{ cause_area: CauseArea }>
  requestCount?: number
  isVetted?: boolean
  isOwner?: boolean
  onSupportClick?: () => void
}

export function OrganizationSidebar({
  organization,
  causeAreas = [],
  requestCount = 0,
  isVetted = false,
  isOwner = false,
  onSupportClick,
}: OrganizationSidebarProps) {
  return (
    <Card className="border-[#f5f5f5] rounded-[10px] sticky top-6">
      <CardContent className="p-5 space-y-5">
        {/* Organization Identity */}
        <div className="flex items-start gap-3">
          <OrganizationLogo
            name={organization.name}
            logoUrl={organization.logo_url}
            logoEmoji={organization.logo_emoji}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-[#0a0a0a] truncate">
              {organization.name}
            </h2>
            {organization.organization_type && (
              <p className="text-sm text-[#737373]">{organization.organization_type}</p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {isVetted && (
          <Badge className="bg-[#d1fae5] text-[#059669] hover:bg-[#d1fae5]">
            Verified Organization
          </Badge>
        )}

        {/* Stats */}
        <div className="flex gap-4 py-2 border-y border-[#f5f5f5]">
          <div>
            <p className="text-2xl font-semibold text-[#0a0a0a]">{requestCount}</p>
            <p className="text-xs text-[#737373]">Active Requests</p>
          </div>
          {organization.year_founded && (
            <div>
              <p className="text-2xl font-semibold text-[#0a0a0a]">
                {new Date().getFullYear() - organization.year_founded}+
              </p>
              <p className="text-xs text-[#737373]">Years Active</p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-medium text-[#737373]">Contact</h3>

          {organization.website && (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#0a0a0a] hover:text-[#ea580c] transition-colors"
            >
              <Globe className="h-4 w-4 text-[#737373]" />
              <span className="truncate">{organization.website.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          )}

          {organization.email && (
            <a
              href={`mailto:${organization.email}`}
              className="flex items-center gap-2 text-sm text-[#0a0a0a] hover:text-[#ea580c] transition-colors"
            >
              <Mail className="h-4 w-4 text-[#737373]" />
              <span className="truncate">{organization.email}</span>
            </a>
          )}

          {organization.phone && (
            <a
              href={`tel:${organization.phone}`}
              className="flex items-center gap-2 text-sm text-[#0a0a0a] hover:text-[#ea580c] transition-colors"
            >
              <Phone className="h-4 w-4 text-[#737373]" />
              <span>{organization.phone}</span>
            </a>
          )}
        </div>

        {/* Location */}
        {(organization.address || organization.zipcode) && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-medium text-[#737373]">Location</h3>
            <div className="flex items-start gap-2 text-sm text-[#0a0a0a]">
              <MapPin className="h-4 w-4 text-[#737373] mt-0.5 flex-shrink-0" />
              <span>
                {organization.address && <span>{organization.address}, </span>}
                {organization.zipcode}
              </span>
            </div>
          </div>
        )}

        {/* Founded */}
        {organization.year_founded && (
          <div className="flex items-center gap-2 text-sm text-[#737373]">
            <Calendar className="h-4 w-4" />
            <span>Founded {organization.year_founded}</span>
          </div>
        )}

        {/* Cause Areas */}
        {causeAreas.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-medium text-[#737373]">Cause Areas</h3>
            <div className="flex flex-wrap gap-1.5">
              {causeAreas.map(({ cause_area }) => (
                <Badge
                  key={cause_area.id}
                  variant="outline"
                  className="text-xs"
                >
                  {cause_area.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button — hidden for org owners (no self-support) */}
        {!isOwner && (
          <Button
            className="w-full bg-[#ea580c] hover:bg-[#dc4c06] text-white rounded-full"
            onClick={onSupportClick}
            disabled={requestCount === 0}
          >
            {requestCount === 0 ? 'No Active Requests' : 'Support This Organization'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
