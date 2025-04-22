"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EmployeeReportProps {
  dateRange: DateRange | undefined
  searchQuery: string
}

// Sample data for employees
const employeesData = [
  {
    id: 1,
    name: "Jane Smith",
    role: "Reception",
    department: "Front Office",
    ordersProcessed: 15,
    hoursWorked: 40,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Michael Johnson",
    role: "Manager",
    department: "Operations",
    ordersProcessed: 8,
    hoursWorked: 45,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Emily Williams",
    role: "Designer",
    department: "Creative",
    ordersProcessed: 12,
    hoursWorked: 38,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "David Brown",
    role: "Accountant",
    department: "Finance",
    ordersProcessed: 5,
    hoursWorked: 42,
    status: "On Leave",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Sarah Miller",
    role: "HR Specialist",
    department: "Human Resources",
    ordersProcessed: 0,
    hoursWorked: 40,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Robert Wilson",
    role: "Developer",
    department: "IT",
    ordersProcessed: 0,
    hoursWorked: 44,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Jennifer Taylor",
    role: "Sales Representative",
    department: "Sales",
    ordersProcessed: 20,
    hoursWorked: 39,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Thomas Anderson",
    role: "Warehouse Manager",
    department: "Logistics",
    ordersProcessed: 18,
    hoursWorked: 43,
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function EmployeeReport({ dateRange, searchQuery }: EmployeeReportProps) {
  // Filter employees based on search query
  const filteredEmployees = employeesData.filter((employee) => {
    return searchQuery
      ? employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.department.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  })

  // Calculate total orders processed
  const totalOrdersProcessed = filteredEmployees.reduce((sum, employee) => {
    return sum + employee.ordersProcessed
  }, 0)

  // Calculate total hours worked
  const totalHoursWorked = filteredEmployees.reduce((sum, employee) => {
    return sum + employee.hoursWorked
  }, 0)

  // Calculate average orders per employee
  const avgOrdersPerEmployee = totalOrdersProcessed / filteredEmployees.length || 0

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "on leave":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Prepare data for productivity chart
  const productivityData = filteredEmployees
    .filter((employee) => employee.ordersProcessed > 0)
    .sort((a, b) => b.ordersProcessed - a.ordersProcessed)
    .slice(0, 5)
    .map((employee) => ({
      name: employee.name,
      orders: employee.ordersProcessed,
    }))

  // Prepare data for department distribution
  const departmentData = filteredEmployees.reduce(
    (acc, employee) => {
      const existingDept = acc.find((d) => d.name === employee.department)
      if (existingDept) {
        existingDept.value += 1
      } else {
        acc.push({ name: employee.department, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Active and on leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrdersProcessed}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursWorked}</div>
            <p className="text-xs text-muted-foreground">Total across all employees</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Employees with highest order processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="hsl(var(--chart-1))" name="Orders Processed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Performance</CardTitle>
          <CardDescription>Detailed employee metrics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Orders Processed</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Productivity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const productivity =
                      employee.ordersProcessed > 0
                        ? (employee.ordersProcessed / employee.hoursWorked).toFixed(2)
                        : "N/A"

                    const productivityRating =
                      employee.ordersProcessed > 0
                        ? employee.ordersProcessed / employee.hoursWorked > avgOrdersPerEmployee / 40
                          ? "Above Average"
                          : "Average"
                        : "N/A"

                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
                              <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.ordersProcessed}</TableCell>
                        <TableCell>{employee.hoursWorked} hrs</TableCell>
                        <TableCell>
                          {productivity !== "N/A" ? (
                            <Badge
                              variant="outline"
                              className={
                                productivityRating === "Above Average"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              }
                            >
                              {productivity} orders/hr
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(employee.status)}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No employees found matching your search criteria.
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
