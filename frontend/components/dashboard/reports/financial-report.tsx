"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { BaseReport } from "./base-report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportsData } from "@/lib/api/reports-data"

// Types pour les données financières
interface FinancialData {
  totalRevenue: number
  totalPayments: number
  paymentsByMethod: Record<string, number>
  revenueByPeriod: Array<{ period: string; revenue: number }>
  discountsApplied: number
  averageDiscount: number
  topDiscounts: Array<{ code: string; amount: number }>
}

interface FinancialReportProps {
  dateRange?: DateRange
}

export function FinancialReport({ dateRange }: FinancialReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<FinancialData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const financialData = await reportsData.getFinancialData(dateRange)
        setData(financialData)
        setError(null)
      } catch (err) {
        console.error("Error fetching financial data:", err)
        setError("Impossible de charger les données financières")
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
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  if (error) {
    return (
      <BaseReport
        title="Rapport financier"
        description="Analyse des performances financières"
        dateRange={dateRange}
        isLoading={false}
      >
        <div className="text-red-500">{error}</div>
      </BaseReport>
    )
  }

  return (
    <BaseReport
      title="Rapport financier"
      description="Analyse des performances financières"
      dateRange={dateRange}
      isLoading={isLoading}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paiements totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalPayments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remises appliquées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.discountsApplied)}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {formatCurrency(data.averageDiscount)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Paiements par méthode</CardTitle>
                <CardDescription>Répartition des paiements par méthode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.paymentsByMethod).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="capitalize">{method}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenus par période</CardTitle>
                <CardDescription>Évolution des revenus sur la période sélectionnée</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.revenueByPeriod.map(({ period, revenue }) => (
                    <div key={period} className="flex items-center justify-between">
                      <span>{new Date(period).toLocaleDateString()}</span>
                      <span className="font-medium">{formatCurrency(revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top remises</CardTitle>
              <CardDescription>Codes de remise les plus utilisés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topDiscounts.map(({ code, amount }) => (
                  <div key={code} className="flex items-center justify-between">
                    <span>{code}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
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