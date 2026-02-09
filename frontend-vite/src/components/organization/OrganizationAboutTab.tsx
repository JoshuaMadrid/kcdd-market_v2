import { Users, AlertTriangle, MapPin, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']
type IdentityCategory = Database['public']['Tables']['identity_categories']['Row']

interface OrganizationAboutTabProps {
  organization: Organization
  populations?: Array<{ category: IdentityCategory }>
}

export function OrganizationAboutTab({
  organization,
  populations = [],
}: OrganizationAboutTabProps) {
  return (
    <div className="space-y-8">
      {/* Mission Statement */}
      <section>
        <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#ea580c]" />
          Our Mission
        </h2>
        <p className="text-base text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">
          {organization.mission}
        </p>
      </section>

      {/* Populations Served */}
      {populations.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#ea580c]" />
            Who We Serve
          </h2>
          <div className="flex flex-wrap gap-2">
            {populations.map(({ category }) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-sm px-3 py-1"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Technology Barriers */}
      {organization.technology_barriers && (
        <section>
          <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-[#ea580c]" />
            Technology Barriers Our Clients Face
          </h2>
          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-lg p-4">
            <p className="text-base text-[#92400e] leading-relaxed whitespace-pre-wrap">
              {organization.technology_barriers}
            </p>
          </div>
        </section>
      )}

      {/* Program Description */}
      {organization.program_description && (
        <section>
          <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4">
            Our Programs
          </h2>
          <p className="text-base text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">
            {organization.program_description}
          </p>
        </section>
      )}

      {/* Service Area */}
      {organization.service_area_description && (
        <section>
          <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#ea580c]" />
            Service Area
          </h2>
          <p className="text-base text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">
            {organization.service_area_description}
          </p>
        </section>
      )}

      {/* Organization Details */}
      <section className="border-t border-[#f5f5f5] pt-6">
        <h3 className="text-sm font-medium text-[#737373] mb-3">Organization Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {organization.organization_type && (
            <div>
              <p className="text-[#737373]">Organization Type</p>
              <p className="text-[#0a0a0a] font-medium">{organization.organization_type}</p>
            </div>
          )}
          {organization.organization_size && (
            <div>
              <p className="text-[#737373]">Organization Size</p>
              <p className="text-[#0a0a0a] font-medium">{organization.organization_size}</p>
            </div>
          )}
          {organization.year_founded && (
            <div>
              <p className="text-[#737373]">Year Founded</p>
              <p className="text-[#0a0a0a] font-medium">{organization.year_founded}</p>
            </div>
          )}
          {organization.ein && (
            <div>
              <p className="text-[#737373]">EIN</p>
              <p className="text-[#0a0a0a] font-medium">{organization.ein}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
