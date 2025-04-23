"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, isWithinInterval, parseISO } from "date-fns"
import {
  BarChart,
  LineChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
} from "recharts"

interface PaymentsReportProps {
  dateRange: DateRange | undefined
  searchQuery: string
}

// Sample data for payments
const paymentsData = [
  {
    id: "PAY-001",
    clientName: "John Smith",
    date: "2023-04-15",
    amount: 250.0,
    method: "Credit Card",
    status: "Completed",
  },
  {
    id: "PAY-002",
    clientName: "Sarah Johnson",
    date: "2023-04-16",
    amount: 175.5,
    method: "Bank Transfer",
    status: "Processing",
  },
  {
    id: "PAY-003",
    clientName: "Michael Brown",
    date: "2023-04-17",
    amount: 320.75,
    method: "Cash",
    status: "Completed",
  },
  {
    id: "PAY-004",
    clientName: "Emily Davis",
    date: "2023-04-18",
    amount: 450.0,
    method: "Credit Card",
    status: "Completed",
  },
  {
    id: "PAY-005",
    clientName: "David Wilson",
    date: "2023-04-19",
    amount: 125.25,
    method: "Bank Transfer",
    status: "Failed",
  },
  {
    id: "PAY-006",
    clientName: "Lisa Martinez",
    date: "2023-04-20",
    amount: 275.0,
    method: "Cash",
    status: "Completed",
  },
  {
    id: "PAY-007",
    clientName: "Robert Taylor",
    date: "2023-04-21",
    amount: 190.5,
    method: "Credit Card",
    status: "Processing",
  },
]

export function PaymentsReport({ dateRange, searchQuery }: PaymentsReportProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Method badge color mapping
  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "bank transfer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cash":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Filter payments based on date range and search query
  const filteredPayments = paymentsData.filter((payment) => {
    const paymentDate = parseISO(payment.date)

    // Filter by date range
    const isInDateRange =
      dateRange?.from && dateRange?.to
        ? isWithinInterval(paymentDate, { start: dateRange.from, end: dateRange.to })
        : dateRange?.from
          ? paymentDate >= dateRange.from
          : true

    // Filter by search query
    const matchesSearch = searchQuery
      ? payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return isInDateRange && matchesSearch
  })

  // Calculate total revenue
  const totalRevenue = filteredPayments.reduce((sum, payment) => {
    return payment.status.toLowerCase() === "completed" ? sum + payment.amount : sum
  }, 0)

  // Calculate pending revenue
  const pendingRevenue = filteredPayments.reduce((sum, payment) => {
    return payment.status.toLowerCase() === "processing" ? sum + payment.amount : sum
  }, 0)

  // Calculate failed payments
  const failedPayments = filteredPayments.filter((payment) => payment.status.toLowerCase() === "failed").length

  // Prepare data for payment method chart
  const paymentMethodData = [
    {
      name: "Credit Card",
      value: filteredPayments
        .filter((p) => p.method === "Credit Card" && p.status.toLowerCase() === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    },
    {
      name: "Bank Transfer",
      value: filteredPayments
        .filter((p) => p.method === "Bank Transfer" && p.status.toLowerCase() === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    },
    {
      name: "Cash",
      value: filteredPayments
        .filter((p) => p.method === "Cash" && p.status.toLowerCase() === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    },
  ]

  // Prepare data for daily revenue chart
  const dailyRevenueMap = new Map()

  filteredPayments.forEach((payment) => {
    if (payment.status.toLowerCase() === "completed") {
      const date = payment.date
      const existingAmount = dailyRevenueMap.get(date) || 0
      dailyRevenueMap.set(date, existingAmount + payment.amount)
    }
  })

  const dailyRevenueData = Array.from(dailyRevenueMap.entries())
    .map(([date, amount]) => ({
      date: format(parseISO(date), "MMM d"),
      amount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</div>
            <p className="text-xs text-muted-foreground">From processing payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">Payments that failed to process</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue trend for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Revenue by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>List of all payments for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.clientName}</TableCell>
                      <TableCell>{format(parseISO(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getMethodColor(payment.method)}>
                          {payment.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No payments found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
