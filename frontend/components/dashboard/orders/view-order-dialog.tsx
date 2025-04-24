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
import { Commande } from "@/lib/api/types/commande"
import { formatDate } from "@/lib/utils"

interface ViewOrderDialogProps {
  order: Commande
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const calculateTotal = () => {
    return order.details.reduce(
      (total, item) => total + item.quantite * item.prix_unitaire,
      0
    )
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
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </p>
              <p>Total: {formatCurrency(calculateTotal())}</p>
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

