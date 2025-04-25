"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PaymentsList } from "@/components/dashboard/payments/payments-list"
import { AddPaymentDialog } from "@/components/dashboard/payments/add-payment-dialog"
import { useNotificationStore } from "@/lib/store/notifications"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PaymentsPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotificationStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin", "caisse"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  if (!user || !hasRole(["admin", "caisse"])) {
    return null
  }

  const handleAddPayment = async (payment: any, facture?: any) => {
    // Ajouter une notification pour le nouveau paiement
    addNotification(
      "payment_ready",
      {
        orderId: payment.commande_id.toString(),
        orderNumber: payment.commande_id.toString(),
        amount: payment.montant,
        clientName: facture?.client_nom || "Client"
      },
      "caisse",
      "accueil"
    )

    // Fermer le dialogue
    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des paiements</h1>
            <p className="text-muted-foreground">
              Consultez et gérez tous les paiements.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau paiement
          </Button>
        </div>

        <PaymentsList />

        <AddPaymentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAddPayment={handleAddPayment}
        />
      </div>
    </div>
  )
} 