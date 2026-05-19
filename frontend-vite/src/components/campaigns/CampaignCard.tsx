import { Link, useNavigate } from 'react-router-dom'
import { Users, Building2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { routes } from '@/config'
import type { Database } from '@/types/database'

type CampaignRow = Database['public']['Tables']['campaigns']['Row']

export interface CampaignWithOrg extends CampaignRow {
  organization: {
    id: string
    name: string
    slug: string | null
    logo_url: string | null
  } | null
}

export interface CauseArea {
  id: string
  name: string
}

interface CampaignCardProps {
  campaign: CampaignWithOrg
  causeAreas: CauseArea[]
}

export function CampaignCard({ campaign, causeAreas }: CampaignCardProps) {
  const navigate = useNavigate()
  const slug = campaign.slug ?? campaign.id
  const org = campaign.organization
  const goal = campaign.funding_goal ?? 0
  const raised = campaign.amount_raised ?? 0
  const progressPct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0
  const supportersCount = campaign.supporters_count ?? 0

  // Resolve cause area names from IDs
  const campaignCauseAreaIds = campaign.cause_area_ids ?? []
  const matchedCauseAreas = causeAreas.filter((ca) => campaignCauseAreaIds.includes(ca.id))
  const visibleBadges = matchedCauseAreas.slice(0, 2)
  const extraCount = matchedCauseAreas.length - visibleBadges.length

  const hasRealImage =
    campaign.image_url != null && !campaign.image_url.includes('kcdd_placeholder=1')

  const campaignHref = routes.campaign(slug)

  return (
    <Card
      className="flex flex-col h-full overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
      onClick={() => navigate(campaignHref)}
    >
      {/* Image block */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        {hasRealImage ? (
          <img
            src={campaign.image_url!}
            alt={campaign.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              // Hide broken image; gradient sibling shows through
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b5858] to-[#103032] flex items-center justify-center">
            {org?.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : org ? (
              <span className="text-white/60 text-2xl font-bold">
                {org.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Building2 className="w-12 h-12 text-white/40" />
            )}
          </div>
        )}

        {/* Cause area badges overlay */}
        {visibleBadges.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {visibleBadges.map((ca) => (
              <Badge
                key={ca.id}
                className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm"
              >
                {ca.name}
              </Badge>
            ))}
            {extraCount > 0 && (
              <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
                +{extraCount} more
              </Badge>
            )}
          </div>
        )}

        {/* Status badge */}
        {campaign.status === 'active' && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-600 text-white border-0 text-xs">Active Campaign</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        {/* Org name — navigates to org profile without triggering card nav */}
        {org?.id ? (
          <Link
            to={routes.organizations.profile(org.id)}
            className="text-sm font-medium hover:underline"
            style={{ color: '#ea580c' }}
            onClick={(e) => e.stopPropagation()}
          >
            {org.name}
          </Link>
        ) : (
          <p className="text-sm font-medium" style={{ color: '#ea580c' }}>
            Unknown Org
          </p>
        )}

        <CardTitle className="line-clamp-2 text-lg group-hover:text-[#ea580c] transition-colors">
          {campaign.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {campaign.short_description && (
          <p className="line-clamp-2 text-sm text-[#737373]">{campaign.short_description}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 pt-2">
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-[#e5e5e5]">
          <div
            className="bg-[#ea580c] h-full rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Amount row */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{formatCurrency(raised)} raised</span>
          <span className="text-[#737373]">of {formatCurrency(goal)}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm text-[#737373]">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {supportersCount} Supporter{supportersCount !== 1 ? 's' : ''}
          </span>
          <span>{formatRelativeTime(campaign.created_at)}</span>
        </div>

        {/* CTA — stopPropagation so it does not double-fire with the card onClick */}
        <Button
          className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white"
          onClick={(e) => {
            e.stopPropagation()
            navigate(campaignHref)
          }}
        >
          Support Campaign
        </Button>
      </CardFooter>
    </Card>
  )
}

export function CampaignCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-t-lg rounded-b-none" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-1/3 mb-1" />
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1 pb-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}
