"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"

import type { StockMateriau, Materiau } from "@/lib/api/types"
import { materiaux } from "@/lib/api/materiaux"

// Types pour les filtres
interface StockFilters {
  search: string
  materialType: string
  stockStatus: string
  width: string
}

// Types pour le tri
type SortField = "materiau" | "largeur" | "quantite" | "seuil_alerte"
type SortOrder = "asc" | "desc"

// Interface étendue pour Materiau avec les stocks
interface MateriauWithStocks extends Materiau {
  stocks?: StockMateriau[]
}

// Interface étendue pour StockMateriau avec les informations du matériau
interface StockWithMaterial extends StockMateriau {
  materiau?: Materiau
}

// Type pour les variantes de badge
type BadgeVariant = "default" | "destructive" | "outline" | "secondary"

export function StockList() {
  const router = useRouter()
  const { toast } = useToast()
  const [stocks, setStocks] = useState<StockWithMaterial[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockWithMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockWithMaterial | undefined>()
  const [filters, setFilters] = useState<StockFilters>({
    search: "",
    materialType: "",
    stockStatus: "",
    width: "",
  })
  const [sortField, setSortField] = useState<SortField>("materiau")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Charger les stocks
  useEffect(() => {
    fetchStocks()
  }, [])

  // Filtrer et trier les stocks
  useEffect(() => {
    let result = [...stocks]
    
    // Appliquer les filtres
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (stock) =>
          stock.materiau?.type_materiau.toLowerCase().includes(searchLower) ||
          stock.materiau?.nom?.toLowerCase().includes(searchLower) ||
          stock.largeur.toString().includes(searchLower)
      )
    }
    
    if (filters.materialType) {
      result = result.filter(
        (stock) => stock.materiau?.type_materiau === filters.materialType
      )
    }
    
    if (filters.stockStatus) {
      if (filters.stockStatus === "low") {
        result = result.filter(
          (stock) => stock.quantite_en_stock <= stock.seuil_alerte
        )
      } else if (filters.stockStatus === "out") {
        result = result.filter((stock) => stock.quantite_en_stock === 0)
      }
    }
    
    if (filters.width) {
      result = result.filter(
        (stock) => stock.largeur.toString() === filters.width
      )
    }
    
    // Appliquer le tri
    result.sort((a, b) => {
      let comparison = 0
      
      if (sortField === "materiau") {
        const aName = a.materiau?.type_materiau || ""
        const bName = b.materiau?.type_materiau || ""
        comparison = aName.localeCompare(bName)
      } else if (sortField === "largeur") {
        comparison = a.largeur - b.largeur
      } else if (sortField === "quantite") {
        comparison = a.quantite_en_stock - b.quantite_en_stock
      } else if (sortField === "seuil_alerte") {
        comparison = a.seuil_alerte - b.seuil_alerte
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })
    
    setFilteredStocks(result)
  }, [stocks, filters, sortField, sortOrder])

  const fetchStocks = async () => {
    try {
      setIsLoading(true)
      // Récupérer tous les matériaux avec leurs stocks
      const materials = await materiaux.getAll() as MateriauWithStocks[]
      
      // Transformer les données pour avoir les stocks avec les informations des matériaux
      const stocksWithMaterials: StockWithMaterial[] = []
      
      materials.forEach((material) => {
        if (material.stocks) {
          material.stocks.forEach((stock: StockMateriau) => {
            stocksWithMaterials.push({
              ...stock,
              materiau: material,
            })
          })
        }
      })
      
      setStocks(stocksWithMaterials)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les stocks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      // Appel à l'API pour supprimer le stock
      // await stocks.delete(id)
      toast({
        title: "Succès",
        description: "Le stock a été supprimé avec succès",
      })
      fetchStocks()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le stock",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (stock: StockWithMaterial) => {
    setSelectedStock(stock)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedStock(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = () => {
    setIsFormOpen(false)
    fetchStocks()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
  }

  const handleViewDetails = (stock: StockWithMaterial) => {
    // Navigation vers la page de détails (à implémenter)
    router.push(`/dashboard/inventory/stocks/${stock.stock_id}`)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Obtenir les types de matériaux uniques
  const materialTypes = Array.from(
    new Set(stocks.map((stock) => stock.materiau?.type_materiau).filter((type): type is string => !!type))
  )

  // Obtenir les largeurs uniques
  const widths = Array.from(
    new Set(stocks.map((stock) => stock.largeur))
  ).sort((a, b) => a - b)

  // Fonction pour déterminer le statut du stock
  const getStockStatus = (stock: StockWithMaterial) => {
    if (stock.quantite_en_stock === 0) {
      return { label: "Rupture", variant: "destructive" as BadgeVariant }
    } else if (stock.quantite_en_stock <= stock.seuil_alerte) {
      return { label: "Stock bas", variant: "secondary" as BadgeVariant }
    } else {
      return { label: "Normal", variant: "default" as BadgeVariant }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stocks</CardTitle>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau stock
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un stock..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select
              value={filters.materialType}
              onValueChange={(value) => setFilters({ ...filters, materialType: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de matériau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.stockStatus}
              onValueChange={(value) => setFilters({ ...filters, stockStatus: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="État du stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les stocks</SelectItem>
                <SelectItem value="low">Stock bas</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.width}
              onValueChange={(value) => setFilters({ ...filters, width: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Largeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les largeurs</SelectItem>
                {widths.map((width) => (
                  <SelectItem key={width} value={width.toString()}>
                    {width}m
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("materiau")}
                >
                  Matériau
                  {sortField === "materiau" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("largeur")}
                >
                  Largeur
                  {sortField === "largeur" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("quantite")}
                >
                  Quantité
                  {sortField === "quantite" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("seuil_alerte")}
                >
                  Seuil d'alerte
                  {sortField === "seuil_alerte" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Aucun stock trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredStocks.map((stock) => {
                  const status = getStockStatus(stock)
                  return (
                    <TableRow key={stock.stock_id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{stock.materiau?.type_materiau}</div>
                            {stock.materiau?.nom && (
                              <div className="text-sm text-muted-foreground">{stock.materiau.nom}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{stock.largeur}m</TableCell>
                      <TableCell>{stock.quantite_en_stock}</TableCell>
                      <TableCell>{stock.seuil_alerte}</TableCell>
                      <TableCell>{stock.unite_mesure}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(stock)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(stock)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement le stock.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(stock.stock_id)}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStock ? "Modifier le stock" : "Nouveau stock"}
            </DialogTitle>
          </DialogHeader>
          {/* Le formulaire de stock sera implémenté plus tard */}
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Le formulaire de gestion des stocks sera implémenté prochainement.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 