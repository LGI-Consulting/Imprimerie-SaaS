import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, AlertTriangle } from "lucide-react"
import type { Material } from "@/lib/api/types"

interface MaterialCardProps {
  material: Material
  onEdit?: (material: Material) => void
  onDelete?: (material: Material) => void
}

export function MaterialCard({ material, onEdit, onDelete }: MaterialCardProps) {
  const getTotalStock = () => {
    return material.stocks.reduce((total, stock) => total + stock.quantite_en_stock, 0)
  }

  const hasLowStock = () => {
    return material.stocks.some(stock => stock.quantite_en_stock <= stock.seuil_alerte)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{material.type_materiau}</span>
          {hasLowStock() && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Stock bas
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Description</p>
          <p>{material.description || "Aucune description"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Prix unitaire</p>
          <p>{material.prix_unitaire} FCFA/{material.unite_mesure}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Stock total</p>
          <p>{getTotalStock()} {material.unite_mesure}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Largeurs disponibles</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {material.stocks.map(stock => (
              <Badge 
                key={stock.stock_id} 
                variant={stock.quantite_en_stock <= stock.seuil_alerte ? "secondary" : "default"}
                className={stock.quantite_en_stock <= stock.seuil_alerte ? "bg-yellow-100 text-yellow-800" : ""}
              >
                {stock.largeur} cm ({stock.quantite_en_stock} {material.unite_mesure})
              </Badge>
            ))}
          </div>
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
  )
}