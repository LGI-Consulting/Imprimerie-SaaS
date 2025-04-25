"use client"

import { OrdersList } from "@/components/dashboard/orders/orders-list"
import { useAuth } from "@/lib/context/auth-context"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddOrderDialog } from "@/components/dashboard/orders/add-order-dialog"
import { useState } from "react"
import { useNotificationStore } from "@/lib/store/notifications"

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const { addNotification } = useNotificationStore()

  if (!user || user.role !== "accueil") {
    return <UnauthorizedAlert onDismiss={() => router.push("/")} />
  }

  const handleAddOrder = async (orderData: any) => {
    try {
      // La création de la commande est gérée par le composant AddOrderDialog
      // Nous ajoutons juste la notification ici
      addNotification(
        "new_order",
        {
          orderId: orderData.commande_id.toString(),
          orderNumber: orderData.numero_commande,
          clientName: `${orderData.client.prenom} ${orderData.client.nom}`
        },
        "accueil",
        "caisse"
      )
    } catch (err) {
      console.error("Erreur lors de l'ajout de la notification:", err)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Commandes</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersList />
        </CardContent>
      </Card>

      <AddOrderDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddOrder}
      />
    </div>
  )
} 