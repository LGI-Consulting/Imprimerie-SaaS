"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, CheckCircle, Printer, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Sample data for print queue
const printQueueData = [
  {
    id: "ORD-1234",
    clientName: "John Smith",
    orderType: "Business Cards",
    dueDate: "2023-08-02T14:00:00Z",
    status: "Ready to Print",
    fileUrl: "/files/business_cards_john_smith.pdf",
    priority: "urgent",
  },
  {
    id: "ORD-1235",
    clientName: "Acme Corporation",
    orderType: "Brochures",
    dueDate: "2023-08-03T12:00:00Z",
    status: "Ready to Print",
    fileUrl: "/files/acme_corp_brochure.pdf",
    priority: "normal",
  },
  {
    id: "ORD-1236",
    clientName: "City Event",
    orderType: "Posters",
    dueDate: "2023-08-02T16:00:00Z",
    status: "Ready to Print",
    fileUrl: "/files/city_event_poster.pdf",
    priority: "normal",
  },
  {
    id: "ORD-1240",
    clientName: "Michael Brown",
    orderType: "Postcards",
    dueDate: "2023-08-02T17:00:00Z",
    status: "Ready to Print",
    fileUrl: "/files/michael_brown_postcards.pdf",
    priority: "normal",
  },
  {
    id: "ORD-1241",
    clientName: "Local Restaurant",
    orderType: "Menus",
    dueDate: "2023-08-02T15:30:00Z",
    status: "Ready to Print",
    fileUrl: "/files/local_restaurant_menus.pdf",
    priority: "urgent",
  },
  {
    id: "ORD-1242",
    clientName: "Tech Company",
    orderType: "Stickers",
    dueDate: "2023-08-03T10:00:00Z",
    status: "Ready to Print",
    fileUrl: "/files/tech_company_stickers.pdf",
    priority: "normal",
  },
]

export default function PrintQueuePage() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")

  const [orders, setOrders] = useState(printQueueData)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState(filterParam || "all")
  const [activeTab, setActiveTab] = useState("all")

  // Filtered orders based on search, priority, and tab
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === "all" || order.priority.toLowerCase() === priorityFilter.toLowerCase()

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "urgent" && order.priority === "urgent") ||
      (activeTab === "today" && isToday(new Date(order.dueDate)))

    return matchesSearch && matchesPriority && matchesTab
  })

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const markAsPrinted = (orderId: string) => {
    // This would make an API call in a real application
    setOrders(orders.filter((order) => order.id !== orderId))

    toast({
      title: "Order marked as printed",
      description: `Order ${orderId} has been moved to completed prints.`,
    })
  }

  // Set priority filter from URL parameter on initial load
  useEffect(() => {
    if (filterParam === "urgent") {
      setPriorityFilter("urgent")
      setActiveTab("urgent")
    }
  }, [filterParam])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Print Queue</h2>
        <p className="text-muted-foreground">Manage and process orders waiting to be printed.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="today">Due Today</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Design Files</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>{order.orderType}</TableCell>
                          <TableCell>{formatDate(order.dueDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                order.priority === "urgent"
                                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                                  : "bg-green-100 text-green-800 hover:bg-green-100"
                              }
                            >
                              {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Download className="mr-1 h-4 w-4" />
                              Download
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.open(order.fileUrl, "_blank")
                                }}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Preview
                              </Button>
                              <Button size="sm" onClick={() => markAsPrinted(order.id)}>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Mark Printed
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No orders found in the print queue.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Orders</CardTitle>
              <CardDescription>Orders that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Clock className="h-6 w-6 text-red-500" />
                        <div>
                          <h3 className="font-medium">
                            {order.orderType} - {order.clientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Order {order.id} • Due {formatDate(order.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                        <Button size="sm" onClick={() => markAsPrinted(order.id)}>
                          <Printer className="mr-1 h-4 w-4" />
                          Print Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No urgent orders found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Due Today</CardTitle>
              <CardDescription>Orders that need to be completed today</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-md border p-4">
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">
                            {order.orderType} - {order.clientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Order {order.id} • Due {formatDate(order.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                        <Button size="sm" onClick={() => markAsPrinted(order.id)}>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Mark Printed
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No orders due today found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
