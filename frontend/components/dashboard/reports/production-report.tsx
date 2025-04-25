"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { BaseReport } from "./base-report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportsData } from "@/lib/api/reports-data"
import type { Employe } from "@/lib/api/types"

// Types pour les données de production
interface ProductionData {
  totalOrders: number
  completedOrders: number
  averageProcessingTime: number
  ordersByEmployee: Array<{ employee: Employe; count: number }>
  ordersByStatus: Record<string, number>
  processingTimeByPeriod: Array<{ period: string; time: number }>
}

interface ProductionReportProps {
  dateRange?: DateRange
}

export function ProductionReport({ dateRange }: ProductionReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ProductionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const productionData = await reportsData.getProductionData(dateRange)
        setData(productionData)
        setError(null)
      } catch (err) {
        console.error("Error fetching production data:", err)
        setError("Impossible de charger les données de production")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Fonction pour formater le temps de traitement en heures et minutes
  const formatProcessingTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (error) {
    return (
      <BaseReport
        title="Rapport de production"
        description="Analyse de la production et des performances"
        dateRange={dateRange}
        isLoading={false}
      >
        <div className="text-red-500">{error}</div>
      </BaseReport>
    )
  }

  return (
    <BaseReport
      title="Rapport de production"
      description="Analyse de la production et des performances"
      dateRange={dateRange}
      isLoading={isLoading}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
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
                <CardTitle className="text-sm font-medium">Commandes terminées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.completedOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {((data.completedOrders / data.totalOrders) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps moyen de traitement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatProcessingTime(data.averageProcessingTime)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commandes par employé</CardTitle>
              <CardDescription>Répartition des commandes par graphiste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.ordersByEmployee.map(({ employee, count }) => (
                  <div key={employee.employe_id} className="flex items-center justify-between">
                    <span>
                      {employee.nom} {employee.prenom}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
              <CardTitle>Temps de traitement par période</CardTitle>
              <CardDescription>Évolution du temps de traitement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.processingTimeByPeriod.map(({ period, time }) => (
                  <div key={period} className="flex items-center justify-between">
                    <span>{new Date(period).toLocaleDateString()}</span>
                    <span className="font-medium">{formatProcessingTime(time)}</span>
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