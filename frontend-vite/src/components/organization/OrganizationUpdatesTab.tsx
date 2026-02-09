import { Calendar, Newspaper } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Database } from '@/types/database'

type OrganizationUpdate = Database['public']['Tables']['organization_updates']['Row']

interface OrganizationUpdatesTabProps {
  updates: OrganizationUpdate[]
  isLoading?: boolean
}

export function OrganizationUpdatesTab({
  updates,
  isLoading = false,
}: OrganizationUpdatesTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-[#f5f5f5] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <Card className="border-[#f5f5f5]">
        <CardContent className="p-8 text-center">
          <Newspaper className="h-12 w-12 mx-auto text-[#737373] mb-3" />
          <h3 className="text-lg font-medium text-[#0a0a0a] mb-1">
            No Updates Yet
          </h3>
          <p className="text-sm text-[#737373]">
            Check back later for news and updates from this organization.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#f5f5f5]" />

        {updates.map((update, index) => (
          <div key={update.id} className="relative pl-12 pb-8 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-[#ea580c] border-2 border-white" />

            {/* Update Card */}
            <Card className="border-[#f5f5f5]">
              <CardContent className="p-4">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-[#737373] mb-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={update.created_at}>
                    {new Date(update.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">
                  {update.title}
                </h3>

                {/* Image */}
                {update.image_url && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <p className="text-base text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">
                  {update.content}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
