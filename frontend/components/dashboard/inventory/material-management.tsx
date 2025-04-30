// components/dashboard/inventory/material-management.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StockManagementDialog } from "./stockManagementDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import materiaux from "@/lib/api/materiaux";
import { MaterialForm } from "./material-form";
import { StockWidthList } from "./stock-width-list";
import type { Materiau, StockMateriauxLargeur } from "@/lib/api/types";
import { toast } from "sonner";
import { AlertTriangle, Package, ArrowUpDown, BarChart } from "lucide-react";
import { calculateTotalSurface, calculateTotalValue, formatSurfaceDisplay } from "@/lib/utils/stock-calculations";

// Type étendu pour les matériaux avec leur stock
interface MateriauAvecStocks extends Materiau {
  stocks: StockMateriauxLargeur[];
}

interface MaterialManagementProps {
  onMaterialSelect?: (materiau: Materiau) => void;
}

export function MaterialManagement({
  onMaterialSelect,
}: MaterialManagementProps) {
  const [materialsData, setMaterialsData] = useState<MateriauAvecStocks[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MateriauAvecStocks | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockMaterial, setStockMaterial] = useState<MateriauAvecStocks | null>(null);
  const [displayMode, setDisplayMode] = useState<"table" | "cards">("table");
  const [sortConfig, setSortConfig] = useState<{
    key: "type" | "stock" | "price";
    direction: "asc" | "desc";
  }>({ key: "type", direction: "asc" });

  // Chargement initial des matériaux
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const response = await materiaux.getAll();
      setMaterialsData(response as MateriauAvecStocks[]);
    } catch (error) {
      toast.error("Erreur lors du chargement des matériaux");
    }
  };

  // Gestion de la recherche
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    try {
      if (term) {
        const results = await materiaux.search(term);
        setMaterialsData(results as MateriauAvecStocks[]);
      } else {
        loadMaterials();
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    }
  };

  // Gestion du tri
  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedMaterials = [...materialsData].sort((a, b) => {
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    switch (sortConfig.key) {
      case "type":
        return direction * a.type_materiau.localeCompare(b.type_materiau);
      case "stock":
        const stockA = a.stocks.reduce(
          (sum, s) => sum + s.longeur_en_stock,
          0
        );
        const stockB = b.stocks.reduce(
          (sum, s) => sum + s.longeur_en_stock,
          0
        );
        return direction * (stockA - stockB);
      case "price":
        return direction * (a.prix_unitaire - b.prix_unitaire);
      default:
        return 0;
    }
  });

  // Gestion du formulaire
  const handleFormSubmit = async () => {
    setShowForm(false);
    await loadMaterials();
    toast.success(selectedMaterial ? "Matériau mis à jour" : "Matériau créé");
  };

  // Gestion du stock
  const handleStockUpdate = async () => {
    setStockDialogOpen(false);
    await loadMaterials();
    toast.success("Stock mis à jour avec succès");
  };

  // Affichage des options disponibles
  const renderOptions = (options: Record<string, any>) => {
    if (!options || Object.keys(options).length === 0) {
      return <span className="text-muted-foreground">Aucune option</span>;
    }

    return (
      <div className="text-xs space-y-1">
        {Object.entries(options).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span>{key}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec recherche et actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un matériau..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDisplayMode(displayMode === "table" ? "cards" : "table")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            {displayMode === "table" ? "Affichage cartes" : "Affichage tableau"}
          </Button>
          <Button
            onClick={() => {
              setSelectedMaterial(null);
              setShowForm(true);
            }}
          >
            <Package className="mr-2 h-4 w-4" />
            Nouveau matériau
          </Button>
        </div>
      </div>

      {/* Liste des matériaux (affichage tableau) */}
      {displayMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Liste des matériaux</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Largeurs et stocks</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    Prix unitaire
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMaterials.map((material) => (
                  <TableRow key={material.materiau_id}>
                    <TableCell className="font-medium">
                      {material.type_materiau}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {material.description || "Aucune description"}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <StockWidthList 
                        stocks={material.stocks} 
                        uniteMateriaux={material.unite_mesure}
                        prixUnitaire={material.prix_unitaire}
                        displayFormat="badges"
                      />
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      {renderOptions(material.options_disponibles)}
                    </TableCell>
                    <TableCell>
                      {material.prix_unitaire.toLocaleString()} FCFA/{material.unite_mesure}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setShowForm(true);
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setStockMaterial(material);
                            setStockDialogOpen(true);
                          }}
                        >
                          Stocks
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Affichage en cartes */}
      {displayMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMaterials.map(material => (
            <Card key={material.materiau_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{material.type_materiau}</CardTitle>
                  <Badge>{material.prix_unitaire.toLocaleString()} FCFA/{material.unite_mesure}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm line-clamp-2 text-muted-foreground">
                  {material.description || "Aucune description"}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Stocks par largeur:</h4>
                  <StockWidthList 
                    stocks={material.stocks} 
                    uniteMateriaux={material.unite_mesure}
                    prixUnitaire={material.prix_unitaire}
                    displayFormat="compact"
                  />
                </div>
                
                {Object.keys(material.options_disponibles).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Options disponibles:</h4>
                    {renderOptions(material.options_disponibles)}
                  </div>
                )}

                <div className="border-t pt-3 mt-2">
                  <div className="flex text-xs justify-between">
                    <span>Valeur totale:</span>
                    <span className="font-medium">
                      {calculateTotalValue(material, material.stocks).toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex text-xs justify-between">
                    <span>Surface disponible:</span>
                    <span className="font-medium">
                      {formatSurfaceDisplay({unite_mesure: material.unite_mesure} as any, calculateTotalSurface(material, material.stocks))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setShowForm(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setStockMaterial(material);
                      setStockDialogOpen(true);
                    }}
                  >
                    Gérer stocks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Formulaire de matériau */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? "Modifier un matériau" : "Ajouter un matériau"}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            initialData={selectedMaterial ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue de gestion des stocks */}
      <StockManagementDialog
        material={stockMaterial}
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        onStockUpdate={handleStockUpdate}
      />
    </div>
  );
}
