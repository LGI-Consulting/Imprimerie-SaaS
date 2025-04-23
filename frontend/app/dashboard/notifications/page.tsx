"use client"

import { useState } from "react"
import { Clock, Info, AlertTriangle, CheckCircle2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils/utils"
import type { Notification } from "@/components/dashboard/notifications/notification-center"

// Sample notification data
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
  {
    id: "7",
    title: "Order Shipped",
    description: "Order #1230 has been shipped to Michael Brown",
    time: "5 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "8",
    title: "Employee Leave Request",
    description: "David Wilson has requested leave from June 10-15",
    time: "1 day ago",
    read: true,
    type: "info",
  },
  {
    id: "9",
    title: "Inventory Restocked",
    description: "Denim has been restocked with 150 units",
    time: "1 day ago",
    read: true,
    type: "success",
  },
  {
    id: "10",
    title: "System Error",
    description: "Error processing report generation. Please try again.",
    time: "2 days ago",
    read: true,
    type: "error",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")

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
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  // Filter notifications based on tab, search query, and time filter
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by tab
    if (activeTab !== "all" && activeTab !== notification.type && !(activeTab === "unread" && !notification.read)) {
      return false
    }

    // Filter by search query
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by time
    if (timeFilter !== "all") {
      const notificationTime = notification.time
      if (timeFilter === "today" && notificationTime.includes("day")) {
        return false
      }
      if (timeFilter === "yesterday" && !notificationTime.includes("1 day")) {
        return false
      }
      if (timeFilter === "older" && !notificationTime.includes("day")) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">View and manage your notifications.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            You have {notifications.filter((n) => !n.read).length} unread notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notifications..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="older">Older</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="warning">Alerts</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-4 rounded-lg border p-4 transition-colors",
                        notification.read ? "bg-background" : "bg-muted",
                      )}
                    >
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium leading-none">{notification.title}</h4>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 ml-2"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No notifications to display</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
