"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { StockList } from "@/components/dashboard/inventory/materials/stock-list"
import { MaterialList } from "@/components/dashboard/inventory/materials/material-list"
import { WidthList } from "@/components/dashboard/inventory/width-list"
import { StockFilters, type StockFilterOptions } from "@/components/dashboard/inventory/stock-filters"
import { WidthFilters, type WidthFilterOptions } from "@/components/dashboard/inventory/width-filters"
import { MaterialSearch } from "@/components/dashboard/inventory/material-search"
import { MaterialCard } from "@/components/dashboard/inventory/material-card"
import { StockMovementForm } from "@/components/dashboard/inventory/materials/stock-movement-form"
import { MaterialForm } from "@/components/dashboard/inventory/materials/material-form"
import { WidthForm } from "@/components/dashboard/inventory/width-form"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { materiaux } from "@/lib/api/materiaux"
import type { MaterialWithStocks } from "@/lib/api/types"

export default function InventoryPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithStocks | null>(null)
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null)
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showWidthForm, setShowWidthForm] = useState(false)
  const [stockFilters, setStockFilters] = useState<StockFilterOptions>({
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [widthFilters, setWidthFilters] = useState<WidthFilterOptions>({
    status: 'all',
    sortBy: 'width',
    sortOrder: 'asc'
  })
  const [materials, setMaterials] = useState<MaterialWithStocks[]>([])
  const [materialTypes, setMaterialTypes] = useState<string[]>([])

  // Charger les types de matériaux
  useEffect(() => {
    const loadMaterialTypes = async () => {
      try {
        const response = await materiaux.getAll()
        const types = [...new Set(response.map(m => m.type_materiau))]
        setMaterialTypes(types)
        setMaterials(response as MaterialWithStocks[])
      } catch (error) {
        console.error("Erreur lors du chargement des types de matériaux:", error)
        toast.error("Erreur lors du chargement des types de matériaux")
      }
    }

    loadMaterialTypes()
  }, [])

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

  const handleMaterialSelect = (material: MaterialWithStocks) => {
    setSelectedMaterial(material)
    if (material.stocks && material.stocks.length > 0) {
      setSelectedStockId(material.stocks[0].stock_id)
      setShowMovementForm(true)
    } else {
      toast.error("Ce matériau n'a pas de stock disponible")
    }
  }

  const handleStockFiltersChange = (filters: StockFilterOptions) => {
    setStockFilters(filters)
  }

  const handleWidthFiltersChange = (filters: WidthFilterOptions) => {
    setWidthFilters(filters)
  }

  const handleMovementSubmit = () => {
    setShowMovementForm(false)
    toast.success("Mouvement de stock enregistré avec succès")
  }

  const handleMaterialSubmit = () => {
    setShowMaterialForm(false)
    toast.success("Matériau enregistré avec succès")
  }

  const handleWidthSubmit = () => {
    setShowWidthForm(false)
    toast.success("Largeur enregistrée avec succès")
  }

  if (!user || !hasRole(["admin", "caisse", "graphiste"])) {
    return <UnauthorizedAlert onDismiss={() => router.push("/dashboard")} />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventaire</h1>
          <p className="text-muted-foreground">
            Gestion complète du stock et des mouvements
          </p>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="materials">Matériaux</TabsTrigger>
            <TabsTrigger value="widths">Largeurs</TabsTrigger>
          </TabsList>

          {/* Onglet Stocks */}
          <TabsContent value="stocks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="col-span-full">
                <MaterialSearch onSelect={handleMaterialSelect} />
              </div>
              <div className="col-span-full md:col-span-1">
                <StockFilters 
                  onFiltersChange={handleStockFiltersChange}
                  materialTypes={materialTypes}
                />
              </div>
            </div>
            <div className="col-span-full">
              <StockList />
            </div>
          </TabsContent>

          {/* Onglet Matériaux */}
          <TabsContent value="materials" className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowMaterialForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Nouveau matériau
              </button>
            </div>
            <MaterialList />
          </TabsContent>

          {/* Onglet Largeurs */}
          <TabsContent value="widths" className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowWidthForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Nouvelle largeur
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="col-span-full md:col-span-1">
                <WidthFilters 
                  onFiltersChange={handleWidthFiltersChange}
                  materials={materials}
                />
              </div>
            </div>
            <WidthList />
          </TabsContent>
        </Tabs>

        {/* Formulaire de mouvement de stock */}
        {showMovementForm && selectedStockId && (
          <Dialog open={showMovementForm} onOpenChange={setShowMovementForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Mouvement de stock</DialogTitle>
              </DialogHeader>
              <StockMovementForm
                stockId={selectedStockId}
                onSuccess={handleMovementSubmit}
                onCancel={() => setShowMovementForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Formulaire de matériau */}
        {showMaterialForm && (
          <Dialog open={showMaterialForm} onOpenChange={setShowMaterialForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouveau matériau</DialogTitle>
              </DialogHeader>
              <MaterialForm
                onSubmit={handleMaterialSubmit}
                onCancel={() => setShowMaterialForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Formulaire de largeur */}
        {showWidthForm && (
          <Dialog open={showWidthForm} onOpenChange={setShowWidthForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouvelle largeur</DialogTitle>
              </DialogHeader>
              <WidthForm
                onSuccess={handleWidthSubmit}
                onCancel={() => setShowWidthForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
} 