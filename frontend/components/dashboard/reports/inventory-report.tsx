"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, ResponsiveContainer, Pie, Cell, Tooltip, Legend } from "recharts"

interface InventoryReportProps {
  dateRange: DateRange | undefined
  searchQuery: string
}

// Sample data for inventory
const inventoryData = [
  {
    id: 1,
    name: "Cotton Fabric",
    stockQuantity: 500,
    unitPrice: 5.99,
    reorderLevel: 100,
    usedThisPeriod: 120,
    supplier: "Textile Supplies Inc.",
  },
  {
    id: 2,
    name: "Polyester Blend",
    stockQuantity: 350,
    unitPrice: 4.5,
    reorderLevel: 75,
    usedThisPeriod: 85,
    supplier: "Synthetic Fabrics Co.",
  },
  {
    id: 3,
    name: "Denim",
    stockQuantity: 200,
    unitPrice: 8.75,
    reorderLevel: 50,
    usedThisPeriod: 65,
    supplier: "Denim World",
  },
  {
    id: 4,
    name: "Silk",
    stockQuantity: 100,
    unitPrice: 15.99,
    reorderLevel: 30,
    usedThisPeriod: 25,
    supplier: "Luxury Fabrics Ltd.",
  },
  {
    id: 5,
    name: "Wool",
    stockQuantity: 150,
    unitPrice: 12.25,
    reorderLevel: 40,
    usedThisPeriod: 35,
    supplier: "Natural Fibers Co.",
  },
  {
    id: 6,
    name: "Linen",
    stockQuantity: 180,
    unitPrice: 9.5,
    reorderLevel: 45,
    usedThisPeriod: 50,
    supplier: "Premium Textiles",
  },
  {
    id: 7,
    name: "Leather",
    stockQuantity: 75,
    unitPrice: 22.99,
    reorderLevel: 25,
    usedThisPeriod: 30,
    supplier: "Leather Crafts Inc.",
  },
  {
    id: 8,
    name: "Buttons (pack of 100)",
    stockQuantity: 50,
    unitPrice: 3.99,
    reorderLevel: 15,
    usedThisPeriod: 20,
    supplier: "Craft Supplies Co.",
  },
]

export function InventoryReport({ dateRange, searchQuery }: InventoryReportProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Filter inventory based on search query
  const filteredInventory = inventoryData.filter((item) => {
    return searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  })

  // Calculate total inventory value
  const totalInventoryValue = filteredInventory.reduce((sum, item) => {
    return sum + item.stockQuantity * item.unitPrice
  }, 0)

  // Calculate total used this period
  const totalUsedThisPeriod = filteredInventory.reduce((sum, item) => {
    return sum + item.usedThisPeriod
  }, 0)

  // Calculate items that need reordering
  const itemsNeedingReorder = filteredInventory.filter((item) => {
    return item.stockQuantity <= item.reorderLevel
  })

  // Data for usage pie chart
  const usageData = filteredInventory.map((item) => ({
    name: item.name,
    value: item.usedThisPeriod,
  }))

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsedThisPeriod} units</div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Needing Reorder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsNeedingReorder.length}</div>
            <p className="text-xs text-muted-foreground">Below reorder threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current stock levels and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Used This Period</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const stockPercentage = (item.stockQuantity / (item.reorderLevel * 3)) * 100
                    const stockStatus =
                      item.stockQuantity <= item.reorderLevel
                        ? "Low"
                        : item.stockQuantity <= item.reorderLevel * 2
                          ? "Medium"
                          : "Good"

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.stockQuantity} units</TableCell>
                        <TableCell>{item.usedThisPeriod} units</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={stockPercentage} className="h-2" />
                            <span className="text-xs">{Math.round(stockPercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              stockStatus === "Low"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : stockStatus === "Medium"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-green-100 text-green-800 hover:bg-green-100"
                            }
                          >
                            {stockStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Material Usage</CardTitle>
            <CardDescription>Distribution of materials used this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reorder Recommendations</CardTitle>
          <CardDescription>Materials that need to be reordered soon</CardDescription>
        </CardHeader>
        <CardContent>
          {itemsNeedingReorder.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Recommended Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsNeedingReorder.map((item) => {
                    const recommendedOrder = Math.max(item.reorderLevel * 2 - item.stockQuantity, 0)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.stockQuantity} units</TableCell>
                        <TableCell>{item.reorderLevel} units</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{formatCurrency(recommendedOrder * item.unitPrice)}</TableCell>
                        <TableCell>{recommendedOrder} units</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">No materials need reordering at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
