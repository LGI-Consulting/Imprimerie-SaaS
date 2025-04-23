"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiPrinter, FiBox, FiList, FiCheckCircle } from "react-icons/fi"
import Link from "next/link"

export default function DesignerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Designer Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your designer workspace. Process print jobs and manage inventory.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/designer/print-queue">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Print Queue</CardTitle>
              <FiPrinter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Orders awaiting printing</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inventory">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <FiBox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">432</div>
              <p className="text-xs text-muted-foreground">Items in stock</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <FiCheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Orders completed</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Print Queue</CardTitle>
            <CardDescription>Orders paid but awaiting printing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for print queue list */}
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">Order #12345</p>
                  <p className="text-sm text-muted-foreground">Client: Acme Corp - Business Cards</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">Order #12344</p>
                  <p className="text-sm text-muted-foreground">Client: XYZ Inc - Brochures</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">Order #12343</p>
                  <p className="text-sm text-muted-foreground">Client: 123 Company - Posters</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for designer staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/designer/print-queue">
                <Button className="w-full justify-start" variant="outline">
                  <FiPrinter className="mr-2 h-4 w-4" />
                  Process Print Queue
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button className="w-full justify-start" variant="outline">
                  <FiBox className="mr-2 h-4 w-4" />
                  Check Inventory
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
