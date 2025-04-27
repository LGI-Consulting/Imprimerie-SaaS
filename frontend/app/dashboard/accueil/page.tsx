"use client"

import { OrdersList } from "@/components/dashboard/orders/orders-list"
import { ClientsList } from "@/components/dashboard/clients/clients-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/context/auth-context"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AccueilPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()

  // Vérifier les permissions
  useEffect(() => {
      if (!user) {
          router.push("/login")
          return
      }

      if (!hasRole(["admin", "accueil"])) {
          router.push("/dashboard")
          return
      }
  }, [user, hasRole, router])

  if (!user || !hasRole(["admin", "accueil"])) {
      return null
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dernières commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients récents</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientsList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 