"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FilePenLine, Users, Package, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReceptionDashboard() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalClients: 0,
    lowInventoryItems: 0,
    recentOrders: [],
  })

  // Simulate fetching data
  useEffect(() => {
    // This would be an API call in a real application
    setStats({
      pendingOrders: 12,
      totalClients: 156,
      lowInventoryItems: 3,
      recentOrders: [],
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reception Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of the print shop's current status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/reception/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Registered clients</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/reception/clients">Manage Clients</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowInventoryItems}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/reception/inventory">Check Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard/reception/new-order">
                <FilePenLine className="mr-2 h-4 w-4" />
                Create New Order
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/dashboard/reception/new-client">
                <Users className="mr-2 h-4 w-4" />
                Add New Client
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming order deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-md border p-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Large Format Poster</p>
                  <p className="text-sm text-muted-foreground">Due: Today, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-md border p-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Business Cards (250)</p>
                  <p className="text-sm text-muted-foreground">Due: Today, 4:30 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-md border p-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Brochure Printing</p>
                  <p className="text-sm text-muted-foreground">Due: Tomorrow, 10:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
