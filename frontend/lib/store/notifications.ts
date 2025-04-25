import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Notification, NotificationType, UserRole, NotificationMetadata, NotificationStoreState } from '@/types/notifications'

interface NotificationStore extends NotificationStoreState {
  // Actions
  addNotification: (
    type: NotificationType,
    metadata: NotificationMetadata,
    fromRole: UserRole,
    toRole: UserRole
  ) => void
  
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  
  // Getters
  getUnreadNotifications: (role: UserRole) => Notification[]
  getNotificationsByType: (type: NotificationType) => Notification[]
  getNotificationsByOrder: (orderId: string) => Notification[]
  
  // Utilitaires
  generateNotificationTitle: (type: NotificationType, metadata: NotificationMetadata) => string
  generateNotificationDescription: (type: NotificationType, metadata: NotificationMetadata) => string
}

// Fonctions utilitaires pour générer les titres et descriptions
const notificationTitles = {
  new_order: (metadata: NotificationMetadata) => `Nouvelle commande #${metadata.orderNumber}`,
  payment_ready: (metadata: NotificationMetadata) => `Paiement validé pour la commande #${metadata.orderNumber}`,
  production_complete: (metadata: NotificationMetadata) => `Production terminée pour la commande #${metadata.orderNumber}`,
  order_complete: (metadata: NotificationMetadata) => `Commande #${metadata.orderNumber} terminée`
}

const notificationDescriptions = {
  new_order: (metadata: NotificationMetadata) => `Nouvelle commande de ${metadata.clientName}`,
  payment_ready: (metadata: NotificationMetadata) => `Le paiement de ${metadata.amount}€ a été validé`,
  production_complete: (metadata: NotificationMetadata) => `La production est terminée et prête à être livrée`,
  order_complete: (metadata: NotificationMetadata) => `La commande a été complétée avec succès`
}

// Création du store avec persistance
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      lastReadTime: null,

      addNotification: (type, metadata, fromRole, toRole) => {
        const notification: Notification = {
          id: crypto.randomUUID(),
          type,
          title: get().generateNotificationTitle(type, metadata),
          description: get().generateNotificationDescription(type, metadata),
          time: new Date().toISOString(),
          read: false,
          fromRole,
          toRole,
          metadata
        }
        
        set(state => ({
          notifications: [notification, ...state.notifications]
        }))
      },

      markAsRead: (id) => 
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          lastReadTime: new Date().toISOString()
        })),

      markAllAsRead: () =>
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          lastReadTime: new Date().toISOString()
        })),

      deleteNotification: (id) =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

      clearAll: () => set({ notifications: [], lastReadTime: null }),

      getUnreadNotifications: (role) =>
        get().notifications.filter(n => n.toRole === role && !n.read),

      getNotificationsByType: (type) =>
        get().notifications.filter(n => n.type === type),

      getNotificationsByOrder: (orderId) =>
        get().notifications.filter(n => n.metadata.orderId === orderId),

      generateNotificationTitle: (type, metadata) => 
        notificationTitles[type](metadata),

      generateNotificationDescription: (type, metadata) =>
        notificationDescriptions[type](metadata)
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ notifications: state.notifications })
    }
  )
) 