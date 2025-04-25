"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { OrdersList } from "@/components/dashboard/orders/orders-list"
import { useNotificationStore } from "@/lib/store/notifications"
import { toast } from "sonner"

export default function AtelierPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotificationStore()

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin", "graphiste"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  if (!user || !hasRole(["admin", "graphiste"])) {
    return null
  }

  const handleFileReject = (orderId: number, fileName: string) => {
    // Utiliser le type de notification existant
    addNotification(
      "production_complete",
      {
        orderId: orderId.toString(),
        orderNumber: orderId.toString(),
        productionStatus: "fichier_rejeté"
      },
      "graphiste",
      "accueil"
    )

    toast.error(`Le fichier ${fileName} a été rejeté`)
  }

  const handleStatusChange = (orderId: number, newStatus: string) => {
    // Utiliser le type de notification existant
    addNotification(
      "production_complete",
      {
        orderId: orderId.toString(),
        orderNumber: orderId.toString(),
        productionStatus: newStatus
      },
      "graphiste",
      "accueil"
    )

    toast.success(`Statut de la commande #${orderId} mis à jour`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atelier</h1>
          <p className="text-muted-foreground">
            Gestion des commandes à imprimer.
          </p>
        </div>

        <OrdersList 
          userRole={user.role}
          onFileReject={handleFileReject}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
} 