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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    clientName: string
    date: string
    status: string
    items?: OrderItem[]
    total?: number
    notes?: string
    shippingAddress?: string
    paymentMethod?: string
    dueDate?: string
  }
}

export function ViewOrderDialog({ open, onOpenChange, order }: ViewOrderDialogProps) {
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Calculate total if not provided
  const calculateTotal = () => {
    if (order.total) return formatCurrency(order.total)
    if (order.items) {
      const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return formatCurrency(total)
    }
    return formatCurrency(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Detailed information about order {order.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{order.id}</h3>
              <p className="text-sm text-muted-foreground">Client: {order.clientName}</p>
            </div>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Order Date</h4>
              <p>{new Date(order.date).toLocaleDateString()}</p>
            </div>
            {order.dueDate && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                <p>{new Date(order.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            {order.paymentMethod && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                <p>{order.paymentMethod}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Total</h4>
              <p className="font-semibold">{calculateTotal()}</p>
            </div>
          </div>

          {order.shippingAddress && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Shipping Address</h4>
                <p className="text-sm">{order.shippingAddress}</p>
              </div>
            </>
          )}

          {order.items && order.items.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold">{calculateTotal()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {order.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                <p className="text-sm">{order.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
