"use client"

import { useState } from "react"
import { Building2, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TenantForm } from "@/components/tenant/tenant-form"

// Mock tenant data
const tenants = [
  {
    id: "tenant-1",
    name: "Acme Corp",
    domain: "acme",
    adminCount: 2,
    userCount: 24,
    createdAt: "2023-01-15",
  },
  {
    id: "tenant-2",
    name: "Globex Corporation",
    domain: "globex",
    adminCount: 1,
    userCount: 18,
    createdAt: "2023-02-20",
  },
  {
    id: "tenant-3",
    name: "Initech",
    domain: "initech",
    adminCount: 3,
    userCount: 42,
    createdAt: "2023-03-10",
  },
]

export default function TenantsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Manage your SaaS tenants</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tenant</DialogTitle>
              <DialogDescription>Create a new tenant for your SaaS platform</DialogDescription>
            </DialogHeader>
            <TenantForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <CardTitle>{tenant.name}</CardTitle>
              </div>
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
                  <DropdownMenuItem>Edit Tenant</DropdownMenuItem>
                  <DropdownMenuItem>View Admins</DropdownMenuItem>
                  <DropdownMenuItem>View Users</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete Tenant</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription>Domain: {tenant.domain}</CardDescription>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admins</span>
                  <span className="text-2xl font-bold">{tenant.adminCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Users</span>
                  <span className="text-2xl font-bold">{tenant.userCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">{tenant.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
