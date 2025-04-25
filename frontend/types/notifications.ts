// Types de rôles
export type UserRole = "admin" | "caisse" | "graphiste" | "accueil"

// Types de notifications basés sur le workflow
export type NotificationType = 
  | "new_order"           // Accueil -> Caisse
  | "payment_ready"       // Caisse -> Atelier
  | "production_complete" // Atelier -> Caisse
  | "order_complete"      // Caisse -> Accueil

// Métadonnées spécifiques à chaque type de notification
export type NotificationMetadata = {
  orderId: string
  orderNumber?: string
  clientName?: string
  amount?: number
  productionStatus?: string
}

// Structure d'une notification
export type Notification = {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  read: boolean
  fromRole: UserRole
  toRole: UserRole
  metadata: NotificationMetadata
}

// État du store
export type NotificationStoreState = {
  notifications: Notification[]
  lastReadTime: string | null
} 