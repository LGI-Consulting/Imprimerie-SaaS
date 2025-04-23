"use client"

import { useState } from "react"
import { Bell, Check, X, Clock, Info, AlertTriangle, CheckCircle2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Sample notification data
export type Notification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "info" | "warning" | "success" | "error"
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "New Order Received",
    description: "Order #1234 has been placed by John Smith",
    time: "5 minutes ago",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Payment Successful",
    description: "Payment for Order #1234 has been processed successfully",
    time: "10 minutes ago",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Inventory Alert",
    description: "Cotton Fabric is running low (5 units remaining)",
    time: "30 minutes ago",
    read: false,
    type: "warning",
  },
  {
    id: "4",
    title: "System Update",
    description: "The system will undergo maintenance tonight at 11 PM",
    time: "1 hour ago",
    read: true,
    type: "info",
  },
  {
    id: "5",
    title: "Payment Failed",
    description: "Payment for Order #1235 has failed. Please check payment details.",
    time: "2 hours ago",
    read: true,
    type: "error",
  },
  {
    id: "6",
    title: "New Client Registered",
    description: "Sarah Johnson has registered as a new client",
    time: "3 hours ago",
    read: true,
    type: "info",
  },
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" title="Mark all as read" onClick={markAllAsRead}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Clear all" onClick={clearAll}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="warning">Alerts</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[300px] p-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-3 rounded-lg p-3 transition-colors",
                        notification.read ? "bg-background" : "bg-muted",
                      )}
                    >
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No notifications to display</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/notifications" className="w-full cursor-pointer justify-center">
              View All Notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
