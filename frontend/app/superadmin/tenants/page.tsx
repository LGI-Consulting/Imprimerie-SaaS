"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MoreHorizontal, Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for tenants
const initialTenants = [
  {
    id: "1",
    name: "Acme Inc",
    domain: "acme.example.com",
    plan: "Enterprise",
    status: "active",
    users: 120,
    createdAt: "2023-01-15",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Globex Corp",
    domain: "globex.example.com",
    plan: "Professional",
    status: "active",
    users: 85,
    createdAt: "2023-02-20",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Stark Industries",
    domain: "stark.example.com",
    plan: "Enterprise",
    status: "active",
    users: 210,
    createdAt: "2023-03-10",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Wayne Enterprises",
    domain: "wayne.example.com",
    plan: "Professional",
    status: "active",
    users: 95,
    createdAt: "2023-04-05",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Umbrella Corp",
    domain: "umbrella.example.com",
    plan: "Enterprise",
    status: "active",
    users: 150,
    createdAt: "2023-05-12",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    name: "Pied Piper",
    domain: "piedpiper.example.com",
    plan: "Starter",
    status: "trial",
    users: 12,
    createdAt: "2023-08-01",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "7",
    name: "Hooli",
    domain: "hooli.example.com",
    plan: "Professional",
    status: "inactive",
    users: 0,
    createdAt: "2023-06-15",
    logo: "/placeholder.svg?height=40&width=40",
  },
]

export default function TenantsPage() {
  const [tenants, setTenants] = useState(initialTenants)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTenant, setCurrentTenant] = useState<any>(null)
  const [newTenant, setNewTenant] = useState({
    name: "",
    domain: "",
    plan: "Starter",
    description: "",
    adminEmail: "",
    adminName: "",
  })

  // Filter tenants based on search query
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle creating a new tenant
  const handleCreateTenant = () => {
    const tenant = {
      id: (tenants.length + 1).toString(),
      name: newTenant.name,
      domain: newTenant.domain,
      plan: newTenant.plan,
      status: "active",
      users: 1, // Start with admin user
      createdAt: new Date().toISOString().split("T")[0],
      logo: "/placeholder.svg?height=40&width=40",
    }
    setTenants([...tenants, tenant])
    setNewTenant({
      name: "",
      domain: "",
      plan: "Starter",
      description: "",
      adminEmail: "",
      adminName: "",
    })
    setIsCreateDialogOpen(false)
  }

  // Handle updating a tenant
  const handleUpdateTenant = () => {
    if (!currentTenant) return

    const updatedTenants = tenants.map((tenant) =>
      tenant.id === currentTenant.id ? { ...tenant, ...currentTenant } : tenant,
    )
    setTenants(updatedTenants)
    setIsEditDialogOpen(false)
  }

  // Handle deleting a tenant
  const handleDeleteTenant = () => {
    if (!currentTenant) return

    const updatedTenants = tenants.filter((tenant) => tenant.id !== currentTenant.id)
    setTenants(updatedTenants)
    setIsDeleteDialogOpen(false)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "trial":
        return <Badge className="bg-yellow-500">Trial</Badge>
      case "inactive":
        return <Badge className="bg-red-500">Inactive</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage all tenants in your system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant to your multi-tenant system. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tenant-name">Tenant Name</Label>
                  <Input
                    id="tenant-name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    placeholder="Acme Inc"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tenant-domain">Domain</Label>
                  <Input
                    id="tenant-domain"
                    value={newTenant.domain}
                    onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                    placeholder="acme.example.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tenant-plan">Subscription Plan</Label>
                <Select value={newTenant.plan} onValueChange={(value) => setNewTenant({ ...newTenant, plan: value })}>
                  <SelectTrigger id="tenant-plan">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tenant-description">Description</Label>
                <Textarea
                  id="tenant-description"
                  value={newTenant.description}
                  onChange={(e) => setNewTenant({ ...newTenant, description: e.target.value })}
                  placeholder="Brief description of the tenant"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="admin-name">Admin Name</Label>
                  <Input
                    id="admin-name"
                    value={newTenant.adminName}
                    onChange={(e) => setNewTenant({ ...newTenant, adminName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={newTenant.adminEmail}
                    onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTenant}>Create Tenant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Management</CardTitle>
          <CardDescription>View and manage all tenants in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          {tenant.logo ? (
                            <img
                              src={tenant.logo || "/placeholder.svg"}
                              alt={tenant.name}
                              className="h-8 w-8 rounded-md"
                            />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tenant.domain}</TableCell>
                    <TableCell>{tenant.plan}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>{tenant.users}</TableCell>
                    <TableCell>{tenant.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(`https://${tenant.domain}`, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Tenant
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentTenant(tenant)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Tenant
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentTenant(tenant)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Tenant
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Tenant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>Update tenant information and settings.</DialogDescription>
          </DialogHeader>
          {currentTenant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-tenant-name">Tenant Name</Label>
                  <Input
                    id="edit-tenant-name"
                    value={currentTenant.name}
                    onChange={(e) => setCurrentTenant({ ...currentTenant, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tenant-domain">Domain</Label>
                  <Input
                    id="edit-tenant-domain"
                    value={currentTenant.domain}
                    onChange={(e) => setCurrentTenant({ ...currentTenant, domain: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-tenant-plan">Subscription Plan</Label>
                  <Select
                    value={currentTenant.plan}
                    onValueChange={(value) => setCurrentTenant({ ...currentTenant, plan: value })}
                  >
                    <SelectTrigger id="edit-tenant-plan">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Starter">Starter</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tenant-status">Status</Label>
                  <Select
                    value={currentTenant.status}
                    onValueChange={(value) => setCurrentTenant({ ...currentTenant, status: value })}
                  >
                    <SelectTrigger id="edit-tenant-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTenant}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant
              <span className="font-semibold"> {currentTenant?.name}</span> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTenant} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
