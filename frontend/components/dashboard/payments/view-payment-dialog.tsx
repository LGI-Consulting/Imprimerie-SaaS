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
import { DownloadPDFButton } from "@/components/ui/download-pdf-button"
import { Paiement, Facture } from "@/lib/api/types"
import { paiements } from "@/lib/api/paiements"

interface ViewPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Paiement
  facture: Facture
}

export function ViewPaymentDialog({ open, onOpenChange, payment, facture }: ViewPaymentDialogProps) {
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "validé":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "en_attente":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "échoué":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Method badge color mapping
  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "flooz":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "mixx":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "espèces":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du paiement</DialogTitle>
          <DialogDescription>Informations détaillées sur le paiement #{payment.paiement_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Paiement #{payment.paiement_id}</h3>
              <p className="text-sm text-muted-foreground">Commande #{payment.commande_id}</p>
            </div>
            <Badge variant="outline" className={getStatusColor(payment.statut)}>
              {paiements.getStatusLabel(payment.statut)}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
              <p>{new Date(payment.date_paiement).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Montant</h4>
              <p className="font-semibold">{paiements.formatAmount(payment.montant)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Méthode</h4>
              <Badge variant="outline" className={getMethodColor(payment.methode)}>
                {paiements.getPaymentMethodLabel(payment.methode)}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Statut</h4>
              <Badge variant="outline" className={getStatusColor(payment.statut)}>
                {paiements.getStatusLabel(payment.statut)}
              </Badge>
            </div>
          </div>

          {payment.methode === "espèces" && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Montant reçu</h4>
                  <p className="font-semibold">{paiements.formatAmount(payment.montant_recu)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Monnaie rendue</h4>
                  <p className="font-semibold">{paiements.formatAmount(payment.monnaie_rendue)}</p>
                </div>
              </div>
            </>
          )}

          {payment.reference_transaction && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Référence transaction</h4>
                <p className="text-sm">{payment.reference_transaction}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <DownloadPDFButton
            paiement={payment}
            facture={facture}
            variant="default"
            size="default"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
