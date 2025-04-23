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

interface ViewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    id: number
    name: string
    email: string
    phone: string
    lastOrderDate: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    notes?: string
  }
}

export function ViewClientDialog({ open, onOpenChange, client }: ViewClientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>Detailed information about {client.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2 pb-2">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <h3 className="text-xl font-semibold">{client.name}</h3>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p className="break-all">{client.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
              <p>{client.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Last Order</h4>
              <p>{new Date(client.lastOrderDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Client ID</h4>
              <p>CLT-{client.id.toString().padStart(4, "0")}</p>
            </div>
            {client.address && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                <p>
                  {client.address}
                  {client.city && client.state && client.zipCode
                    ? `, ${client.city}, ${client.state} ${client.zipCode}`
                    : ""}
                </p>
              </div>
            )}
            {client.notes && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
