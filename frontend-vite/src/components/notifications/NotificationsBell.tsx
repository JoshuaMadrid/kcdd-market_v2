import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotifications } from '@/hooks/useNotifications'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { NotificationsList } from './NotificationsList'

export function NotificationsBell() {
  const { markOneRead, markAllRead } = useNotifications()
  const { notifications, unreadCount } = useNotificationsStore()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        <NotificationsList
          notifications={notifications}
          onMarkOneRead={markOneRead}
          onMarkAllRead={markAllRead}
        />
      </PopoverContent>
    </Popover>
  )
}
