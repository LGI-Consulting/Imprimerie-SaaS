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
import type { Material, MaterialStock } from "@/lib/api/types";
import { toast } from "sonner";
import { AlertTriangle, Package, ArrowUpDown } from "lucide-react";

interface MaterialManagementProps {
  onMaterialSelect?: (material: Material) => void;
}

export function MaterialManagement({
  onMaterialSelect,
}: MaterialManagementProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockMaterial, setStockMaterial] = useState<Material | null>(null);
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
      setMaterials(response);
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
        setMaterials(results);
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

  const sortedMaterials = [...materials].sort((a, b) => {
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    switch (sortConfig.key) {
      case "type":
        return direction * a.type_materiau.localeCompare(b.type_materiau);
      case "stock":
        const stockA = a.stocks.reduce(
          (sum, s) => sum + s.quantite_en_stock,
          0
        );
        const stockB = b.stocks.reduce(
          (sum, s) => sum + s.quantite_en_stock,
          0
        );
        return direction * (stockA - stockB);
      case "price":
        return direction * (a.prix_unitaire - b.prix_unitaire);
      default:
        return 0;
    }
  });

  // Composant pour le niveau de stock
  const StockLevel = ({ stock }: { stock: MaterialStock }) => {
    const isLow = stock.quantite_en_stock <= stock.seuil_alerte;
    const isEmpty = stock.quantite_en_stock <= 0;

    return (
      <Badge
        variant={isEmpty ? "destructive" : isLow ? "secondary" : "default"}
        className={
          isLow ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""
        }
      >
        {stock.quantite_en_stock} {stock.unite_mesure}
        {isLow && <AlertTriangle className="ml-1 h-4 w-4 text-yellow-600" />}
      </Badge>
    );
  };

  // Gestion du formulaire
  const handleFormSubmit = async () => {
    setShowForm(false);
    await loadMaterials();
    toast.success(selectedMaterial ? "Matériau mis à jour" : "Matériau créé");
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

      {/* Liste des matériaux */}
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
                <TableHead>Largeurs disponibles</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("stock")}
                >
                  Stocks
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </TableHead>
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
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {material.stocks.map((stock) => (
                        <Badge key={stock.stock_id} variant="outline">
                          {stock.largeur} cm
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {material.stocks.map((stock) => (
                        <StockLevel key={stock.stock_id} stock={stock} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {material.prix_unitaire} FCFA/{material.unite_mesure}
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
                        Gérer stocks
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formulaire de matériau */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? "Modifier" : "Nouveau"} matériau
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            initialData={selectedMaterial}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <StockManagementDialog
        material={stockMaterial}
        open={stockDialogOpen}
        onOpenChange={(open) => {
          setStockDialogOpen(open);
          if (!open) setStockMaterial(null);
        }}
        onStockUpdate={loadMaterials}
      />
    </div>
  );
}
