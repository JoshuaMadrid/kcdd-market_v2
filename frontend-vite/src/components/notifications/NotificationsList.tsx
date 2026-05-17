import { CheckCheck, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type AppNotification } from '@/stores/notificationsStore'

const typeIcons: Record<AppNotification['notification_type'], string> = {
  claimed: '💰',
  fulfilled: '✅',
  denied: '❌',
  approved: '👍',
  edited: '📝',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface NotificationsListProps {
  notifications: AppNotification[]
  onMarkOneRead: (id: string) => void
  onMarkAllRead: () => void
}

export function NotificationsList({ notifications, onMarkOneRead, onMarkAllRead }: NotificationsListProps) {
  const unread = notifications.filter((n) => !n.is_read).length

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <Bell className="h-8 w-8" />
        <p className="text-sm">No notifications yet</p>
      </div>
    )
  }

  return (
    <div>
      {unread > 0 && (
        <div className="flex justify-end px-3 pt-2 pb-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onMarkAllRead}
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </Button>
        </div>
      )}
      <ScrollArea className="h-[320px]">
        <div className="space-y-px">
          {notifications.map((n) => (
            <button
              key={n.id}
              className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 items-start ${
                !n.is_read ? 'bg-muted/30' : ''
              }`}
              onClick={() => { if (!n.is_read) onMarkOneRead(n.id) }}
            >
              <span className="text-lg shrink-0 mt-0.5">{typeIcons[n.notification_type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight truncate">{n.title}</p>
                  {!n.is_read && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
