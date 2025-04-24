import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { materiaux } from '@/lib/api/materiaux';
import type { Materiau, StockMateriau } from '@/lib/api/types';
import type { MateriauResponse } from '@/lib/api/materiaux';

interface WidthSelectorProps {
  materiauId: number;
  value?: number;
  onChange: (stockId: number | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showStockInfo?: boolean;
  filterLowStock?: boolean;
}

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export function WidthSelector({
  materiauId,
  value,
  onChange,
  className,
  placeholder = "Sélectionnez une largeur",
  disabled = false,
  required = false,
  showStockInfo = true,
  filterLowStock = false,
}: WidthSelectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [materiau, setMateriau] = useState<Materiau | null>(null);
  const [stocks, setStocks] = useState<StockMateriau[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockMateriau | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await materiaux.getById(materiauId);
        const data = response as unknown as MateriauResponse;
        setMateriau(data.data || null);
        
        // Filtrer les stocks si nécessaire
        let filteredStocks = data.data?.stocks || [];
        if (filterLowStock) {
          filteredStocks = filteredStocks.filter((stock: StockMateriau) => 
            stock.quantite_en_stock > stock.seuil_alerte
          );
        }
        
        setStocks(filteredStocks);
        
        // Sélectionner le stock par défaut si une valeur est fournie
        if (value) {
          const stock = filteredStocks.find((s: StockMateriau) => s.stock_id === value);
          if (stock) {
            setSelectedStock(stock);
          }
        }
      } catch (error) {
        console.error('Error fetching material data:', error);
        toast.error('Erreur lors du chargement des données du matériau');
      } finally {
        setLoading(false);
      }
    };

    if (materiauId) {
      fetchData();
    }
  }, [materiauId, value, filterLowStock]);

  const handleSelect = (stock: StockMateriau) => {
    setSelectedStock(stock);
    onChange(stock.stock_id);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedStock(null);
    onChange(undefined);
  };

  const getStockStatus = (stock: StockMateriau): { label: string; variant: BadgeVariant } => {
    if (stock.quantite_en_stock <= 0) {
      return { label: 'Rupture', variant: 'destructive' };
    } else if (stock.quantite_en_stock <= stock.seuil_alerte) {
      return { label: 'Faible', variant: 'secondary' };
    } else {
      return { label: 'Normal', variant: 'default' };
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedStock && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled || loading || stocks.length === 0}
          >
            {loading ? (
              "Chargement..."
            ) : selectedStock ? (
              <div className="flex items-center">
                <span>{selectedStock.largeur}m</span>
                {showStockInfo && (
                  <Badge 
                    variant={getStockStatus(selectedStock).variant} 
                    className="ml-2"
                  >
                    {selectedStock.quantite_en_stock} {selectedStock.unite_mesure}
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Rechercher une largeur..." />
            <CommandEmpty>Aucune largeur trouvée.</CommandEmpty>
            <CommandGroup>
              {stocks.map((stock: StockMateriau) => {
                const status = getStockStatus(stock);
                return (
                  <CommandItem
                    key={stock.stock_id}
                    value={`${stock.largeur}`}
                    onSelect={() => handleSelect(stock)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedStock?.stock_id === stock.stock_id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>{stock.largeur}m</span>
                      </div>
                      {showStockInfo && (
                        <Badge variant={status.variant}>
                          {stock.quantite_en_stock} {stock.unite_mesure}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedStock && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 self-end"
          onClick={handleClear}
        >
          <X className="h-4 w-4 mr-1" />
          Effacer
        </Button>
      )}
      
      {required && !selectedStock && !disabled && (
        <p className="text-sm text-destructive">Une largeur est requise</p>
      )}
    </div>
  );
} 