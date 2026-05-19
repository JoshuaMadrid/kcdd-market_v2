/**
 * Organization About Tab Component
 * Displays mission, populations served, technology needs, program description
 */

import { Lightbulb, Users, MapPin, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OrganizationProfile } from '@/lib/supabase'

interface OrganizationAboutTabProps {
  organization: OrganizationProfile
}

export function OrganizationAboutTab({ organization }: OrganizationAboutTabProps) {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Mission */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-[#0a0a0a]">
          <FileText className="h-6 w-6 text-[#1b5858]" />
          Our Mission
        </h2>
        <p className="text-base leading-relaxed text-[#0a0a0a]">{organization.mission}</p>
      </section>

      {/* Populations Served */}
      {organization.populations && organization.populations.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#0a0a0a]">
            <Users className="h-5 w-5 text-[#1b5858]" />
            Populations We Serve
          </h3>
          <div className="flex flex-wrap gap-2">
            {organization.populations.map((pop) => (
              <Badge
                key={pop.id}
                variant="secondary"
                className="bg-[#1b5858]/10 px-3 py-1 font-normal text-[#1b5858]"
              >
                {pop.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Program Description */}
      {organization.program_description && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-[#0a0a0a]">Our Programs</h3>
          <p className="whitespace-pre-line text-base leading-relaxed text-[#0a0a0a]">
            {organization.program_description}
          </p>
        </section>
      )}

      {/* Technology Needs - Restyled to be informative, not alarming */}
      {organization.technology_barriers && (
        <section className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[#0ea5e9]/10 p-2">
              <Lightbulb className="h-5 w-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#0a0a0a]">How You Can Help</h3>
              <p className="text-base leading-relaxed text-[#0a0a0a]">
                {organization.technology_barriers}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Service Area */}
      {organization.service_area_description && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#0a0a0a]">
            <MapPin className="h-5 w-5 text-[#1b5858]" />
            Service Area
          </h3>
          <p className="text-base leading-relaxed text-[#0a0a0a]">
            {organization.service_area_description}
          </p>
        </section>
      )}

      {/* Organization Details */}
      <section className="border-t border-[#f5f5f5] pt-6">
        <h3 className="mb-3 text-sm font-medium text-[#737373]">Organization Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {organization.organization_type && (
            <div>
              <p className="text-[#737373]">Organization Type</p>
              <p className="font-medium text-[#0a0a0a]">{organization.organization_type}</p>
            </div>
          )}
          {organization.organization_size && (
            <div>
              <p className="text-[#737373]">Organization Size</p>
              <p className="font-medium text-[#0a0a0a]">{organization.organization_size}</p>
            </div>
          )}
          {organization.year_founded && (
            <div>
              <p className="text-[#737373]">Year Founded</p>
              <p className="font-medium text-[#0a0a0a]">{organization.year_founded}</p>
            </div>
          )}
          {organization.ein && (
            <div>
              <p className="text-[#737373]">EIN</p>
              <p className="font-medium text-[#0a0a0a]">{organization.ein}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
