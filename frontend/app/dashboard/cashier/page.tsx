"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiDollarSign, FiCheckCircle, FiClock, FiList } from "react-icons/fi"
import Link from "next/link"

export default function CashierDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cashier Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your cashier workspace. Process payments and manage financial transactions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/payments/pending">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <FiClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Orders awaiting payment</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/payments/history">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <FiDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,245.50</div>
              <p className="text-xs text-muted-foreground">Processed today</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Orders</CardTitle>
              <FiList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Total orders</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Orders awaiting payment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for pending payments list */}
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">Order #12345</p>
                  <p className="text-sm text-muted-foreground">Client: Acme Corp - $450.00</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">Order #12344</p>
                  <p className="text-sm text-muted-foreground">Client: XYZ Inc - $275.50</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">Order #12343</p>
                  <p className="text-sm text-muted-foreground">Client: 123 Company - $520.00</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for cashier staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/payments/pending">
                <Button className="w-full justify-start" variant="outline">
                  <FiClock className="mr-2 h-4 w-4" />
                  Process Pending Payments
                </Button>
              </Link>
              <Link href="/dashboard/payments/history">
                <Button className="w-full justify-start" variant="outline">
                  <FiCheckCircle className="mr-2 h-4 w-4" />
                  View Payment History
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button className="w-full justify-start" variant="outline">
                  <FiList className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
