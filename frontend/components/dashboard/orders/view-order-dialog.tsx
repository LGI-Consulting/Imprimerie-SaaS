"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Commande, TypeRemise, DetailCommande } from "@/lib/api/types"
import { formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/api/utils"

interface ViewOrderDialogProps {
  order: Commande & {
    details: DetailCommande[];
    clientInfo: {
      prenom: string;
      nom: string;
      telephone: string;
      email?: string;
      adresse?: string;
    };
    created_at: string;
    id: number;
    remise?: {
      type: 'pourcentage' | 'montant_fixe';
      valeur: number;
      code?: string;
      montant_applique: number;
    };
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewOrderDialog({
  order,
  open,
  onOpenChange,
}: ViewOrderDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "en_attente":
        return "bg-yellow-500"
      case "en_cours":
        return "bg-blue-500"
      case "terminee":
        return "bg-green-500"
      case "annulee":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const calculateSubtotal = () => {
    return order.details.reduce(
      (total: number, item: DetailCommande) => total + item.quantite * item.prix_unitaire,
      0
    )
  }

  const calculateDiscount = () => {
    if (!order.remise) return 0
    
    const subtotal = calculateSubtotal()
    
    if (order.remise.type === 'pourcentage') {
      return (subtotal * order.remise.valeur) / 100
    } else {
      return order.remise.valeur
    }
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return subtotal - discount
  }

  const getRemiseTypeLabel = (type: TypeRemise) => {
    return type === 'pourcentage' ? '%' : '€'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Client</h3>
              <p>
                {order.clientInfo.prenom} {order.clientInfo.nom}
              </p>
              <p>{order.clientInfo.telephone}</p>
              {order.clientInfo.email && <p>{order.clientInfo.email}</p>}
            </div>
            <div>
              <h3 className="font-semibold">Informations de commande</h3>
              <p>Date: {formatDate(order.created_at)}</p>
              <p>
                Statut:{" "}
                <Badge className={getStatusColor(order.statut)}>
                  {order.statut}
                </Badge>
              </p>
            </div>
          </div>

          {order.clientInfo.adresse && (
            <div>
              <h3 className="font-semibold">Adresse de livraison</h3>
              <p>{order.clientInfo.adresse}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Articles commandés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matériau</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.details.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.materiau_id}</TableCell>
                    <TableCell>{item.quantite}</TableCell>
                    <TableCell>{item.dimensions}</TableCell>
                    <TableCell>{formatCurrency(item.prix_unitaire)}</TableCell>
                    <TableCell>
                      {formatCurrency(item.quantite * item.prix_unitaire)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Section des remises */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Récapitulatif et remises</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                {order.remise && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-2">
                      <span>Remise</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {order.remise.type === 'pourcentage' 
                          ? `${order.remise.valeur}%` 
                          : formatCurrency(order.remise.valeur)}
                      </Badge>
                      {order.remise.code && (
                        <span className="text-xs text-muted-foreground">
                          (Code: {order.remise.code})
                        </span>
                      )}
                    </div>
                    <span>-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.commentaires && (
            <div>
              <h3 className="font-semibold">Commentaires</h3>
              <p>{order.commentaires}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

