"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiShoppingCart, FiUsers, FiBox, FiList } from "react-icons/fi"
import Link from "next/link"
import { useOrders } from "@/hooks/use-orders"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Order } from "@/lib/order-service"

export default function ReceptionDashboard() {
  const { orders, loading, error, fetchOrders } = useOrders();
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Process orders data when it changes
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Count orders created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.date_creation);
        return orderDate >= today;
      });
      
      setTodayOrdersCount(todayOrders.length);
      
      // Get recent orders (last 5)
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
      );
      
      setRecentOrders(sortedOrders.slice(0, 5));
    }
  }, [orders]);
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reception Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your reception workspace. Manage orders, clients, and inventory.</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/reception/new-order">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Orders</CardTitle>
              <FiShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{todayOrdersCount}</div>
              )}
              <p className="text-xs text-muted-foreground">Orders created today</p>
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
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {orders && orders.length > 0 
                    ? [...new Set(orders.map(order => order.client_id))].length 
                    : 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Active clients</p>
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
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {orders && orders.length > 0 
                    ? [...new Set(orders.flatMap(order => 
                        order.details.map(detail => detail.commentaires?.materiau_nom).filter(Boolean)
                      ))].length 
                    : 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Paper types in use</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.commande_id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Order #{order.numero_commande}</p>
                      <p className="text-sm text-muted-foreground">
                        Client: {order.client?.nom} {order.client?.prenom}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge className={`text-xs ${getStatusColor(order.statut)}`}>
                          {order.statut}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(order.date_creation), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/orders/${order.commande_id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No orders found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for reception staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/reception/new-order">
                <Button className="w-full justify-start" variant="outline">
                  <FiShoppingCart className="mr-2 h-4 w-4" />
                  Create New Order
                </Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button className="w-full justify-start" variant="outline">
                  <FiUsers className="mr-2 h-4 w-4" />
                  Manage Clients
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
