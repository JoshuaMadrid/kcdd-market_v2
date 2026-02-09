/**
 * Organization Updates Tab Component
 * Timeline layout with date, title, image, and content
 */

import { Clock, MessageSquarePlus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { OrganizationUpdate } from '@/lib/supabase'

interface OrganizationUpdatesTabProps {
  updates: OrganizationUpdate[]
}

export function OrganizationUpdatesTab({ updates }: OrganizationUpdatesTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (updates.length === 0) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-6">Latest Updates</h2>
        <div className="py-12 text-center text-[#737373] bg-[#f5f5f5] rounded-lg">
          <MessageSquarePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No updates yet.</p>
          <p className="text-sm mt-2">Check back later for news from this organization.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-[#0a0a0a] mb-6">Latest Updates</h2>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-[#f5f5f5]" />

        {/* Update entries */}
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="relative flex gap-6">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="h-12 w-12 bg-[#1b5858] rounded-full flex items-center justify-center">
                  <MessageSquarePlus className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <Card className="flex-1 p-6 border-[#f5f5f5]">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-[#737373] mb-3">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(update.created_at)}</span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-[#0a0a0a] mb-3">
                  {update.title}
                </h3>

                {/* Image */}
                {update.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <p className="text-base text-[#0a0a0a] leading-relaxed whitespace-pre-line">
                  {update.content}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
