"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { OrdersList } from "@/components/dashboard/orders/orders-list"
import { commandes } from "@/lib/api/commandes"
import { toast } from "sonner"

export default function CaisseOrdersPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes en attente de paiement</h1>
          <p className="text-muted-foreground">
            Liste des commandes nécessitant un paiement.
          </p>
        </div>

        <OrdersList userRole="caisse" />
      </div>
    </div>
  )
} 