"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import { AdminStats } from "@/components/dashboard/admin/admin-stats"
import { DateRangePicker } from "@/components/dashboard/reports/date-range-picker"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { 
  Users, 
  Settings, 
  FileText, 
  Activity, 
  AlertCircle, 
  BarChart2 
} from "lucide-react"

export default function AdminPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

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

  const adminSections = [
    {
      title: "Gestion des employés",
      description: "Gérez les comptes et les permissions des employés",
      icon: Users,
      href: "/dashboard/admin/employees",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Paramètres système",
      description: "Configurez les paramètres de l'application",
      icon: Settings,
      href: "/dashboard/admin/settings",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      title: "Rapports",
      description: "Consultez les rapports détaillés",
      icon: FileText,
      href: "/dashboard/admin/reports",
      color: "bg-green-500/10 text-green-500"
    }
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-muted-foreground">
              Gestion complète du système et des paramètres
            </p>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-[300px]"
          />
        </div>

        {/* Statistiques */}
        <AdminStats dateRange={dateRange} />

        {/* Sections principales */}
        <div className="grid gap-4 md:grid-cols-3">
          {adminSections.map((section) => (
            <Card key={section.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(section.href)}
                >
                  Accéder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 