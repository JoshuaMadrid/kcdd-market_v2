/**
 * Organization About Tab Component
 * Displays mission, populations served, technology barriers, program description
 */

import { AlertTriangle, Users, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OrganizationProfile } from '@/lib/supabase'

interface OrganizationAboutTabProps {
  organization: OrganizationProfile
}

export function OrganizationAboutTab({ organization }: OrganizationAboutTabProps) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Mission */}
      <section>
        <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4">Our Mission</h2>
        <p className="text-base text-[#0a0a0a] leading-relaxed">
          {organization.mission}
        </p>
      </section>

      {/* Tagline */}
      {organization.tagline && (
        <section>
          <p className="text-lg text-[#737373] italic border-l-4 border-[#ea580c] pl-4">
            "{organization.tagline}"
          </p>
        </section>
      )}

      {/* Populations Served */}
      {organization.populations && organization.populations.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#1b5858]" />
            Populations We Serve
          </h3>
          <div className="flex flex-wrap gap-2">
            {organization.populations.map((pop) => (
              <Badge
                key={pop.id}
                variant="secondary"
                className="bg-[#1b5858]/10 text-[#1b5858] font-normal px-3 py-1"
              >
                {pop.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Technology Barriers */}
      {organization.technology_barriers && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">
                Technology Challenges
              </h3>
              <p className="text-base text-[#0a0a0a] leading-relaxed">
                {organization.technology_barriers}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Program Description */}
      {organization.program_description && (
        <section>
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-3">Our Programs</h3>
          <p className="text-base text-[#0a0a0a] leading-relaxed whitespace-pre-line">
            {organization.program_description}
          </p>
        </section>
      )}

      {/* Service Area */}
      {organization.service_area_description && (
        <section>
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#1b5858]" />
            Service Area
          </h3>
          <p className="text-base text-[#0a0a0a] leading-relaxed">
            {organization.service_area_description}
          </p>
        </section>
      )}

      {/* Organization Details Grid */}
      <section className="bg-[#f5f5f5] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">Organization Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {organization.organization_type && (
            <div>
              <p className="text-sm text-[#737373]">Organization Type</p>
              <p className="text-base font-medium text-[#0a0a0a]">
                {organization.organization_type}
              </p>
            </div>
          )}
          {organization.organization_size && (
            <div>
              <p className="text-sm text-[#737373]">Organization Size</p>
              <p className="text-base font-medium text-[#0a0a0a]">
                {organization.organization_size}
              </p>
            </div>
          )}
          {organization.year_founded && (
            <div>
              <p className="text-sm text-[#737373]">Year Founded</p>
              <p className="text-base font-medium text-[#0a0a0a]">
                {organization.year_founded}
              </p>
            </div>
          )}
          {organization.ein && (
            <div>
              <p className="text-sm text-[#737373]">EIN</p>
              <p className="text-base font-medium text-[#0a0a0a]">
                {organization.ein}
              </p>
            </div>
          )}
          {organization.zipcode && (
            <div>
              <p className="text-sm text-[#737373]">Primary Location</p>
              <p className="text-base font-medium text-[#0a0a0a]">
                {organization.address || organization.zipcode}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
