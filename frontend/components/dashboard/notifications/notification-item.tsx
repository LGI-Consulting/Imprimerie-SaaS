"use client"

import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Bell, Check, X, Clock, Info, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/lib/store/notifications"
import { Notification } from "@/types/notifications"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  notification: Notification
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "new_order":
      return <Bell className="h-4 w-4 text-blue-500" />
    case "payment_ready":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "production_complete":
      return <CheckCircle2 className="h-4 w-4 text-amber-500" />
    case "order_complete":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationStore()

  const handleMarkAsRead = () => {
    markAsRead(notification.id)
  }

  const handleDelete = () => {
    deleteNotification(notification.id)
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg p-3 transition-colors",
        notification.read ? "bg-background" : "bg-muted"
      )}
    >
      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <Link 
            href={`/dashboard/orders/${notification.metadata.orderId}`}
            className="text-sm font-medium hover:underline"
          >
            {notification.title}
          </Link>
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleMarkAsRead}
            >
              <Check className="h-3 w-3" />
              <span className="sr-only">Marquer comme lu</span>
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{notification.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {formatDistanceToNow(new Date(notification.time), { 
              addSuffix: true,
              locale: fr 
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDelete}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 