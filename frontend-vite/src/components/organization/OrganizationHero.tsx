import { Building2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrganizationLogo } from './OrganizationLogo'
import type { Database } from '@/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']

interface OrganizationHeroProps {
  organization: Organization
  isOwner?: boolean
  onEditClick?: () => void
}

export function OrganizationHero({
  organization,
  isOwner = false,
  onEditClick,
}: OrganizationHeroProps) {
  return (
    <div className="w-full">
      {/* Cover Image Area */}
      <div className="w-full h-[300px] bg-[#f5f5f5] rounded-[10px] overflow-hidden relative">
        {organization.cover_image_url ? (
          <img
            src={organization.cover_image_url}
            alt={`${organization.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5]">
            <div className="text-[#737373] flex flex-col items-center">
              <Building2 className="h-16 w-16 mb-2 opacity-50" />
              <span className="text-sm">Organization Cover</span>
            </div>
          </div>
        )}

        {/* Edit button overlay for owners */}
        {isOwner && onEditClick && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
            onClick={onEditClick}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        )}

        {/* Organization logo overlay */}
        <div className="absolute -bottom-8 left-6">
          <div className="rounded-full border-4 border-white bg-white shadow-lg">
            <OrganizationLogo
              name={organization.name}
              logoUrl={organization.logo_url}
              logoEmoji={organization.logo_emoji}
              size="xl"
            />
          </div>
        </div>
      </div>

      {/* Organization Name & Tagline */}
      <div className="pt-12 px-6">
        <h1 className="text-4xl font-bold text-[#0a0a0a] leading-tight">
          {organization.name}
        </h1>
        {organization.tagline && (
          <p className="text-lg text-[#737373] mt-1">{organization.tagline}</p>
        )}
      </div>
    </div>
  )
}
