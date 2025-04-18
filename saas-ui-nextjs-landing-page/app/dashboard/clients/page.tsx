"use client"

import { useState } from "react"
import { Search, Plus, Eye, Edit } from "lucide-react"
import { Button } from "#components/shadcn/ui/button"
import { Input } from "#components/shadcn/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/shadcn/ui/table"
import { Card, CardContent } from "#components/shadcn/ui/card"

// Sample data for clients
const clients = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    lastOrderDate: "2023-04-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 234-5678",
    lastOrderDate: "2023-04-10",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "(555) 345-6789",
    lastOrderDate: "2023-04-05",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(555) 456-7890",
    lastOrderDate: "2023-03-28",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "(555) 567-8901",
    lastOrderDate: "2023-03-22",
  },
  {
    id: 6,
    name: "Lisa Martinez",
    email: "lisa.martinez@example.com",
    phone: "(555) 678-9012",
    lastOrderDate: "2023-03-15",
  },
  {
    id: 7,
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    phone: "(555) 789-0123",
    lastOrderDate: "2023-03-10",
  },
  {
    id: 8,
    name: "Jennifer Anderson",
    email: "jennifer.anderson@example.com",
    phone: "(555) 890-1234",
    lastOrderDate: "2023-03-05",
  },
]

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
              placeholder="Search clients by name..."
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
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{new Date(client.lastOrderDate).toLocaleDateString()}</TableCell>
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
