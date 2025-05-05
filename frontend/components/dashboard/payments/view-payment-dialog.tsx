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
import { Paiement, Facture } from "@/lib/api/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { paiements } from "@/lib/api/paiements"

interface ViewPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Paiement
  facture?: Facture
}

export function ViewPaymentDialog({ open, onOpenChange, payment, facture }: ViewPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Détails du paiement</DialogTitle>
          <DialogDescription>
            Paiement #{payment.paiement_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium">{paiements.formatAmount(payment.montant)}</span>
            </div>

            {payment.methode === 'espèces' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monnaie rendue</span>
                <span className="font-medium">{paiements.formatAmount(payment.monnaie_rendue)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Reste à payer</span>
              <span className="font-medium">{paiements.formatAmount(payment.reste_a_payer)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Méthode</span>
              <Badge variant="outline" className={getMethodColor(payment.methode)}>
                {paiements.getPaymentMethodLabel(payment.methode)}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Référence</span>
              <span className="font-medium">{payment.reference_transaction || "Non spécifiée"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant="outline" className={getStatusColor(payment.statut)}>
                {paiements.getStatusLabel(payment.statut)}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {format(new Date(payment.date_paiement), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </span>
            </div>
          </div>

          {facture && (
            <div className="border-t pt-4">
              <h4 className="mb-2 font-medium">Facture associée</h4>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro</span>
                  <span className="font-medium">{facture.numero_facture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-medium">{paiements.formatAmount(facture.montant_total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Fonction utilitaire pour déterminer la couleur du badge selon le statut
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "validé":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "en_attente":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "échoué":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

// Fonction utilitaire pour déterminer la couleur du badge selon la méthode
function getMethodColor(method: string): string {
  switch (method.toLowerCase()) {
    case "flooz":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "mixx":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "espèces":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}
