import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StockFilterOptions = {
  minQuantity?: number;
  maxQuantity?: number;
  status?: 'all' | 'normal' | 'low' | 'critical';
  materialType?: string;
  sortBy?: 'quantity' | 'name' | 'type';
  sortOrder?: 'asc' | 'desc';
};

interface StockFiltersProps {
  onFiltersChange: (filters: StockFilterOptions) => void;
  materialTypes: string[];
  className?: string;
}

export function StockFilters({
  onFiltersChange,
  materialTypes,
  className
}: StockFiltersProps) {
  const [filters, setFilters] = useState<StockFilterOptions>({
    status: 'all' as const,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof StockFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: StockFilterOptions = {
      status: 'all' as const,
      sortBy: 'name' as const,
      sortOrder: 'asc' as const
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Filtres</CardTitle>
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
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
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
            <Label>Type de matériau</Label>
            <Select
              value={filters.materialType}
              onValueChange={(value) => handleFilterChange('materialType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantité minimale</Label>
            <Input
              type="number"
              min="0"
              value={filters.minQuantity || ''}
              onChange={(e) => handleFilterChange('minQuantity', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Quantité minimale"
            />
          </div>

          <div className="space-y-2">
            <Label>Quantité maximale</Label>
            <Input
              type="number"
              min="0"
              value={filters.maxQuantity || ''}
              onChange={(e) => handleFilterChange('maxQuantity', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Quantité maximale"
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
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="quantity">Quantité</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordre</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
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