"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Edit } from "lucide-react"
import { Button } from "#components/shadcn/ui/button"
import { Input } from "#components/shadcn/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/shadcn/ui/table"
import { Card, CardContent } from "#components/shadcn/ui/card"
import { ClientApi, OrderApi } from "../../../../lib/utils/api"
import { Client, Order } from "../../../../lib/utils/api/types"

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, ordersData] = await Promise.all([
          ClientApi.getAll(),
          OrderApi.getAll()
        ])
        setClients(clientsData)
        setOrders(ordersData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get last order date for a client
  const getLastOrderDate = (clientId: number) => {
    const clientOrders = orders
      .filter(order => order.client_id === clientId)
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
    
    return clientOrders.length > 0 
      ? clientOrders[0].date_creation 
      : "No orders"
  }

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => 
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.telephone.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage and view all client information</p>
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients by name, email or phone..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Last Order Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.client_id}>
                      <TableCell className="font-medium">{client.prenom} {client.nom}</TableCell>
                      <TableCell>{client.email || "N/A"}</TableCell>
                      <TableCell>{client.telephone}</TableCell>
                      <TableCell>
                        {getLastOrderDate(client.client_id) === "No orders" 
                          ? "No orders" 
                          : new Date(getLastOrderDate(client.client_id)).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View Client">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Client">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No clients found.
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