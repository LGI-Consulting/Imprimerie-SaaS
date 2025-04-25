"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { BaseReport } from "./base-report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportsData } from "@/lib/api/reports-data"
import type { Client } from "@/lib/api/types"

// Types pour les données clients
interface ClientData {
  totalClients: number
  newClients: number
  activeClients: number
  clientsByFrequency: Array<{ frequency: string; count: number }>
  clientsByValue: Array<{ value: string; count: number }>
  topClients: Array<{ client: Client; totalSpent: number }>
  clientRetention: number
}

interface ClientReportProps {
  dateRange?: DateRange
}

export function ClientReport({ dateRange }: ClientReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ClientData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const clientData = await reportsData.getClientData(dateRange)
        setData(clientData)
        setError(null)
      } catch (err) {
        console.error("Error fetching client data:", err)
        setError("Impossible de charger les données clients")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (error) {
    return (
      <BaseReport
        title="Rapport clients"
        description="Analyse des clients et de leur comportement"
        dateRange={dateRange}
        isLoading={false}
      >
        <div className="text-red-500">{error}</div>
      </BaseReport>
    )
  }

  return (
    <BaseReport
      title="Rapport clients"
      description="Analyse des clients et de leur comportement"
      dateRange={dateRange}
      isLoading={isLoading}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalClients}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nouveaux clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.newClients}</div>
                <p className="text-xs text-muted-foreground">
                  {((data.newClients / data.totalClients) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activeClients}</div>
                <p className="text-xs text-muted-foreground">
                  {((data.activeClients / data.totalClients) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de rétention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.clientRetention.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clients par fréquence d'achat</CardTitle>
                <CardDescription>Répartition des clients selon leur fréquence d'achat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.clientsByFrequency.map(({ frequency, count }) => (
                    <div key={frequency} className="flex items-center justify-between">
                      <span>{frequency} commandes</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clients par valeur d'achat</CardTitle>
                <CardDescription>Répartition des clients selon leur valeur d'achat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.clientsByValue.map(({ value, count }) => (
                    <div key={value} className="flex items-center justify-between">
                      <span>{value}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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