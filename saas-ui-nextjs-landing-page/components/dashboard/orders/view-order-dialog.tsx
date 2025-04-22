"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    clientInfo: {
      name: string
      phone: string
      email?: string
    }
    orderDetails: {
      date: string
      dueDate: string
      status: string
      notes?: string
    }
    materialDetails: {
      type: string
      typeLabel: string
      width: number
      length: number
      selectedWidth: number
      calculatedArea: number
      requiredStock: number
    }
    finishing?: {
      perforation?: boolean
      eyelets?: { count: number; spacing: string } | null
      cutting?: { type: string } | null
      lamination?: boolean
    }
    delivery?: {
      address: string
      zone: string
      fee: number
    } | null
    payment: {
      status: string
      advanceAmount: number
      remainingAmount: number
    }
    pricing: {
      basePrice: number
      additionalCosts: number
      totalPrice: number
    }
    files?: { name: string; size: number; type: string }[]
  }
}

export function ViewOrderDialog({ open, onOpenChange, order }: ViewOrderDialogProps) {
  const formatFCFA = (amount: number) =>
    amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800"
      case "pending_production":
      case "in_production":
        return "bg-blue-100 text-blue-800"
      case "ready":
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la commande</DialogTitle>
          <DialogDescription>Commande n° {order.id}</DialogDescription>
        </DialogHeader>

        {/* Client Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Client</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p><strong>Nom:</strong> {order.clientInfo.name}</p>
            <p><strong>Téléphone:</strong> {order.clientInfo.phone}</p>
            {order.clientInfo.email && <p><strong>Email:</strong> {order.clientInfo.email}</p>}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-muted-foreground font-medium">Date commande</h4>
            <p>{new Date(order.orderDetails.date).toLocaleDateString()}</p>
          </div>
          <div>
            <h4 className="text-muted-foreground font-medium">Date livraison</h4>
            <p>{new Date(order.orderDetails.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h4 className="text-muted-foreground font-medium">Statut</h4>
            <Badge className={getStatusColor(order.orderDetails.status)}>
              {order.orderDetails.status}
            </Badge>
          </div>
        </div>

        {order.orderDetails.notes && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
              <p className="text-sm">{order.orderDetails.notes}</p>
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Material */}
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold text-lg">Matériel</h3>
          <p><strong>Type:</strong> {order.materialDetails.typeLabel}</p>
          <p><strong>Dimensions:</strong> {order.materialDetails.width}cm × {order.materialDetails.length}cm</p>
          <p><strong>Largeur rouleau:</strong> {order.materialDetails.selectedWidth}cm</p>
          <p><strong>Surface:</strong> {order.materialDetails.calculatedArea.toFixed(2)} m²</p>
          <p><strong>Stock requis:</strong> {order.materialDetails.requiredStock} m</p>
        </div>

        {/* Finishing */}
        {order.finishing && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-lg">Finitions</h3>
              {order.finishing.perforation && <p>• Perforation: Oui</p>}
              {order.finishing.eyelets && (
                <p>
                  • Œillets: {order.finishing.eyelets.count} ({order.finishing.eyelets.spacing})
                </p>
              )}
              {order.finishing.cutting && (
                <p>• Découpe: {order.finishing.cutting.type === "custom" ? "Contour personnalisé" : "Rectangulaire"}</p>
              )}
              {order.finishing.lamination && <p>• Plastification: Oui</p>}
            </div>
          </>
        )}

        {/* Delivery */}
        {order.delivery && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-lg">Livraison</h3>
              <p><strong>Adresse:</strong> {order.delivery.address}</p>
              <p><strong>Zone:</strong> {order.delivery.zone}</p>
              <p><strong>Frais:</strong> {formatFCFA(order.delivery.fee)}</p>
            </div>
          </>
        )}

        {/* Files */}
        {order.files && order.files.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Fichiers</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.files.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{(file.size / 1024).toFixed(1)} KB</TableCell>
                      <TableCell>{file.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Pricing */}
        <Separator className="my-4" />
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Récapitulatif</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Prix de base</p>
                <p className="text-xl font-bold">{formatFCFA(order.pricing.basePrice)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Options</p>
                <p className="text-xl font-bold">{formatFCFA(order.pricing.additionalCosts)}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary">
              <CardContent className="p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{formatFCFA(order.pricing.totalPrice)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Montant versé</h4>
              <p>{formatFCFA(order.payment.advanceAmount)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Reste à payer</h4>
              <p>{formatFCFA(order.payment.remainingAmount)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
