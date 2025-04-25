import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Materiau, StockMateriau } from "@/lib/api/types";
import { materiaux } from "@/lib/api/materiaux";
import { StockAlertBadge } from "./stock-alert-badge";

interface MaterialWithStocks extends Materiau {
  stocks: StockMateriau[];
}

interface MaterialSearchProps {
  onSelect: (material: MaterialWithStocks) => void;
  className?: string;
  placeholder?: string;
  showStockStatus?: boolean;
}

export function MaterialSearch({
  onSelect,
  className,
  placeholder = "Rechercher un matériau...",
  showStockStatus = true
}: MaterialSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MaterialWithStocks[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMaterials = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const allMaterials = await materiaux.getAll() as MaterialWithStocks[];
        const filtered = allMaterials.filter(material => 
          material.nom?.toLowerCase().includes(query.toLowerCase()) ||
          material.type_materiau.toLowerCase().includes(query.toLowerCase()) ||
          material.description?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 5)); // Limiter à 5 résultats
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMaterials, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (material: MaterialWithStocks) => {
    onSelect(material);
    setQuery("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Recherche en cours...</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((material) => (
                <li
                  key={material.materiau_id}
                  className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center justify-between"
                  onClick={() => handleSelect(material)}
                >
                  <div>
                    <div className="font-medium">
                      {material.nom || material.type_materiau}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {material.type_materiau}
                    </div>
                  </div>
                  {showStockStatus && material.stocks && (
                    <StockAlertBadge
                      level={
                        material.stocks.some((s: StockMateriau) => s.quantite_en_stock <= 0)
                          ? 'critical'
                          : material.stocks.some((s: StockMateriau) => s.quantite_en_stock <= s.seuil_alerte)
                          ? 'warning'
                          : 'normal'
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              Aucun résultat trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
} 