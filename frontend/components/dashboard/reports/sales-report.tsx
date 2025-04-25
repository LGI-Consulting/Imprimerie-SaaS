"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { BaseReport } from "./base-report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportsData } from "@/lib/api/reports-data"
import type { Client, Materiau } from "@/lib/api/types"

// Types pour les données de vente
interface SalesData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  ordersByStatus: Record<string, number>
  revenueByPeriod: Array<{ period: string; revenue: number }>
  topClients: Array<{ client: Client; totalSpent: number }>
  topMaterials: Array<{ material: Materiau; quantity: number }>
}

interface SalesReportProps {
  dateRange?: DateRange
}

export function SalesReport({ dateRange }: SalesReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<SalesData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const salesData = await reportsData.getSalesData(dateRange)
        setData(salesData)
        setError(null)
      } catch (err) {
        console.error("Error fetching sales data:", err)
        setError("Impossible de charger les données de ventes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (error) {
    return (
      <BaseReport
        title="Rapport des ventes"
        description="Analyse des ventes et des revenus"
        dateRange={dateRange}
        isLoading={false}
      >
        <div className="text-red-500">{error}</div>
      </BaseReport>
    )
  }

  return (
    <BaseReport
      title="Rapport des ventes"
      description="Analyse des ventes et des revenus"
      dateRange={dateRange}
      isLoading={isLoading}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(data.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(data.averageOrderValue)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commandes par statut</CardTitle>
              <CardDescription>Répartition des commandes selon leur statut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top clients</CardTitle>
              <CardDescription>Clients ayant généré le plus de revenus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topClients.map(({ client, totalSpent }) => (
                  <div key={client.client_id} className="flex items-center justify-between">
                    <span>
                      {client.nom} {client.prenom}
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(totalSpent)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </BaseReport>
  )
} 