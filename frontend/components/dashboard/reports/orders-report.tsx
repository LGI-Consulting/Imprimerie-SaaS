"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, isWithinInterval, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrdersReportProps {
  dateRange: DateRange | undefined
  searchQuery: string
}

// Sample data for orders
const ordersData = [
  {
    id: "ORD-001",
    clientName: "John Smith",
    date: "2023-04-15",
    status: "Completed",
    total: 250.99,
    items: [
      { name: "Cotton Fabric", quantity: 5, price: 5.99 },
      { name: "Buttons (pack of 100)", quantity: 1, price: 3.99 },
    ],
  },
  {
    id: "ORD-002",
    clientName: "Sarah Johnson",
    date: "2023-04-16",
    status: "Processing",
    total: 175.5,
    items: [
      { name: "Denim", quantity: 3, price: 8.75 },
      { name: "Polyester Blend", quantity: 2, price: 4.5 },
    ],
  },
  {
    id: "ORD-003",
    clientName: "Michael Brown",
    date: "2023-04-17",
    status: "Pending",
    total: 320.75,
    items: [
      { name: "Silk", quantity: 2, price: 15.99 },
      { name: "Wool", quantity: 3, price: 12.25 },
    ],
  },
  {
    id: "ORD-004",
    clientName: "Emily Davis",
    date: "2023-04-18",
    status: "Completed",
    total: 450.0,
    items: [
      { name: "Linen", quantity: 5, price: 9.5 },
      { name: "Leather", quantity: 2, price: 22.99 },
    ],
  },
  {
    id: "ORD-005",
    clientName: "David Wilson",
    date: "2023-04-19",
    status: "Cancelled",
    total: 125.25,
    items: [
      { name: "Cotton Fabric", quantity: 2, price: 5.99 },
      { name: "Buttons (pack of 100)", quantity: 1, price: 3.99 },
    ],
  },
  {
    id: "ORD-006",
    clientName: "Lisa Martinez",
    date: "2023-04-20",
    status: "Processing",
    total: 275.0,
    items: [
      { name: "Denim", quantity: 4, price: 8.75 },
      { name: "Polyester Blend", quantity: 3, price: 4.5 },
    ],
  },
  {
    id: "ORD-007",
    clientName: "Robert Taylor",
    date: "2023-04-21",
    status: "Pending",
    total: 190.5,
    items: [
      { name: "Silk", quantity: 1, price: 15.99 },
      { name: "Wool", quantity: 2, price: 12.25 },
    ],
  },
  {
    id: "ORD-008",
    clientName: "Jennifer Anderson",
    date: "2023-04-22",
    status: "Completed",
    total: 315.75,
    items: [
      { name: "Linen", quantity: 3, price: 9.5 },
      { name: "Leather", quantity: 1, price: 22.99 },
    ],
  },
]

export function OrdersReport({ dateRange, searchQuery }: OrdersReportProps) {
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Filter orders based on date range and search query
  const filteredOrders = ordersData.filter((order) => {
    const orderDate = parseISO(order.date)

    // Filter by date range
    const isInDateRange =
      dateRange?.from && dateRange?.to
        ? isWithinInterval(orderDate, { start: dateRange.from, end: dateRange.to })
        : dateRange?.from
          ? orderDate >= dateRange.from
          : true

    // Filter by search query
    const matchesSearch = searchQuery
      ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return isInDateRange && matchesSearch
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortBy === "total") {
      return sortOrder === "asc" ? a.total - b.total : b.total - a.total
    } else if (sortBy === "client") {
      return sortOrder === "asc" ? a.clientName.localeCompare(b.clientName) : b.clientName.localeCompare(a.clientName)
    }
    return 0
  })

  // Paginate orders
  const paginatedOrders = sortedOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Calculate total pages
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)

  // Calculate total revenue
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return sum + (order.status.toLowerCase() !== "cancelled" ? order.total : 0)
  }, 0)

  // Calculate total items sold
  const totalItemsSold = filteredOrders.reduce((sum, order) => {
    if (order.status.toLowerCase() !== "cancelled") {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">Units across all orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Orders Report</CardTitle>
            <CardDescription>Detailed list of orders for the selected period</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="total">Amount</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>{format(parseISO(order.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} units</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {sortedOrders.length > itemsPerPage && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((page) => Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((page) => Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
