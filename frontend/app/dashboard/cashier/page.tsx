"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Receipt, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function CashierDashboard() {
  const [stats, setStats] = useState({
    ordersToProcess: 0,
    dailyRevenue: 0,
    pendingPayments: 0,
    dailyTarget: 0,
    recentOrders: [],
  })

  // Simulate fetching data
  useEffect(() => {
    // This would be an API call in a real application
    setStats({
      ordersToProcess: 8,
      dailyRevenue: 678.5,
      pendingPayments: 3,
      dailyTarget: 1200,
      recentOrders: [],
    })
  }, [])

  // Calculate progress towards daily target
  const targetProgress = Math.min(100, (stats.dailyRevenue / stats.dailyTarget) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cashier Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your payment processing tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders to Process</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersToProcess}</div>
            <p className="text-xs text-muted-foreground">Pending payment processing</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/cashier/unpaid-orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.dailyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Daily target: ${stats.dailyTarget.toFixed(2)}</p>
            <div className="mt-2">
              <Progress value={targetProgress} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{targetProgress.toFixed(0)}% of daily target</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Payments needing attention</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/dashboard/cashier/process-payment">Process Payments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Reports</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">End of day reports</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/cashier/daily-reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Orders Waiting for Payment</CardTitle>
            <CardDescription>Recently created orders pending payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Business Cards - John Smith</p>
                    <p className="text-sm text-muted-foreground">Order #1234 • $45.99</p>
                  </div>
                </div>
                <Badge>Unpaid</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Brochures - Acme Corp</p>
                    <p className="text-sm text-muted-foreground">Order #1235 • $129.50</p>
                  </div>
                </div>
                <Badge>Unpaid</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Posters - City Event</p>
                    <p className="text-sm text-muted-foreground">Order #1236 • $78.00</p>
                  </div>
                </div>
                <Badge>Unpaid</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Payment Processing Overview</CardTitle>
            <CardDescription>Today's payment processing statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Cash Payments</h3>
                  <p className="text-2xl font-bold">$245.00</p>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Card Payments</h3>
                  <p className="text-2xl font-bold">$433.50</p>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Invoices Generated</h3>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Receipts Printed</h3>
                  <p className="text-2xl font-bold">9</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
