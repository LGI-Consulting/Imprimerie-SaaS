"use client"

import { useState } from "react"
import {
  Download,
  FileBarChart,
  Printer,
  RefreshCw,
  Search,
  BarChart3,
  LineChart,
  PieChart,
  ListFilter,
  Users,
} from "lucide-react"
import { subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/dashboard/reports/date-range-picker"
import type { DateRange } from "react-day-picker"
import { ReportSummary } from "@/components/dashboard/reports/report-summary"
import { OrdersReport } from "@/components/dashboard/reports/orders-report"
import { InventoryReport } from "@/components/dashboard/reports/inventory-report"
import { PaymentsReport } from "@/components/dashboard/reports/payments-report"
import { EmployeeReport } from "@/components/dashboard/reports/employee-report"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("summary")
  const [reportType, setReportType] = useState("daily")
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Date range state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  // Handle generate report
  const handleGenerateReport = () => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 1000)
  }

  // Handle download report
  const handleDownloadReport = (format: string) => {
    const reportName = `${activeTab}_report_${format(date?.from || new Date(), "yyyy-MM-dd")}_to_${format(date?.to || new Date(), "yyyy-MM-dd")}`
    alert(`Downloading ${reportName}.${format}`)
  }

  // Handle print report
  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and view business reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:w-auto w-full" onClick={() => handleDownloadReport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="sm:w-auto w-full" onClick={() => handleDownloadReport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="sm:w-auto w-full" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Configure your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="report-search"
                  type="search"
                  placeholder="Search in reports..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Employees</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <ReportSummary dateRange={date} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrdersReport dateRange={date} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryReport dateRange={date} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentsReport dateRange={date} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeReport dateRange={date} searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
