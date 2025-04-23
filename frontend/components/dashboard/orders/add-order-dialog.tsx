"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderForm } from "@/components/orders/order-form"
import { CreateOrderData } from "@/lib/order-service"

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddOrder: (orderData: CreateOrderData) => Promise<void>
}

export function AddOrderDialog({ open, onOpenChange, onAddOrder }: AddOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateOrderData) => {
    try {
      setIsSubmitting(true)
      await onAddOrder(data)
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <OrderForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  )
}
