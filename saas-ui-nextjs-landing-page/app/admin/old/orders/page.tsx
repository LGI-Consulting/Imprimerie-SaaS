"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table"
import { Badge } from "#components/ui/badge"
import { Card, CardContent } from "#components/ui/card"
import { OrderApi, ClientApi } from "../../../../lib/api"
import { Order, Client } from "../../../../lib/api/types"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, clientsData] = await Promise.all([
          OrderApi.getAll(),
          ClientApi.getAll()
        ])
        setOrders(ordersData)
        setClients(clientsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get client name by ID
  const getClientName = (clientId: number | null) => {
    if (!clientId) return "Unknown Client"
    const client = clients.find(c => c.client_id === clientId)
    return client ? `${client.prenom} ${client.nom}` : "Unknown Client"
  }

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.numero_commande?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(order.client_id).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = 
      statusFilter === "all" || 
      order.statut.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "terminée":
      case "livrée":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "en_impression":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "reçue":
      case "payée":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "reçue": return "Received"
      case "payée": return "Paid"
      case "en_impression": return "In Progress"
      case "terminée": return "Completed"
      case "livrée": return "Delivered"
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage and view all client orders</p>
        </div>
        <Button className="sm:w-auto w-full">
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
                  <SelectItem value="reçue">Received</SelectItem>
                  <SelectItem value="payée">Paid</SelectItem>
                  <SelectItem value="en_impression">In Progress</SelectItem>
                  <SelectItem value="terminée">Completed</SelectItem>
                  <SelectItem value="livrée">Delivered</SelectItem>
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
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.commande_id}>
                      <TableCell className="font-medium">{order.numero_commande}</TableCell>
                      <TableCell>{getClientName(order.client_id)}</TableCell>
                      <TableCell>{new Date(order.date_creation).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.statut)}>
                          {formatStatus(order.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.priorite > 0 ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                            High
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View Order">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Order">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}