"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FiUsers, 
  FiDollarSign, 
  FiSettings, 
  FiBarChart2, 
  FiUserPlus, 
  FiBox,
  FiList,
  FiShoppingCart
} from "react-icons/fi"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin workspace. Manage your entire printing business from here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/orders">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <FiList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">All-time orders</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/clients">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <FiUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/payments">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <FiDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">This month</p>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/reception/new-order">
                <Button className="w-full justify-start" variant="outline">
                  <FiShoppingCart className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button className="w-full justify-start" variant="outline">
                  <FiUsers className="mr-2 h-4 w-4" />
                  Manage Clients
                </Button>
              </Link>
              <Link href="/dashboard/employees">
                <Button className="w-full justify-start" variant="outline">
                  <FiUserPlus className="mr-2 h-4 w-4" />
                  Manage Employees
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button className="w-full justify-start" variant="outline">
                  <FiBox className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button className="w-full justify-start" variant="outline">
                  <FiBarChart2 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button className="w-full justify-start" variant="outline">
                  <FiSettings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for recent activity list */}
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">New order created</p>
                  <p className="text-xs text-muted-foreground">Order #12345 by Acme Corp</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">Payment processed</p>
                  <p className="text-xs text-muted-foreground">Order #12344 by XYZ Inc</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-medium">Print job completed</p>
                  <p className="text-xs text-muted-foreground">Order #12343 by 123 Company</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 