"use client"

import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "./date-range-picker"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"

// Types pour les onglets de rapport
interface ReportTab {
  id: string
  label: string
  roles: string[]
  component: React.ComponentType<{ dateRange?: DateRange }>
}

interface ReportLayoutProps {
  children?: React.ReactNode
  title: string
  description?: string
  tabs: ReportTab[]
  defaultTab?: string
}

export function ReportLayout({
  children,
  title,
  description,
  tabs,
  defaultTab,
}: ReportLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, hasRole } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  // Filtrer les onglets en fonction des rôles
  const filteredTabs = tabs.filter((tab) => hasRole(tab.roles))

  // Déterminer l'onglet actif
  const activeTab = defaultTab || filteredTabs[0]?.id

  // Gérer le changement d'onglet
  const handleTabChange = (value: string) => {
    router.push(`/dashboard/reports/${value}`)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-[300px]"
        />
      </div>

      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          {filteredTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {filteredTabs.map((tab) => {
          const ReportComponent = tab.component
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <ReportComponent dateRange={dateRange} />
            </TabsContent>
          )
        })}
      </Tabs>

      {children}
    </div>
  )
} 