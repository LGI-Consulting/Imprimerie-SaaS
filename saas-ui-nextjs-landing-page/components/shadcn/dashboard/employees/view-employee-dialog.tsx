"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ViewEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: {
    id: number
    name: string
    email: string
    phone: string
    role: string
    department: string
    joinDate: string
    status: string
  }
}

export function ViewEmployeeDialog({ open, onOpenChange, employee }: ViewEmployeeDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>Detailed information about {employee.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2 pb-2">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <h3 className="text-xl font-semibold">{employee.name}</h3>
            <Badge variant="outline" className={getStatusColor(employee.status)}>
              {employee.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
              <p>{employee.role}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
              <p>{employee.department}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p className="break-all">{employee.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
              <p>{employee.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Join Date</h4>
              <p>{new Date(employee.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Employee ID</h4>
              <p>EMP-{employee.id.toString().padStart(4, "0")}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
