"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Building2, Users, CreditCard, HardDrive, Clock, Shield, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock tenant data
const tenantData = {
  id: "3",
  name: "Stark Industries",
  domain: "stark.example.com",
  plan: "Enterprise",
  status: "active",
  users: 210,
  createdAt: "2023-03-10",
  logo: "/placeholder.svg?height=100&width=100",
  description: "A multinational conglomerate with interests in various advanced technologies and industries.",
  contactEmail: "admin@stark.example.com",
  contactPhone: "+1 (555) 123-4567",
  address: "200 Park Avenue, New York, NY 10166",
  storageUsed: 75, // percentage
  lastBillingDate: "2023-08-01",
  nextBillingDate: "2023-09-01",
  billingAmount: 1999.99,
}

// Mock users data
const usersData = [
  {
    id: "1",
    name: "Tony Stark",
    email: "tony@stark.example.com",
    role: "Admin",
    lastActive: "2023-08-15T14:30:00Z",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Pepper Potts",
    email: "pepper@stark.example.com",
    role: "Admin",
    lastActive: "2023-08-15T10:15:00Z",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Happy Hogan",
    email: "happy@stark.example.com",
    role: "Manager",
    lastActive: "2023-08-14T16:45:00Z",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function TenantDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tenant, setTenant] = useState(tenantData)
  const [activeTab, setActiveTab] = useState("overview")

  // Format date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format datetime string
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle tenant update
  const handleUpdateTenant = () => {
    toast({
      title: "Tenant updated",
      description: "The tenant information has been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>{tenant.name}</span>
            <Badge className={tenant.status === "active" ? "bg-green-500" : "bg-yellow-500"}>
              {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
            </Badge>
          </h2>
          <p className="text-muted-foreground">{tenant.domain}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant.users}</div>
                <p className="text-xs text-muted-foreground">+12 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant.plan}</div>
                <p className="text-xs text-muted-foreground">Next billing: {formatDate(tenant.nextBillingDate)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant.storageUsed}%</div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${
                      tenant.storageUsed > 90
                        ? "bg-red-500"
                        : tenant.storageUsed > 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${tenant.storageUsed}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created On</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDate(tenant.createdAt)}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor((new Date().getTime() - new Date(tenant.createdAt).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                  days ago
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
                <CardDescription>Basic information about this tenant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                    {tenant.logo ? (
                      <img src={tenant.logo || "/placeholder.svg"} alt={tenant.name} className="h-16 w-16 rounded-md" />
                    ) : (
                      <Building2 className="h-10 w-10" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Contact Email:</span>
                    <span className="text-sm">{tenant.contactEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Contact Phone:</span>
                    <span className="text-sm">{tenant.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Address:</span>
                    <span className="text-sm">{tenant.address}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Description:</h4>
                  <p className="text-sm">{tenant.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New user added</p>
                      <p className="text-xs text-muted-foreground">User "James Rhodes" was added to the tenant</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment processed</p>
                      <p className="text-xs text-muted-foreground">
                        Monthly subscription payment of ${tenant.billingAmount} was processed
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Security settings updated</p>
                      <p className="text-xs text-muted-foreground">
                        Two-factor authentication was enabled for all admin users
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Settings</CardTitle>
              <CardDescription>Manage tenant configuration and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tenant-name">Tenant Name</Label>
                  <Input
                    id="tenant-name"
                    value={tenant.name}
                    onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tenant-domain">Domain</Label>
                  <Input
                    id="tenant-domain"
                    value={tenant.domain}
                    onChange={(e) => setTenant({ ...tenant, domain: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tenant-email">Contact Email</Label>
                  <Input
                    id="tenant-email"
                    type="email"
                    value={tenant.contactEmail}
                    onChange={(e) => setTenant({ ...tenant, contactEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tenant-phone">Contact Phone</Label>
                  <Input
                    id="tenant-phone"
                    value={tenant.contactPhone}
                    onChange={(e) => setTenant({ ...tenant, contactPhone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="tenant-address">Address</Label>
                  <Input
                    id="tenant-address"
                    value={tenant.address}
                    onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="tenant-description">Description</Label>
                  <Textarea
                    id="tenant-description"
                    value={tenant.description}
                    onChange={(e) => setTenant({ ...tenant, description: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tenant Status</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="tenant-status">Status</Label>
                    <Select value={tenant.status} onValueChange={(value) => setTenant({ ...tenant, status: value })}>
                      <SelectTrigger id="tenant-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenant-plan">Subscription Plan</Label>
                    <Select value={tenant.plan} onValueChange={(value) => setTenant({ ...tenant, plan: value })}>
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
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Settings</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enforce-2fa">Enforce Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require all users to set up two-factor authentication
                    </p>
                  </div>
                  <Switch id="enforce-2fa" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="password-policy">Strong Password Policy</Label>
                    <p className="text-sm text-muted-foreground">Enforce complex password requirements for all users</p>
                  </div>
                  <Switch id="password-policy" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ip-restrictions">IP Restrictions</Label>
                    <p className="text-sm text-muted-foreground">Limit access to specific IP addresses or ranges</p>
                  </div>
                  <Switch id="ip-restrictions" />
                </div>
              </div>
            </CardContent>
            <div className="flex items-center justify-end p-6 pt-0">
              <Button onClick={handleUpdateTenant}>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Users</CardTitle>
              <CardDescription>Manage users for this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Showing {usersData.length} of {tenant.users} users
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>

              <div className="space-y-4">
                {usersData.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{user.role}</Badge>
                      <div className="text-sm text-muted-foreground">
                        Last active: {formatDateTime(user.lastActive)}
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage subscription and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Current Plan: {tenant.plan}</h3>
                    <p className="text-sm text-muted-foreground">${tenant.billingAmount.toFixed(2)} billed monthly</p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-sm">{formatDate(tenant.nextBillingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Payment</p>
                    <p className="text-sm">
                      ${tenant.billingAmount.toFixed(2)} on {formatDate(tenant.lastBillingDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Update
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Billing History</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Invoice #INV-001</p>
                      <p className="text-sm text-muted-foreground">{formatDate(tenant.lastBillingDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-500">
                        Paid
                      </Badge>
                      <p className="text-sm font-medium">${tenant.billingAmount.toFixed(2)}</p>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Invoice #INV-002</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          new Date(
                            new Date(tenant.lastBillingDate).setMonth(new Date(tenant.lastBillingDate).getMonth() - 1),
                          ).toISOString(),
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-500">
                        Paid
                      </Badge>
                      <p className="text-sm font-medium">${tenant.billingAmount.toFixed(2)}</p>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
