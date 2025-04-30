"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Plus, Minus, Settings, History } from "lucide-react"
import { toast } from "sonner"
import materiaux from "@/lib/api/materiaux"
import type { Materiau, StockMateriauxLargeur } from "@/lib/api/types"
import { formatStockLength, isLowStock, isOutOfStock } from "@/lib/utils/stock-calculations"

interface MateriauAvecStocks extends Materiau {
  stocks: StockMateriauxLargeur[];
}

interface StockManagementDialogProps {
  material: MateriauAvecStocks | null
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
  const [selectedStock, setSelectedStock] = useState<StockMateriauxLargeur | null>(null)
  const [longueur, setLongueur] = useState("")
  const [newWidth, setNewWidth] = useState("")
  const [newThreshold, setNewThreshold] = useState("")
  const [commentaire, setCommentaire] = useState("")
  const [loading, setLoading] = useState(false)

  const handleStockMovement = async (type: "add" | "remove") => {
    if (!material || !selectedStock || !longueur) {
      toast.error("Veuillez sélectionner une largeur et spécifier une longueur")
      return
    }

    try {
      setLoading(true)
      const qty = parseFloat(longueur)
      if (isNaN(qty) || qty <= 0) {
        toast.error("La longueur doit être un nombre positif")
        return
      }

      if (type === "remove" && qty > selectedStock.longeur_en_stock) {
        toast.error("Stock insuffisant")
        return
      }

      await materiaux.moveStock(
        material.materiau_id, 
        selectedStock.stock_id, 
        type === "add" ? qty : -qty
      )

      toast.success(`${type === "add" ? "Entrée" : "Sortie"} de stock effectuée`)
      setLongueur("")
      setCommentaire("")
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
      const width = parseFloat(newWidth)
      const threshold = parseFloat(newThreshold)
      
      if (isNaN(width) || width <= 0 || isNaN(threshold) || threshold < 0) {
        toast.error("Valeurs invalides")
        return
      }

      await materiaux.addStock(material.materiau_id, {
        largeur: width,
        seuil_alerte: threshold,
        longeur_en_stock: 0
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
      const threshold = parseFloat(newThreshold)
      
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
  
  const getStockStatusColor = (stock: StockMateriauxLargeur) => {
    if (isOutOfStock(stock)) return "text-red-500";
    if (isLowStock(stock)) return "text-yellow-500";
    return "text-green-500";
  }

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestion des stocks - {material.type_materiau}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="movement">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="movement">Mouvements</TabsTrigger>
            <TabsTrigger value="new">Nouvelle largeur</TabsTrigger>
            <TabsTrigger value="thresholds">Seuils d'alerte</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
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
                    <option 
                      key={stock.stock_id} 
                      value={stock.stock_id}
                      className={getStockStatusColor(stock)}
                    >
                      {stock.largeur} cm - Stock actuel: {formatStockLength(stock.longeur_en_stock, material.unite_mesure)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Longueur (cm)</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="1"
                  value={longueur}
                  onChange={(e) => setLongueur(e.target.value)}
                  placeholder="Longueur en centimètres"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Commentaire (optionnel)</Label>
                <Input
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Raison du mouvement de stock"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleStockMovement("add")}
                  disabled={loading}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter au stock
                </Button>
                <Button
                  onClick={() => handleStockMovement("remove")}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Retirer du stock
                </Button>
              </div>
              
              {selectedStock && (
                <div className="rounded-md bg-slate-50 p-3 mt-2">
                  <div className="text-sm">
                    <span className="font-semibold">Largeur:</span> {selectedStock.largeur} cm
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Stock actuel:</span> {formatStockLength(selectedStock.longeur_en_stock, material.unite_mesure)}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Seuil d'alerte:</span> {formatStockLength(selectedStock.seuil_alerte, material.unite_mesure)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Nouvelle largeur (cm)</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  value={newWidth}
                  onChange={(e) => setNewWidth(e.target.value)}
                  placeholder="Largeur en cm"
                />
              </div>

              <div className="grid gap-2">
                <Label>Seuil d'alerte (cm)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="Seuil en centimètres"
                />
              </div>

              <Button onClick={handleAddNewWidth} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la largeur
              </Button>
              
              <div className="rounded-md bg-slate-50 p-3 mt-2">
                <h4 className="text-sm font-medium mb-2">Largeurs existantes:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {material.stocks.map(stock => (
                    <div key={stock.stock_id} className="text-sm">
                      {stock.largeur} cm
                    </div>
                  ))}
                </div>
              </div>
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
                    if (stock) {
                      setNewThreshold(stock.seuil_alerte.toString())
                    }
                  }}
                >
                  <option value="">Sélectionner une largeur</option>
                  {material.stocks.map(stock => (
                    <option key={stock.stock_id} value={stock.stock_id}>
                      {stock.largeur} cm - Seuil actuel: {formatStockLength(stock.seuil_alerte, material.unite_mesure)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Nouveau seuil d'alerte (cm)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="Seuil en centimètres"
                />
              </div>

              <Button 
                onClick={handleUpdateThreshold} 
                disabled={loading}
              >
                <Settings className="w-4 h-4 mr-2" />
                Mettre à jour le seuil
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="text-center text-muted-foreground p-8">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>L'historique des mouvements de stock sera disponible prochainement.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}