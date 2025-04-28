"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Plus, Minus, Settings } from "lucide-react"
import { toast } from "sonner"
import materiaux from "@/lib/api/materiaux"
import type { Material, MaterialStock } from "@/lib/api/types"

interface StockManagementDialogProps {
  material: Material | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStockUpdate: () => void
}

export function StockManagementDialog({
  material,
  open,
  onOpenChange,
  onStockUpdate
}: StockManagementDialogProps) {
  const [selectedStock, setSelectedStock] = useState<MaterialStock | null>(null)
  const [quantity, setQuantity] = useState("")
  const [newWidth, setNewWidth] = useState("")
  const [newThreshold, setNewThreshold] = useState("")
  const [loading, setLoading] = useState(false)

  const handleStockMovement = async (type: "add" | "remove") => {
    if (!material || !selectedStock || !quantity) {
      toast.error("Veuillez sélectionner une largeur et spécifier une quantité")
      return
    }

    try {
      setLoading(true)
      const qty = parseInt(quantity)
      if (isNaN(qty) || qty <= 0) {
        toast.error("La quantité doit être un nombre positif")
        return
      }

      if (type === "remove" && qty > selectedStock.quantite_en_stock) {
        toast.error("Stock insuffisant")
        return
      }

      await materiaux.updateStock(material.materiau_id, selectedStock.stock_id, {
        quantite_en_stock: type === "add" ? qty : -qty
      })

      toast.success(`Stock ${type === "add" ? "ajouté" : "retiré"} avec succès`)
      setQuantity("")
      onStockUpdate()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du stock")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewWidth = async () => {
    if (!material || !newWidth || !newThreshold) {
      toast.error("Veuillez spécifier une largeur et un seuil d'alerte")
      return
    }

    try {
      setLoading(true)
      const width = parseInt(newWidth)
      const threshold = parseInt(newThreshold)
      
      if (isNaN(width) || width <= 0 || isNaN(threshold) || threshold < 0) {
        toast.error("Valeurs invalides")
        return
      }

      await materiaux.addStock(material.materiau_id, {
        largeur: width,
        seuil_alerte: threshold,
        quantite_en_stock: 0,
        unite_mesure: material.unite_mesure
      })

      toast.success("Nouvelle largeur ajoutée")
      setNewWidth("")
      setNewThreshold("")
      onStockUpdate()
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la largeur")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateThreshold = async () => {
    if (!material || !selectedStock || !newThreshold) {
      toast.error("Veuillez sélectionner une largeur et spécifier un seuil")
      return
    }

    try {
      setLoading(true)
      const threshold = parseInt(newThreshold)
      
      if (isNaN(threshold) || threshold < 0) {
        toast.error("Le seuil doit être un nombre positif")
        return
      }

      await materiaux.updateStock(material.materiau_id, selectedStock.stock_id, {
        seuil_alerte: threshold
      })

      toast.success("Seuil d'alerte mis à jour")
      setNewThreshold("")
      onStockUpdate()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du seuil")
    } finally {
      setLoading(false)
    }
  }

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestion des stocks - {material.type_materiau}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="movement">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movement">Mouvements</TabsTrigger>
            <TabsTrigger value="new">Nouvelle largeur</TabsTrigger>
            <TabsTrigger value="thresholds">Seuils d'alerte</TabsTrigger>
          </TabsList>

          <TabsContent value="movement" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Largeur</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedStock?.stock_id || ""}
                  onChange={(e) => {
                    const stock = material.stocks.find(s => s.stock_id === parseInt(e.target.value))
                    setSelectedStock(stock || null)
                  }}
                >
                  <option value="">Sélectionner une largeur</option>
                  {material.stocks.map(stock => (
                    <option key={stock.stock_id} value={stock.stock_id}>
                      {stock.largeur} cm - Stock actuel: {stock.quantite_en_stock} {material.unite_mesure}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Quantité en ${material.unite_mesure}`}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleStockMovement("add")}
                  disabled={loading}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                <Button
                  onClick={() => handleStockMovement("remove")}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Retirer
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Nouvelle largeur (cm)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newWidth}
                  onChange={(e) => setNewWidth(e.target.value)}
                  placeholder="Largeur en cm"
                />
              </div>

              <div className="grid gap-2">
                <Label>Seuil d'alerte</Label>
                <Input
                  type="number"
                  min="0"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder={`Seuil en ${material.unite_mesure}`}
                />
              </div>

              <Button onClick={handleAddNewWidth} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la largeur
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Largeur</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedStock?.stock_id || ""}
                  onChange={(e) => {
                    const stock = material.stocks.find(s => s.stock_id === parseInt(e.target.value))
                    setSelectedStock(stock || null)
                  }}
                >
                  <option value="">Sélectionner une largeur</option>
                  {material.stocks.map(stock => (
                    <option key={stock.stock_id} value={stock.stock_id}>
                      {stock.largeur} cm - Seuil actuel: {stock.seuil_alerte} {material.unite_mesure}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Nouveau seuil d'alerte</Label>
                <Input
                  type="number"
                  min="0"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder={`Seuil en ${material.unite_mesure}`}
                />
              </div>

              <Button onClick={handleUpdateThreshold} disabled={loading}>
                <Settings className="w-4 h-4 mr-2" />
                Mettre à jour le seuil
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}