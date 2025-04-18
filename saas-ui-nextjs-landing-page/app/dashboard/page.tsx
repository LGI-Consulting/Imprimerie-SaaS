'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#components/shadcn/ui/card"
import { Activity, DollarSign, Users, Package } from "lucide-react"
import { useEffect, useState } from "react"
import { OrderApi, ClientApi, PaymentApi, MaterialApi } from "../../lib/api"
import { Order, Client, Payment, Material } from "../../lib/api/types"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newClients: 0,
    inventoryItems: 0,
    activeOrders: 0,
    revenueChange: 0,
    clientsChange: 0,
    inventoryChange: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topClients, setTopClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [orders, clients, payments, materials] = await Promise.all([
          OrderApi.getAll(),
          ClientApi.getAll(),
          PaymentApi.getAllPayments(),
          MaterialApi.getAll()
        ])

        // Calculate stats
        const now = new Date()
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1))
        
        const totalRevenue = payments
          .filter(p => p.statut === 'validé')
          .reduce((sum, payment) => sum + payment.montant, 0)
          
        const newClients = clients.filter(c => 
          new Date(c.date_creation) > lastMonth
        ).length
        
        const activeOrders = orders.filter(o => 
          o.statut !== 'terminée' && o.statut !== 'livrée'
        ).length
        
        // Calculate changes (simplified - in a real app you'd compare with last month's data)
        const revenueChange = 20.1 // You would calculate this from historical data
        const clientsChange = 10.1
        const inventoryChange = 12

        setStats({
          totalRevenue,
          newClients,
          inventoryItems: materials.length,
          activeOrders,
          revenueChange,
          clientsChange,
          inventoryChange
        })

        // Get recent orders (last 5)
        setRecentOrders(orders
          .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
          .slice(0, 5)
        )

        // Get top clients (simplified - would normally look at payment amounts)
        setTopClients(clients.slice(0, 5))

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.newClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.clientsChange >= 0 ? '+' : ''}{stats.clientsChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inventoryItems}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.inventoryChange} new items this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              {recentOrders.filter(o => o.statut === 'reçue').length} pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent orders across all clients</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.commande_id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">Order #{order.numero_commande}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date_creation).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium capitalize">{order.statut}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.priorite > 0 ? 'High priority' : 'Normal'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No recent orders
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Your highest value clients this month</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <div className="space-y-4">
                {topClients.map(client => (
                  <div key={client.client_id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">{client.prenom} {client.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.telephone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {recentOrders.filter(o => o.client_id === client.client_id).length} orders
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last visit: {new Date(client.derniere_visite).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No client data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}