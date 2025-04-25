"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { BaseReport } from "./base-report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportsData } from "@/lib/api/reports-data"
import type { Materiau } from "@/lib/api/types"

// Types pour les données matériaux
interface MaterialsData {
  totalMaterials: number
  materialsByType: Record<string, number>
  consumptionByPeriod: Array<{ period: string; consumption: number }>
  stockLevels: Array<{ material: Materiau; level: number }>
  lowStockAlerts: Array<{ material: Materiau; level: number }>
  materialCosts: Record<string, number>
}

interface MaterialsReportProps {
  dateRange?: DateRange
}

export function MaterialsReport({ dateRange }: MaterialsReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<MaterialsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const materialsData = await reportsData.getMaterialsData(dateRange)
        setData(materialsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching materials data:", err)
        setError("Impossible de charger les données des matériaux")
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

  if (error) {
    return (
      <BaseReport
        title="Rapport matériaux"
        description="Analyse des matériaux et de leur utilisation"
        dateRange={dateRange}
        isLoading={false}
      >
        <div className="text-red-500">{error}</div>
      </BaseReport>
    )
  }

  return (
    <BaseReport
      title="Rapport matériaux"
      description="Analyse des matériaux et de leur utilisation"
      dateRange={dateRange}
      isLoading={isLoading}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total matériaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalMaterials}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertes stock bas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.lowStockAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {((data.lowStockAlerts.length / data.totalMaterials) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coût total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(Object.values(data.materialCosts).reduce((sum, cost) => sum + cost, 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Matériaux par type</CardTitle>
                <CardDescription>Répartition des matériaux par type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.materialsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consommation par période</CardTitle>
                <CardDescription>Évolution de la consommation sur la période sélectionnée</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.consumptionByPeriod.map(({ period, consumption }) => (
                    <div key={period} className="flex items-center justify-between">
                      <span>{new Date(period).toLocaleDateString()}</span>
                      <span className="font-medium">{consumption} unités</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Niveaux de stock</CardTitle>
              <CardDescription>État actuel des stocks par matériau</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.stockLevels.map(({ material, level }) => (
                  <div key={material.materiau_id} className="flex items-center justify-between">
                    <span>
                      {material.nom} ({material.type_materiau})
                    </span>
                    <span className={`font-medium ${level <= 0 ? "text-red-500" : ""}`}>
                      {level} unités
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coûts par type</CardTitle>
              <CardDescription>Répartition des coûts par type de matériau</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.materialCosts).map(([type, cost]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type}</span>
                    <span className="font-medium">{formatCurrency(cost)}</span>
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