import { create } from 'zustand'

export interface AppNotification {
  id: string
  request_id: string
  notification_type: 'denied' | 'approved' | 'claimed' | 'fulfilled' | 'edited'
  title: string
  message: string
  recipient_id: string
  is_read: boolean
  created_at: string
}

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  setNotifications: (notifications: AppNotification[]) => void
  markOneRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.is_read).length }),
  markOneRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      return { notifications: updated, unreadCount: updated.filter((n) => !n.is_read).length }
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
}))
