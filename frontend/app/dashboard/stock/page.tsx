"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useNotificationStore } from "@/lib/store/notifications"
import { toast } from "sonner"

import { materiaux, type MateriauxResponse } from "@/lib/api/materiaux"
import { MaterialCard } from "@/components/dashboard/inventory/material-card"
import { StockAlertBadge } from "@/components/dashboard/inventory/stock-alert-badge"
import { StockLevelIndicator } from "@/components/dashboard/inventory/stock-level-indicator"
import { MaterialSearch } from "@/components/dashboard/inventory/material-search"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import type { Materiau, StockMateriau } from "@/lib/api/types"

type MaterialWithStocks = Materiau & {
  stocks: StockMateriau[];
}

export default function StockPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotificationStore()
  const [lowStockMaterials, setLowStockMaterials] = useState<MaterialWithStocks[]>([])
  const [loading, setLoading] = useState(true)

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

  // Charger les matériaux en stock bas
  useEffect(() => {
    const loadLowStock = async () => {
      try {
        const response = await materiaux.getLowStock()
        const materials = response as unknown as MaterialWithStocks[]
        setLowStockMaterials(materials)
        
        // Ajouter des notifications pour les stocks bas
        materials.forEach((material: MaterialWithStocks) => {
          const stockInfo = material.stocks.reduce((acc: { totalQuantity: number; minThreshold: number }, stock: StockMateriau) => ({
            totalQuantity: acc.totalQuantity + stock.quantite_en_stock,
            minThreshold: Math.min(acc.minThreshold, stock.seuil_alerte)
          }), { totalQuantity: 0, minThreshold: Infinity })

          if (stockInfo.totalQuantity <= stockInfo.minThreshold) {
            addNotification(
              "new_order",
              {
                orderId: material.materiau_id.toString(),
                orderNumber: material.materiau_id.toString(),
                clientName: material.nom || material.type_materiau,
                amount: stockInfo.totalQuantity
              },
              "admin",
              "caisse"
            )
          }
        })
      } catch (error) {
        console.error("Erreur lors du chargement des stocks bas:", error)
        toast.error("Erreur lors du chargement des stocks bas")
      } finally {
        setLoading(false)
      }
    }

    if (hasRole(["admin", "caisse", "graphiste"])) {
      loadLowStock()
    }
  }, [addNotification, hasRole])

  if (!user || !hasRole(["admin", "caisse", "graphiste"])) {
    return <UnauthorizedAlert onDismiss={() => router.push("/dashboard")} />
  }

  const handleMaterialSelect = (material: MaterialWithStocks) => {
    router.push(`/dashboard/stock/inventory?material=${material.materiau_id}`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion du Stock</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble du stock et des alertes
          </p>
        </div>

        {/* Recherche rapide */}
        <div className="w-full max-w-md">
          <MaterialSearch onSelect={handleMaterialSelect} />
        </div>

        {/* Alertes de stock */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div>Chargement...</div>
          ) : lowStockMaterials.length > 0 ? (
            lowStockMaterials.map((material) => {
              const stockInfo = material.stocks.reduce((acc: { totalQuantity: number; minThreshold: number }, stock: StockMateriau) => ({
                totalQuantity: acc.totalQuantity + stock.quantite_en_stock,
                minThreshold: Math.min(acc.minThreshold, stock.seuil_alerte)
              }), { totalQuantity: 0, minThreshold: Infinity })

              const level = stockInfo.totalQuantity <= stockInfo.minThreshold ? 'critical' : 
                           stockInfo.totalQuantity <= stockInfo.minThreshold * 1.5 ? 'warning' : 'normal'

              return (
                <div key={material.materiau_id} className="flex items-center gap-2">
                  <StockAlertBadge 
                    level={level}
                    message={`${material.nom || material.type_materiau} - ${stockInfo.totalQuantity} unités`}
                  />
                </div>
              )
            })
          ) : (
            <div className="text-muted-foreground">Aucune alerte de stock</div>
          )}
        </div>

        {/* Vue d'ensemble */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div>Chargement...</div>
          ) : lowStockMaterials.length > 0 ? (
            lowStockMaterials.map((material) => (
              <MaterialCard
                key={material.materiau_id}
                material={material}
                onEdit={hasRole(["admin"]) ? () => {
                  router.push(`/dashboard/stock/inventory?material=${material.materiau_id}&edit=true`)
                } : undefined}
                onDelete={hasRole(["admin"]) ? () => {
                  // Implémenter la suppression
                } : undefined}
              />
            ))
          ) : (
            <div className="text-muted-foreground">Aucun matériau en stock bas</div>
          )}
        </div>

        {/* Indicateurs de niveau de stock */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div>Chargement...</div>
          ) : lowStockMaterials.length > 0 ? (
            lowStockMaterials.map((material) => {
              const stockInfo = material.stocks.reduce((acc: { totalQuantity: number; minThreshold: number }, stock: StockMateriau) => ({
                totalQuantity: acc.totalQuantity + stock.quantite_en_stock,
                minThreshold: Math.min(acc.minThreshold, stock.seuil_alerte)
              }), { totalQuantity: 0, minThreshold: Infinity })

              return (
                <StockLevelIndicator
                  key={material.materiau_id}
                  quantity={stockInfo.totalQuantity}
                  threshold={stockInfo.minThreshold}
                  showIcon={hasRole(["admin", "graphiste"])}
                />
              )
            })
          ) : (
            <div className="text-muted-foreground">Aucun indicateur à afficher</div>
          )}
        </div>
      </div>
    </div>
  )
} 