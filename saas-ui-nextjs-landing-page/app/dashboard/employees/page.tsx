"use client"

import { useState } from "react"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddEmployeeDialog } from "@/components/dashboard/employees/add-employee-dialog"
import { ViewEmployeeDialog } from "@/components/dashboard/employees/view-employee-dialog"
import { EditEmployeeDialog } from "@/components/dashboard/employees/edit-employee-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Sample data for employees
const employeesData = [
  {
    id: 1,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 123-4567",
    role: "Reception",
    department: "Front Office",
    joinDate: "2022-03-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 234-5678",
    role: "Manager",
    department: "Operations",
    joinDate: "2021-06-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Williams",
    email: "emily.williams@example.com",
    phone: "(555) 345-6789",
    role: "Designer",
    department: "Creative",
    joinDate: "2022-01-05",
    status: "Active",
  },
  {
    id: 4,
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "(555) 456-7890",
    role: "Accountant",
    department: "Finance",
    joinDate: "2021-09-20",
    status: "On Leave",
  },
  {
    id: 5,
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    phone: "(555) 567-8901",
    role: "HR Specialist",
    department: "Human Resources",
    joinDate: "2022-02-15",
    status: "Active",
  },
  {
    id: 6,
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    phone: "(555) 678-9012",
    role: "Developer",
    department: "IT",
    joinDate: "2021-11-08",
    status: "Inactive",
  },
  {
    id: 7,
    name: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    phone: "(555) 789-0123",
    role: "Sales Representative",
    department: "Sales",
    joinDate: "2022-04-01",
    status: "Active",
  },
  {
    id: 8,
    name: "Thomas Anderson",
    email: "thomas.anderson@example.com",
    phone: "(555) 890-1234",
    role: "Warehouse Manager",
    department: "Logistics",
    joinDate: "2021-08-15",
    status: "Active",
  },
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(employeesData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<(typeof employeesData)[0] | null>(null)

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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

  // Handle view employee
  const handleViewEmployee = (employee: (typeof employeesData)[0]) => {
    setSelectedEmployee(employee)
    setIsViewEmployeeOpen(true)
  }

  // Handle edit employee
  const handleEditEmployee = (employee: (typeof employeesData)[0]) => {
    setSelectedEmployee(employee)
    setIsEditEmployeeOpen(true)
  }

  // Handle delete employee
  const handleDeleteClick = (employee: (typeof employeesData)[0]) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete employee
  const confirmDelete = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id))
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle add employee
  const handleAddEmployee = (newEmployee: Omit<(typeof employeesData)[0], "id">) => {
    const newId = Math.max(...employees.map((emp) => emp.id)) + 1
    setEmployees([...employees, { ...newEmployee, id: newId }])
  }

  // Handle update employee
  const handleUpdateEmployee = (updatedEmployee: (typeof employeesData)[0]) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage and view all employee information</p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => setIsAddEmployeeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Employee"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Employee"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Employee"
                            onClick={() => handleDeleteClick(employee)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
        onAddEmployee={handleAddEmployee}
      />

      {/* View Employee Dialog */}
      {selectedEmployee && (
        <ViewEmployeeDialog
          open={isViewEmployeeOpen}
          onOpenChange={setIsViewEmployeeOpen}
          employee={selectedEmployee}
        />
      )}

      {/* Edit Employee Dialog */}
      {selectedEmployee && (
        <EditEmployeeDialog
          open={isEditEmployeeOpen}
          onOpenChange={setIsEditEmployeeOpen}
          employee={selectedEmployee}
          onUpdateEmployee={handleUpdateEmployee}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              {selectedEmployee && <span className="font-medium"> {selectedEmployee.name}</span>} and remove their data
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
