"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, User } from "lucide-react"

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
import { TenantAdminForm } from "@/components/tenant/tenant-admin-form"

// Mock admin data
const admins = [
  {
    id: "admin-1",
    name: "John Doe",
    email: "john@acme.com",
    tenantName: "Acme Corp",
    tenantId: "tenant-1",
    createdAt: "2023-01-20",
  },
  {
    id: "admin-2",
    name: "Jane Smith",
    email: "jane@acme.com",
    tenantName: "Acme Corp",
    tenantId: "tenant-1",
    createdAt: "2023-01-25",
  },
  {
    id: "admin-3",
    name: "Bob Johnson",
    email: "bob@globex.com",
    tenantName: "Globex Corporation",
    tenantId: "tenant-2",
    createdAt: "2023-02-22",
  },
]

export default function AdminsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Admins</h1>
          <p className="text-muted-foreground">Manage tenant administrators</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tenant Admin</DialogTitle>
              <DialogDescription>Create a new administrator for a tenant</DialogDescription>
            </DialogHeader>
            <TenantAdminForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle>{admin.name}</CardTitle>
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
                  <DropdownMenuItem>Edit Admin</DropdownMenuItem>
                  <DropdownMenuItem>Reset Password</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete Admin</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription>Email: {admin.email}</CardDescription>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Tenant</span>
                  <span className="text-sm">{admin.tenantName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">{admin.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
