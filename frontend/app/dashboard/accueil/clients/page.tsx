"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { ClientsList } from "@/components/dashboard/clients/clients-list"
import { ClientFilters, ClientFilters as ClientFiltersType } from "@/components/dashboard/clients/client-filters"

export default function ClientsPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [filters, setFilters] = useState<ClientFiltersType>({
    search: "",
    sort: "recent",
    showActiveOnly: false
  })

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin", "accueil", "caisse"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  if (!user || !hasRole(["admin", "accueil", "caisse"])) {
    return null
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des clients</h1>
            <p className="text-muted-foreground">
              Gérez vos clients, consultez leur historique et ajoutez de nouveaux clients.
            </p>
          </div>
        </div>

        <ClientFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />

        <ClientsList filters={filters} />
      </div>
    </div>
  )
} 