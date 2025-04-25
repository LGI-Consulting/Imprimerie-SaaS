"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import { DateRangePicker } from "@/components/dashboard/reports/date-range-picker"
import { ReportExport } from "@/components/dashboard/reports/report-export"
import { FinancialReport } from "@/components/dashboard/reports/financial-report"
import { ClientReport } from "@/components/dashboard/reports/client-report"
import { ProductionReport } from "@/components/dashboard/reports/production-report"
import { MaterialsReport } from "@/components/dashboard/reports/materials-report"
import { SalesReport } from "@/components/dashboard/reports/sales-report"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { 
  FileText, 
  DollarSign, 
  Users, 
  Printer, 
  Package, 
  ShoppingCart,
  Download,
  AlertCircle
} from "lucide-react"

export default function ReportsPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [error, setError] = useState<string | null>(null)
  const [activeReport, setActiveReport] = useState<string>("financial")

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  if (!user || !hasRole(["admin"])) {
    return <UnauthorizedAlert onDismiss={() => router.push("/dashboard")} />
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const handleExport = async (options: any) => {
    try {
      // TODO: Implémenter l'export des rapports
      console.log("Exporting report with options:", options)
      // Simuler un délai d'export
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error("Error exporting report:", err)
      setError("Erreur lors de l'export du rapport")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
            <p className="text-muted-foreground">
              Consultez et exportez les rapports détaillés
            </p>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-[300px]"
          />
        </div>

        {/* Onglets des rapports */}
        <Tabs 
          defaultValue="financial" 
          className="space-y-4"
          onValueChange={setActiveReport}
        >
          <TabsList>
            <TabsTrigger value="financial">
              <DollarSign className="h-4 w-4 mr-2" />
              Financier
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="production">
              <Printer className="h-4 w-4 mr-2" />
              Production
            </TabsTrigger>
            <TabsTrigger value="materials">
              <Package className="h-4 w-4 mr-2" />
              Matériaux
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ventes
            </TabsTrigger>
          </TabsList>

          {/* Rapport financier */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rapport financier</CardTitle>
                    <CardDescription>
                      Aperçu des performances financières
                    </CardDescription>
                  </div>
                  <ReportExport
                    type="financial"
                    data={{}}
                    filters={{ dateRange }}
                    onExport={handleExport}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <FinancialReport dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rapport clients */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rapport clients</CardTitle>
                    <CardDescription>
                      Analyse de la base client
                    </CardDescription>
                  </div>
                  <ReportExport
                    type="client"
                    data={{}}
                    filters={{ dateRange }}
                    onExport={handleExport}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ClientReport dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rapport production */}
          <TabsContent value="production">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rapport production</CardTitle>
                    <CardDescription>
                      Suivi de la production et des délais
                    </CardDescription>
                  </div>
                  <ReportExport
                    type="production"
                    data={{}}
                    filters={{ dateRange }}
                    onExport={handleExport}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ProductionReport dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rapport matériaux */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rapport matériaux</CardTitle>
                    <CardDescription>
                      Gestion des stocks et des matériaux
                    </CardDescription>
                  </div>
                  <ReportExport
                    type="materials"
                    data={{}}
                    filters={{ dateRange }}
                    onExport={handleExport}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <MaterialsReport dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rapport ventes */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rapport ventes</CardTitle>
                    <CardDescription>
                      Analyse des performances commerciales
                    </CardDescription>
                  </div>
                  <ReportExport
                    type="sales"
                    data={{}}
                    filters={{ dateRange }}
                    onExport={handleExport}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <SalesReport dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 