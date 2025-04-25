"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportsData } from "@/lib/api/reports-data"
import { employes } from "@/lib/api/employes"
import { 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Activity, 
  TrendingUp,
  AlertCircle,
  BarChart2
} from "lucide-react"

interface AdminStatsProps {
  dateRange?: DateRange
}

interface StatsData {
  // Rapports
  totalRevenue: number
  activeClients: number
  totalOrders: number
  completedOrders: number
  stockAlerts: number
  // Employés
  totalEmployees: number
  activeEmployees: number
  employeesByRole: Record<string, number>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

export function AdminStats({ dateRange }: AdminStatsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<StatsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Récupérer les données des rapports
        const [financialData, clientData, productionData, materialsData, employeesData] = await Promise.all([
          reportsData.getFinancialData(dateRange),
          reportsData.getClientData(dateRange),
          reportsData.getProductionData(dateRange),
          reportsData.getMaterialsData(dateRange),
          employes.getAll()
        ])

        // Compter les employés par rôle
        const employeesByRole = employeesData.reduce((acc, employee) => {
          acc[employee.role] = (acc[employee.role] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Compter les employés actifs
        const activeEmployees = employeesData.filter(emp => emp.est_actif).length

        setData({
          // Rapports
          totalRevenue: financialData.totalRevenue,
          activeClients: clientData.activeClients,
          totalOrders: productionData.totalOrders,
          completedOrders: productionData.completedOrders,
          stockAlerts: materialsData.lowStockAlerts.length,
          // Employés
          totalEmployees: employeesData.length,
          activeEmployees,
          employeesByRole,
          // Activité récente (exemple)
          recentActivity: [
            {
              type: "system",
              description: "Mise à jour des paramètres système",
              timestamp: new Date().toISOString()
            },
            {
              type: "employee",
              description: "Nouvel employé ajouté",
              timestamp: new Date().toISOString()
            }
          ]
        })
        setError(null)
      } catch (err) {
        console.error("Error fetching admin stats:", err)
        setError("Impossible de charger les statistiques")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Fonction pour formater les montants en euros
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Fonction pour formater les pourcentages
  const formatPercentage = (value: number, total: number): string => {
    return `${((value / total) * 100).toFixed(1)}%`
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des rapports */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(data?.totalRevenue || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">{data?.activeClients || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold">{data?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.completedOrders || 0} terminées
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">{data?.stockAlerts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold">{data?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.activeEmployees || 0} actifs
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <BarChart2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                {data?.totalOrders && data?.completedOrders
                  ? formatPercentage(data.completedOrders, data.totalOrders)
                  : "0%"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Répartition des employés par rôle */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par rôle</CardTitle>
          <CardDescription>Distribution des employés selon leur rôle</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {data?.employeesByRole && Object.entries(data.employeesByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="capitalize">{role}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Dernières actions effectuées dans le système</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {data?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 