import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { appConfig } from '@/config'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  supabase,
} from '@/lib/supabase'
import { useNotificationsStore } from '@/stores/notificationsStore'

export function useNotifications() {
  const { user } = useUser()
  const { setNotifications, markOneRead, markAllRead } = useNotificationsStore()

  useEffect(() => {
    if (!user) return

    let channel: ReturnType<typeof supabase.channel> | null = null

    const load = async () => {
      const data = await fetchNotifications(user.id)
      setNotifications(data as any)
    }

    load()

    if (appConfig.features.realtime) {
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'request_notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => { load() }
        )
        .subscribe()
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [user?.id])

  const handleMarkOneRead = async (id: string) => {
    markOneRead(id)
    await markNotificationRead(id)
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    markAllRead()
    await markAllNotificationsRead(user.id)
  }

  return { markOneRead: handleMarkOneRead, markAllRead: handleMarkAllRead }
}
