"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, FileCheck, Clock, Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function DesignerDashboard() {
  const [stats, setStats] = useState({
    printQueue: 0,
    completedToday: 0,
    urgentPrints: 0,
    totalCompleted: 0,
  })

  // Simulate fetching data
  useEffect(() => {
    // This would be an API call in a real application
    setStats({
      printQueue: 6,
      completedToday: 8,
      urgentPrints: 2,
      totalCompleted: 145,
    })
  }, [])

  // Calculate daily goal progress (assuming a goal of 15 prints per day)
  const dailyGoal = 15
  const goalProgress = Math.min(100, (stats.completedToday / dailyGoal) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Designer Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your print queue and completed jobs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Print Queue</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.printQueue}</div>
            <p className="text-xs text-muted-foreground">Orders ready to print</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/designer/print-queue">View Queue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Daily goal: {dailyGoal}</p>
            <div className="mt-2">
              <Progress value={goalProgress} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{goalProgress.toFixed(0)}% of daily goal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Prints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgentPrints}</div>
            <p className="text-xs text-muted-foreground">Rush orders needing attention</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/dashboard/designer/print-queue?filter=urgent">View Urgent</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">All-time completed prints</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/designer/completed">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Next in Queue</CardTitle>
            <CardDescription>Orders ready for printing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Business Cards - John Smith</p>
                    <p className="text-sm text-muted-foreground">Order #1234 • Standard size</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  Urgent
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Brochures - Acme Corp</p>
                    <p className="text-sm text-muted-foreground">Order #1235 • Tri-fold</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Ready
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Posters - City Event</p>
                    <p className="text-sm text-muted-foreground">Order #1236 • Large format</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Available Design Files</CardTitle>
            <CardDescription>Files ready for download and printing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">business_cards_john_smith.pdf</p>
                    <p className="text-sm text-muted-foreground">Order #1234 • 2.4 MB</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">acme_corp_brochure.pdf</p>
                    <p className="text-sm text-muted-foreground">Order #1235 • 5.8 MB</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">city_event_poster.pdf</p>
                    <p className="text-sm text-muted-foreground">Order #1236 • 12.1 MB</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
