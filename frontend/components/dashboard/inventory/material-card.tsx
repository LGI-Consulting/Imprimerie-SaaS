import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockLevelIndicator } from "./stock-level-indicator";
import { Edit, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Materiau, StockMateriau } from "@/lib/api/types";

interface MaterialWithStocks extends Materiau {
  stocks?: StockMateriau[];
}

interface MaterialCardProps {
  material: MaterialWithStocks;
  onEdit?: (material: MaterialWithStocks) => void;
  onDelete?: (material: MaterialWithStocks) => void;
  className?: string;
}

export function MaterialCard({
  material,
  onEdit,
  onDelete,
  className
}: MaterialCardProps) {
  // Calculer le stock total et le seuil d'alerte minimum
  const stockInfo = material.stocks?.reduce((acc: { totalQuantity: number; minThreshold: number }, stock: StockMateriau) => ({
    totalQuantity: acc.totalQuantity + stock.quantite_en_stock,
    minThreshold: Math.min(acc.minThreshold, stock.seuil_alerte)
  }), { totalQuantity: 0, minThreshold: Infinity }) || { totalQuantity: 0, minThreshold: 0 };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {material.nom || material.type_materiau}
        </CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="text-sm font-medium">{material.type_materiau}</span>
          </div>
          {material.description && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="text-sm font-medium">{material.description}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Prix unitaire</span>
            <span className="text-sm font-medium">
              {material.prix_unitaire} €/{material.unite_mesure}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stock total</span>
            <StockLevelIndicator
              quantity={stockInfo.totalQuantity}
              threshold={stockInfo.minThreshold}
              size="sm"
            />
          </div>
          {material.stocks && material.stocks.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Largeurs disponibles</span>
              <div className="mt-2 space-y-1">
                {material.stocks.map((stock: StockMateriau) => (
                  <div key={stock.stock_id} className="flex items-center justify-between text-sm">
                    <span>{stock.largeur}m</span>
                    <StockLevelIndicator
                      quantity={stock.quantite_en_stock}
                      threshold={stock.seuil_alerte}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(material)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(material)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 