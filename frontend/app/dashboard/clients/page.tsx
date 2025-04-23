"use client"

import { useState } from "react"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { AddClientDialog } from "@/components/dashboard/clients/add-client-dialog"
import { ViewClientDialog } from "@/components/dashboard/clients/view-client-dialog"
import { EditClientDialog } from "@/components/dashboard/clients/edit-client-dialog"
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

// Sample data for clients
const clientsData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    lastOrderDate: "2023-04-15",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    notes: "Prefers email communication",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 234-5678",
    lastOrderDate: "2023-04-10",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    notes: "Regular customer, orders monthly",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "(555) 345-6789",
    lastOrderDate: "2023-04-05",
    address: "789 Pine St",
    city: "Chicago",
    state: "IL",
    zipCode: "60007",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(555) 456-7890",
    lastOrderDate: "2023-03-28",
    address: "321 Elm St",
    city: "Houston",
    state: "TX",
    zipCode: "77001",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "(555) 567-8901",
    lastOrderDate: "2023-03-22",
    address: "654 Maple Dr",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85001",
    notes: "Prefers phone calls",
  },
  {
    id: 6,
    name: "Lisa Martinez",
    email: "lisa.martinez@example.com",
    phone: "(555) 678-9012",
    lastOrderDate: "2023-03-15",
    address: "987 Cedar Ln",
    city: "Philadelphia",
    state: "PA",
    zipCode: "19019",
  },
  {
    id: 7,
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    phone: "(555) 789-0123",
    lastOrderDate: "2023-03-10",
    address: "741 Birch Rd",
    city: "San Antonio",
    state: "TX",
    zipCode: "78201",
  },
  {
    id: 8,
    name: "Jennifer Anderson",
    email: "jennifer.anderson@example.com",
    phone: "(555) 890-1234",
    lastOrderDate: "2023-03-05",
    address: "852 Spruce Ave",
    city: "San Diego",
    state: "CA",
    zipCode: "92101",
    notes: "New client, referred by Sarah Johnson",
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState(clientsData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isViewClientOpen, setIsViewClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<(typeof clientsData)[0] | null>(null)

  // Filter clients based on search query
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle view client
  const handleViewClient = (client: (typeof clientsData)[0]) => {
    setSelectedClient(client)
    setIsViewClientOpen(true)
  }

  // Handle edit client
  const handleEditClient = (client: (typeof clientsData)[0]) => {
    setSelectedClient(client)
    setIsEditClientOpen(true)
  }

  // Handle delete client
  const handleDeleteClick = (client: (typeof clientsData)[0]) => {
    setSelectedClient(client)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete client
  const confirmDelete = () => {
    if (selectedClient) {
      setClients(clients.filter((client) => client.id !== selectedClient.id))
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle add client
  const handleAddClient = (newClient: Omit<(typeof clientsData)[0], "id" | "lastOrderDate">) => {
    const newId = Math.max(...clients.map((client) => client.id)) + 1
    const today = new Date().toISOString().split("T")[0]
    setClients([...clients, { ...newClient, id: newId, lastOrderDate: today }])
  }

  // Handle update client
  const handleUpdateClient = (updatedClient: (typeof clientsData)[0]) => {
    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage and view all client information</p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => setIsAddClientOpen(true)}>
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
              placeholder="Search clients by name, email, or phone..."
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
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Client"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Client"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Client"
                            onClick={() => handleDeleteClick(client)}
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
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Client Dialog */}
      <AddClientDialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen} onAddClient={handleAddClient} />

      {/* View Client Dialog */}
      {selectedClient && (
        <ViewClientDialog open={isViewClientOpen} onOpenChange={setIsViewClientOpen} client={selectedClient} />
      )}

      {/* Edit Client Dialog */}
      {selectedClient && (
        <EditClientDialog
          open={isEditClientOpen}
          onOpenChange={setIsEditClientOpen}
          client={selectedClient}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              {selectedClient && <span className="font-medium"> {selectedClient.name}</span>} and remove their data from
              the system.
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
