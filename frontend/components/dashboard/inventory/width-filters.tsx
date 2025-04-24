import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type WidthFilterOptions = {
  minWidth?: number;
  maxWidth?: number;
  status?: 'all' | 'normal' | 'low' | 'critical';
  materialId?: number;
  sortBy?: 'width' | 'stock' | 'material';
  sortOrder?: 'asc' | 'desc';
};

interface WidthFiltersProps {
  onFiltersChange: (filters: WidthFilterOptions) => void;
  materials: { materiau_id: number; nom: string | null; type_materiau: string }[];
  className?: string;
}

export function WidthFilters({
  onFiltersChange,
  materials,
  className
}: WidthFiltersProps) {
  const [filters, setFilters] = useState<WidthFilterOptions>({
    status: 'all' as const,
    sortBy: 'width' as const,
    sortOrder: 'asc' as const
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof WidthFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: WidthFilterOptions = {
      status: 'all' as const,
      sortBy: 'width' as const,
      sortOrder: 'asc' as const
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Filtres des largeurs</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? "Réduire" : "Filtrer"}
        </Button>
      </CardHeader>
      <CardContent className={cn(
        "space-y-4",
        !isExpanded && "hidden"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>État du stock</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un état" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Matériau</Label>
            <Select
              value={filters.materialId?.toString()}
              onValueChange={(value) => handleFilterChange('materialId', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un matériau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les matériaux</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material.materiau_id} value={material.materiau_id.toString()}>
                    {material.nom || material.type_materiau}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Largeur minimale (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={filters.minWidth || ''}
              onChange={(e) => handleFilterChange('minWidth', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Largeur minimale"
            />
          </div>

          <div className="space-y-2">
            <Label>Largeur maximale (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={filters.maxWidth || ''}
              onChange={(e) => handleFilterChange('maxWidth', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Largeur maximale"
            />
          </div>

          <div className="space-y-2">
            <Label>Trier par</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un critère" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="width">Largeur</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="material">Matériau</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordre</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'ordre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Croissant</SelectItem>
                <SelectItem value="desc">Décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 