"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, CreditCard, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// Sample data for unpaid orders
const unpaidOrdersData = [
  {
    id: "ORD-1234",
    clientName: "John Smith",
    orderType: "Business Cards",
    createdAt: "2023-08-01T09:30:00Z",
    amount: 45.99,
    status: "Ready for Payment",
  },
  {
    id: "ORD-1235",
    clientName: "Acme Corporation",
    orderType: "Brochures",
    createdAt: "2023-08-01T10:15:00Z",
    amount: 129.5,
    status: "Ready for Payment",
  },
  {
    id: "ORD-1236",
    clientName: "City Event",
    orderType: "Posters",
    createdAt: "2023-08-01T11:00:00Z",
    amount: 78.0,
    status: "Ready for Payment",
  },
  {
    id: "ORD-1237",
    clientName: "Local Business",
    orderType: "Flyers",
    createdAt: "2023-08-01T13:45:00Z",
    amount: 65.25,
    status: "Waiting for Confirmation",
  },
  {
    id: "ORD-1238",
    clientName: "Sarah Johnson",
    orderType: "Business Cards",
    createdAt: "2023-08-01T14:30:00Z",
    amount: 39.95,
    status: "Ready for Payment",
  },
  {
    id: "ORD-1239",
    clientName: "Tech Startup",
    orderType: "Banners",
    createdAt: "2023-08-01T15:20:00Z",
    amount: 145.0,
    status: "Waiting for Confirmation",
  },
  {
    id: "ORD-1240",
    clientName: "Michael Brown",
    orderType: "Postcards",
    createdAt: "2023-08-01T16:10:00Z",
    amount: 55.5,
    status: "Ready for Payment",
  },
]

export default function UnpaidOrdersPage() {
  const [orders, setOrders] = useState(unpaidOrdersData)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtered orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Unpaid Orders</h2>
        <p className="text-muted-foreground">Process payments for orders that are ready for payment.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ready for payment">Ready for Payment</SelectItem>
                    <SelectItem value="waiting for confirmation">Waiting for Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "Ready for Payment"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" disabled={order.status !== "Ready for Payment"}>
                            <Link href={`/dashboard/cashier/process-payment?id=${order.id}`}>
                              <CreditCard className="mr-1 h-4 w-4" />
                              Process
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Receipt className="mr-1 h-4 w-4" />
                            Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No unpaid orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
