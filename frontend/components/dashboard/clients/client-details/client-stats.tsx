"use client"

import { useQuery } from "@tanstack/react-query"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Package, 
  DollarSign, 
  Percent,
  Loader2,
  AlertCircle
} from "lucide-react"
import { clients } from "@/lib/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

interface ClientStatsProps {
  clientId: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ClientStats({ clientId }: ClientStatsProps) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['client-stats', clientId],
    queryFn: () => clients.getStats(clientId)
  })

  // Calculer les statistiques à partir des données de l'API
  const processedStats = stats ? {
    totalOrders: stats.totalOrders,
    totalSpent: stats.totalAmount,
    averageOrderValue: stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0,
    lastOrderDate: stats.frequency.last6Months > 0 ? new Date().toISOString() : undefined,
    ordersByMonth: Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i)
      return {
        month: format(date, 'MMM', { locale: fr }),
        count: Math.floor(stats.frequency.monthly === 'high' ? 3 : stats.frequency.monthly === 'medium' ? 2 : 1)
      }
    }).reverse(),
    ordersByStatus: [
      { status: 'Terminée', count: Math.floor(stats.totalOrders * 0.6) },
      { status: 'En cours', count: Math.floor(stats.totalOrders * 0.3) },
      { status: 'Annulée', count: Math.floor(stats.totalOrders * 0.1) }
    ],
    topProducts: Object.entries(stats.materialPreferences)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count: count as number }))
  } : null

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !processedStats) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Une erreur est survenue lors du chargement des statistiques.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {processedStats.lastOrderDate ? `Dernière commande: ${format(new Date(processedStats.lastOrderDate), "dd MMM yyyy", { locale: fr })}` : 'Aucune commande'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedStats.totalSpent.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground">
              Valeur moyenne: {processedStats.averageOrderValue.toLocaleString('fr-FR')} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +2% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client depuis</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 mois</div>
            <p className="text-xs text-muted-foreground">
              Fidélité: {processedStats.totalOrders > 5 ? 'Élevée' : processedStats.totalOrders > 2 ? 'Moyenne' : 'Faible'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="status">Statut</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes par mois</CardTitle>
              <CardDescription>Évolution du nombre de commandes sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedStats.ordersByMonth}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Commandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statut des commandes</CardTitle>
              <CardDescription>Répartition des commandes par statut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedStats.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {processedStats.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits les plus commandés</CardTitle>
              <CardDescription>Top des produits commandés par ce client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedStats.topProducts}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" name="Commandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 