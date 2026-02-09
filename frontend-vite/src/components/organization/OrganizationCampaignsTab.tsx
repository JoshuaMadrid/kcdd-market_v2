/**
 * Organization Campaigns Tab Component
 * Displays stats cards and request cards with status badges
 */

import { Link } from 'react-router-dom'
import { Target, CheckCircle2, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Request {
  id: string
  description: string
  amount: number
  status: 'open' | 'claimed' | 'fulfilled' | 'denied'
  urgency: 'low' | 'medium' | 'high'
  created_at: string
  cause_area?: { id: string; name: string }
}

interface OrganizationCampaignsTabProps {
  requests: Request[]
}

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-[#d1fae5] text-[#059669]',
    icon: Target
  },
  claimed: {
    label: 'Claimed',
    className: 'bg-[#dbeafe] text-[#2563eb]',
    icon: Clock
  },
  fulfilled: {
    label: 'Fulfilled',
    className: 'bg-[#f3e8ff] text-[#7c3aed]',
    icon: CheckCircle2
  },
  denied: {
    label: 'Denied',
    className: 'bg-[#fee2e2] text-[#dc2626]',
    icon: AlertCircle
  }
}

const urgencyConfig = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  high: { label: 'Urgent', className: 'bg-red-100 text-red-700' }
}

export function OrganizationCampaignsTab({
  requests
}: OrganizationCampaignsTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate stats
  const openRequests = requests.filter(r => r.status === 'open')
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled')
  const totalRaised = fulfilledRequests.reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 border-[#f5f5f5]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#d1fae5] rounded-lg">
              <Target className="h-6 w-6 text-[#059669]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0a0a0a]">{openRequests.length}</p>
              <p className="text-sm text-[#737373]">Open Requests</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-[#f5f5f5]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#f3e8ff] rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0a0a0a]">{fulfilledRequests.length}</p>
              <p className="text-sm text-[#737373]">Fulfilled</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-[#f5f5f5]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ea580c]/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-[#ea580c]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#ea580c]">{formatCurrency(totalRaised)}</p>
              <p className="text-sm text-[#737373]">Total Raised</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Request Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-4">Technology Requests</h2>

        {requests.length === 0 ? (
          <div className="py-12 text-center text-[#737373] bg-[#f5f5f5] rounded-lg">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No requests yet.</p>
            <p className="text-sm mt-2">This organization hasn't posted any technology requests.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => {
              const status = statusConfig[request.status]
              const urgency = urgencyConfig[request.urgency]
              const StatusIcon = status.icon

              return (
                <Card key={request.id} className="p-5 border-[#f5f5f5] hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${status.className} hover:${status.className}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Badge className={`${urgency.className} hover:${urgency.className}`}>
                          {urgency.label}
                        </Badge>
                        {request.cause_area && (
                          <Badge variant="secondary" className="bg-[#eaeaea] text-[#737373]">
                            {request.cause_area.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-[#0a0a0a] mb-2 line-clamp-2">
                        {request.description}
                      </p>
                      <p className="text-sm text-[#737373]">
                        Posted {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-[#0a0a0a]">
                        {formatCurrency(request.amount)}
                      </p>
                      {request.status === 'open' && (
                        <Link to={`/checkout/${request.id}`}>
                          <Button
                            size="sm"
                            className="mt-2 bg-[#ea580c] hover:bg-[#dc4c06] text-white rounded-full"
                          >
                            Support
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
