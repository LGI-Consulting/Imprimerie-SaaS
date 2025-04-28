"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Package, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import materiaux from "@/lib/api/materiaux"
import type { Material } from "@/lib/api/types"

interface MaterialSearchProps {
  onSelect: (material: Material) => void
  className?: string
  placeholder?: string
  showStockStatus?: boolean
}

export function MaterialSearch({
  onSelect,
  className,
  placeholder = "Rechercher un matériau...",
  showStockStatus = true
}: MaterialSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchMaterials = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      try {
        setLoading(true)
        const searchResults = await materiaux.search(query)
        setResults(searchResults.slice(0, 5)) // Limiter à 5 résultats
      } catch (error) {
        console.error("Erreur de recherche:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchMaterials, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const hasLowStock = (material: Material) => {
    return material.stocks.some(stock => stock.quantite_en_stock <= stock.seuil_alerte)
  }

  const getTotalStock = (material: Material) => {
    return material.stocks.reduce((total, stock) => total + stock.quantite_en_stock, 0)
  }

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          className="pl-8"
        />
      </div>
      
      {showResults && (results.length > 0 || loading) && (
        <div className="absolute mt-2 w-full rounded-md border bg-popover shadow-md">
          <ScrollArea className="h-[300px] rounded-md bg-popover p-1">
            {loading ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                Recherche en cours...
              </div>
            ) : (
              results.map((material) => (
                <div
                  key={material.materiau_id}
                  className="flex items-center justify-between rounded-sm px-2 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => {
                    onSelect(material)
                    setShowResults(false)
                    setQuery("")
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{material.type_materiau}</div>
                    {material.description && (
                      <div className="text-xs text-muted-foreground">
                        {material.description}
                      </div>
                    )}
                  </div>
                  {showStockStatus && (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={hasLowStock(material) ? "secondary" : "default"}
                        className={cn(
                          hasLowStock(material) && "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {getTotalStock(material)} {material.unite_mesure}
                        {hasLowStock(material) && (
                          <AlertTriangle className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    </div>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}