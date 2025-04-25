"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotificationStore } from "@/lib/store/notifications"
import { UserRole } from "@/types/notifications"

interface NotificationBadgeProps {
  role: UserRole
}

export function NotificationBadge({ role }: NotificationBadgeProps) {
  const unreadNotifications = useNotificationStore((state) => 
    state.getUnreadNotifications(role)
  )

  const unreadCount = unreadNotifications.length

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
        >
          {unreadCount}
        </Badge>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  )
} 