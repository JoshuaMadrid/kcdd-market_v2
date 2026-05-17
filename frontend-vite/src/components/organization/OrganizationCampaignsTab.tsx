import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database'

type Request = Database['public']['Tables']['requests']['Row']
type CauseArea = Database['public']['Tables']['cause_areas']['Row']

interface RequestWithCauseArea extends Request {
  cause_area: CauseArea
}

interface OrganizationCampaignsTabProps {
  requests: RequestWithCauseArea[]
  isLoading?: boolean
}

const statusConfig = {
  open: {
    label: 'Open',
    color: 'bg-[#dbeafe] text-[#1d4ed8]',
    icon: Clock,
  },
  claimed: {
    label: 'Claimed',
    color: 'bg-[#fef3c7] text-[#92400e]',
    icon: Package,
  },
  fulfilled: {
    label: 'Fulfilled',
    color: 'bg-[#d1fae5] text-[#059669]',
    icon: CheckCircle2,
  },
  denied: {
    label: 'Denied',
    color: 'bg-[#fee2e2] text-[#dc2626]',
    icon: XCircle,
  },
}

const urgencyColors = {
  low: 'bg-[#f5f5f5] text-[#737373]',
  medium: 'bg-[#fef3c7] text-[#92400e]',
  high: 'bg-[#fee2e2] text-[#dc2626]',
}

export function OrganizationCampaignsTab({
  requests,
  isLoading = false,
}: OrganizationCampaignsTabProps) {
  // Calculate stats
  const openCount = requests.filter((r) => r.status === 'open').length
  const fulfilledCount = requests.filter((r) => r.status === 'fulfilled').length
  const totalRaised = requests
    .filter((r) => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.amount, 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#f5f5f5] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#f5f5f5]">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#ea580c]">{openCount}</p>
            <p className="text-sm text-[#737373]">Open Requests</p>
          </CardContent>
        </Card>
        <Card className="border-[#f5f5f5]">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#059669]">{fulfilledCount}</p>
            <p className="text-sm text-[#737373]">Fulfilled</p>
          </CardContent>
        </Card>
        <Card className="border-[#f5f5f5]">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#0a0a0a]">
              ${totalRaised.toLocaleString()}
            </p>
            <p className="text-sm text-[#737373]">Total Raised</p>
          </CardContent>
        </Card>
      </div>

      {/* Request List */}
      {requests.length === 0 ? (
        <Card className="border-[#f5f5f5]">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-[#737373] mb-3" />
            <h3 className="text-lg font-medium text-[#0a0a0a] mb-1">
              No Requests Yet
            </h3>
            <p className="text-sm text-[#737373]">
              This organization hasn't posted any technology requests yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const status = statusConfig[request.status]
            const StatusIcon = status.icon

            return (
              <Card key={request.id} className="border-[#f5f5f5] hover:border-[#e5e5e5] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Badge className={urgencyColors[request.urgency]}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                        </Badge>
                        {request.cause_area && (
                          <Badge variant="outline">{request.cause_area.name}</Badge>
                        )}
                      </div>
                      <p className="text-base text-[#0a0a0a] line-clamp-2">
                        {request.description}
                      </p>
                      <p className="text-sm text-[#737373] mt-2">
                        Posted {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-[#0a0a0a]">
                        ${request.amount.toLocaleString()}
                      </p>
                      {request.status === 'open' && (
                        <Link to={`/checkout/${request.id}`}>
                          <Button
                            size="sm"
                            className="mt-2 bg-[#ea580c] hover:bg-[#dc4c06] text-white"
                          >
                            Support
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
