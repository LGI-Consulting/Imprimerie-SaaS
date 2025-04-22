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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Receipt } from "lucide-react"

interface ViewPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: {
    id: string
    clientName: string
    date: string
    amount: number
    method: string
    status: string
    email?: string
    address?: string
    description?: string
    invoiceNumber?: string
  }
  onViewReceipt: () => void
}

export function ViewPaymentDialog({ open, onOpenChange, payment, onViewReceipt }: ViewPaymentDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>Detailed information about payment {payment.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{payment.id}</h3>
              <p className="text-sm text-muted-foreground">Client: {payment.clientName}</p>
            </div>
            <Badge variant="outline" className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
              <p>{new Date(payment.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Method</h4>
              <Badge variant="outline" className={getMethodColor(payment.method)}>
                {payment.method}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <Badge variant="outline" className={getStatusColor(payment.status)}>
                {payment.status}
              </Badge>
            </div>
          </div>

          {payment.description && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="text-sm">{payment.description}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onViewReceipt}>
            <Receipt className="mr-2 h-4 w-4" />
            View Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
