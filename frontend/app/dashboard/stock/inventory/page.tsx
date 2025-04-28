"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { MaterialManagement } from "@/components/dashboard/inventory/material-management"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import type { Material } from "@/lib/api/types"

export default function InventoryPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin", "caisse", "graphiste"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  if (!user || !hasRole(["admin", "caisse", "graphiste"])) {
    return <UnauthorizedAlert onDismiss={() => router.push("/dashboard")} />
  }

  const handleMaterialSelect = (material: Material) => {
    toast.info(`Stock sélectionné : ${material.type_materiau}`)
    // Ici vous pouvez ajouter la logique pour gérer la sélection d'un matériau
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Gestion des stocks</h1>
      <MaterialManagement onMaterialSelect={handleMaterialSelect} />
    </div>
  )
}