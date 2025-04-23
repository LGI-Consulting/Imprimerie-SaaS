"use client"

import { useState } from "react"
import { Search, Filter, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AddOrderDialog } from "@/components/dashboard/orders/add-order-dialog"
import { ViewOrderDialog } from "@/components/dashboard/orders/view-order-dialog"
import { EditOrderDialog } from "@/components/dashboard/orders/edit-order-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Sample data for orders
const ordersData = [
  {
    id: "ORD-001",
    clientName: "John Smith",
    clientId: "1",
    date: "2023-04-15",
    status: "Completed",
    dueDate: "2023-04-20",
    notes: "Priority order for a regular customer",
    items: [
      { id: "item1", name: "Cotton Fabric", quantity: 5, price: 5.99 },
      { id: "item2", name: "Buttons (pack of 100)", quantity: 1, price: 3.99 },
    ],
    shippingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-002",
    clientName: "Sarah Johnson",
    clientId: "2",
    date: "2023-04-16",
    status: "Processing",
    dueDate: "2023-04-25",
    items: [
      { id: "item3", name: "Denim", quantity: 3, price: 8.75 },
      { id: "item4", name: "Polyester Blend", quantity: 2, price: 4.5 },
    ],
  },
  {
    id: "ORD-003",
    clientName: "Michael Brown",
    clientId: "3",
    date: "2023-04-17",
    status: "Pending",
    dueDate: "2023-04-30",
    notes: "Customer requested express shipping",
  },
  {
    id: "ORD-004",
    clientName: "Emily Davis",
    clientId: "4",
    date: "2023-04-18",
    status: "Completed",
    dueDate: "2023-04-22",
  },
  {
    id: "ORD-005",
    clientName: "David Wilson",
    clientId: "5",
    date: "2023-04-19",
    status: "Cancelled",
    dueDate: "2023-04-24",
    notes: "Customer cancelled due to delay",
  },
  {
    id: "ORD-006",
    clientName: "Lisa Martinez",
    clientId: "6",
    date: "2023-04-20",
    status: "Processing",
    dueDate: "2023-04-28",
  },
  {
    id: "ORD-007",
    clientName: "Robert Taylor",
    clientId: "7",
    date: "2023-04-21",
    status: "Pending",
    dueDate: "2023-05-01",
  },
  {
    id: "ORD-008",
    clientName: "Jennifer Anderson",
    clientId: "8",
    date: "2023-04-22",
    status: "Completed",
    dueDate: "2023-04-27",
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState(ordersData)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<(typeof ordersData)[0] | null>(null)

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

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

  // Handle view order
  const handleViewOrder = (order: (typeof ordersData)[0]) => {
    setSelectedOrder(order)
    setIsViewOrderOpen(true)
  }

  // Handle edit order
  const handleEditOrder = (order: (typeof ordersData)[0]) => {
    setSelectedOrder(order)
    setIsEditOrderOpen(true)
  }

  // Handle delete order
  const handleDeleteClick = (order: (typeof ordersData)[0]) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete order
  const confirmDelete = () => {
    if (selectedOrder) {
      setOrders(orders.filter((order) => order.id !== selectedOrder.id))
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle add order
  const handleAddOrder = (newOrder: Omit<(typeof ordersData)[0], "id">) => {
    // Generate a new order ID
    const orderIds = orders.map((order) => Number.parseInt(order.id.replace("ORD-", "")))
    const maxId = Math.max(...orderIds)
    const newId = `ORD-${(maxId + 1).toString().padStart(3, "0")}`

    setOrders([...orders, { ...newOrder, id: newId }])
  }

  // Handle update order
  const handleUpdateOrder = (updatedOrder: (typeof ordersData)[0]) => {
    setOrders(orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage and view all client orders</p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => setIsAddOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Date</TableHead>
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
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View Order" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Order" onClick={() => handleEditOrder(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Order"
                            onClick={() => handleDeleteClick(order)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Order Dialog */}
      <AddOrderDialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen} onAddOrder={handleAddOrder} />

      {/* View Order Dialog */}
      {selectedOrder && (
        <ViewOrderDialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen} order={selectedOrder} />
      )}

      {/* Edit Order Dialog */}
      {selectedOrder && (
        <EditOrderDialog
          open={isEditOrderOpen}
          onOpenChange={setIsEditOrderOpen}
          order={selectedOrder}
          onUpdateOrder={handleUpdateOrder}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              {selectedOrder && <span className="font-medium"> {selectedOrder.id}</span>} and remove its data from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
