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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

import type { Materiau, StockMateriau } from "@/lib/api/types"
import { materiaux } from "@/lib/api/materiaux"
import { MaterialForm } from "./material-form"

// Interface étendue pour Materiau avec les stocks
interface MateriauWithStocks extends Materiau {
  stocks?: StockMateriau[]
}

// Types pour les filtres
interface MaterialFilters {
  search: string
  type: string
  stockStatus: string
}

// Types pour le tri
type SortField = "type_materiau" | "nom" | "prix_unitaire" | "date_creation"
type SortOrder = "asc" | "desc"

export function MaterialList() {
  const router = useRouter()
  const { toast } = useToast()
  const [materials, setMaterials] = useState<MateriauWithStocks[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<MateriauWithStocks[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<MateriauWithStocks | undefined>()
  const [filters, setFilters] = useState<MaterialFilters>({
    search: "",
    type: "",
    stockStatus: "",
  })
  const [sortField, setSortField] = useState<SortField>("date_creation")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Charger les matériaux
  useEffect(() => {
    fetchMaterials()
  }, [])

  // Filtrer et trier les matériaux
  useEffect(() => {
    let result = [...materials]
    
    // Appliquer les filtres
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (material) =>
          material.type_materiau.toLowerCase().includes(searchLower) ||
          (material.nom && material.nom.toLowerCase().includes(searchLower)) ||
          (material.description && material.description.toLowerCase().includes(searchLower))
      )
    }
    
    if (filters.type) {
      result = result.filter((material) => material.type_materiau === filters.type)
    }
    
    if (filters.stockStatus) {
      result = result.filter((material) => {
        const stocks = material.stocks || []
        const hasStocks = stocks.length > 0
        if (filters.stockStatus === "low" && hasStocks) {
          return stocks.some(
            (stock) => stock.quantite_en_stock <= stock.seuil_alerte
          )
        }
        return true
      })
    }
    
    // Appliquer le tri
    result.sort((a, b) => {
      let comparison = 0
      
      if (sortField === "type_materiau") {
        comparison = a.type_materiau.localeCompare(b.type_materiau)
      } else if (sortField === "nom") {
        const aName = a.nom || ""
        const bName = b.nom || ""
        comparison = aName.localeCompare(bName)
      } else if (sortField === "prix_unitaire") {
        comparison = a.prix_unitaire - b.prix_unitaire
      } else if (sortField === "date_creation") {
        comparison = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })
    
    setFilteredMaterials(result)
  }, [materials, filters, sortField, sortOrder])

  const fetchMaterials = async () => {
    try {
      setIsLoading(true)
      const data = await materiaux.getAll()
      setMaterials(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matériaux",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await materiaux.delete(id)
      toast({
        title: "Succès",
        description: "Le matériau a été supprimé avec succès",
      })
      fetchMaterials()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le matériau",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (material: MateriauWithStocks) => {
    setSelectedMaterial(material)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedMaterial(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = () => {
    setIsFormOpen(false)
    fetchMaterials()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
  }

  const handleViewDetails = (material: MateriauWithStocks) => {
    // Navigation vers la page de détails (à implémenter)
    router.push(`/dashboard/inventory/materials/${material.materiau_id}`)
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
    new Set(materials.map((material) => material.type_materiau))
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Matériaux</CardTitle>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau matériau
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un matériau..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
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
                  onClick={() => handleSort("type_materiau")}
                >
                  Type
                  {sortField === "type_materiau" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("nom")}
                >
                  Nom
                  {sortField === "nom" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("prix_unitaire")}
                >
                  Prix unitaire
                  {sortField === "prix_unitaire" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("date_creation")}
                >
                  Date de création
                  {sortField === "date_creation" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucun matériau trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => (
                  <TableRow key={material.materiau_id}>
                    <TableCell>{material.type_materiau}</TableCell>
                    <TableCell>{material.nom || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {material.description || "-"}
                    </TableCell>
                    <TableCell>{material.prix_unitaire.toFixed(2)} FCFA</TableCell>
                    <TableCell>{material.unite_mesure}</TableCell>
                    <TableCell>
                      {material.stocks && material.stocks.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {material.stocks.map((stock) => (
                            <div key={stock.stock_id} className="flex items-center gap-2">
                              <span>{stock.largeur}m: {stock.quantite_en_stock}</span>
                              {stock.quantite_en_stock <= stock.seuil_alerte && (
                                <Badge variant="destructive">Stock bas</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline">Aucun stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(material.date_creation).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => handleViewDetails(material)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(material)}>
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
                                  Cette action ne peut pas être annulée. Cela supprimera définitivement le matériau.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(material.materiau_id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? "Modifier le matériau" : "Nouveau matériau"}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            initialData={selectedMaterial}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
} 