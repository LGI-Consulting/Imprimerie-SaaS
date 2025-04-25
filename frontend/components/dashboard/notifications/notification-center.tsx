"use client"

import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationStore } from "@/lib/store/notifications"
import { NotificationItem } from "./notification-item"
import { UserRole } from "@/types/notifications"

interface NotificationCenterProps {
  role: UserRole
}

export function NotificationCenter({ role }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("all")
  const { notifications, markAllAsRead, clearAll } = useNotificationStore()

  const unreadNotifications = notifications.filter(
    (notification) => notification.toRole === role && !notification.read
  )

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return notification.toRole === role
    if (activeTab === "unread") return notification.toRole === role && !notification.read
    return notification.toRole === role && notification.type === activeTab
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" title="Tout marquer comme lu" onClick={markAllAsRead}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Tout supprimer" onClick={clearAll}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="unread">Non lues</TabsTrigger>
              <TabsTrigger value="new_order">Commandes</TabsTrigger>
              <TabsTrigger value="payment_ready">Paiements</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[300px] p-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Aucune notification à afficher</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Button variant="ghost" className="w-full cursor-pointer justify-center">
              Voir toutes les notifications
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
