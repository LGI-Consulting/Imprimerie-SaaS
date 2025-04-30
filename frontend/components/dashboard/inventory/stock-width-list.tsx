"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { StockMateriauxLargeur } from "@/lib/api/types"
import { 
  isLowStock, 
  isOutOfStock, 
  formatStockLength, 
  calculateStockSurface,
  formatSurfaceDisplay 
} from "@/lib/utils/stock-calculations"

interface StockWidthListProps {
  stocks: StockMateriauxLargeur[]
  uniteMateriaux: string
  prixUnitaire: number
  displayFormat?: "table" | "badges" | "compact"
  showSurface?: boolean
}

export function StockWidthList({
  stocks,
  uniteMateriaux,
  prixUnitaire,
  displayFormat = "table",
  showSurface = false,
}: StockWidthListProps) {
  if (!stocks || stocks.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun stock disponible</p>
  }

  const sortedStocks = [...stocks].sort((a, b) => a.largeur - b.largeur)
  
  // Créer un objet matériau fictif pour les calculs
  const tempMateriau = {
    unite_mesure: uniteMateriaux,
    prix_unitaire: prixUnitaire
  };

  if (displayFormat === "badges") {
    return (
      <div className="flex flex-wrap gap-2">
        {sortedStocks.map((stock) => {
          const isLow = isLowStock(stock)
          const isEmpty = isOutOfStock(stock)
          
          return (
            <TooltipProvider key={stock.stock_id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={isEmpty ? "destructive" : isLow ? "outline" : "default"}
                    className={isLow && !isEmpty ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
                  >
                    {stock.largeur} cm: {formatStockLength(stock.longeur_en_stock, uniteMateriaux)}
                    {isEmpty && <XCircle className="ml-1 h-3 w-3" />}
                    {isLow && !isEmpty && <AlertTriangle className="ml-1 h-3 w-3" />}
                    {!isLow && !isEmpty && <CheckCircle className="ml-1 h-3 w-3" />}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Seuil d'alerte: {formatStockLength(stock.seuil_alerte, uniteMateriaux)}</p>
                  {showSurface && (
                    <p>Surface: {formatSurfaceDisplay(tempMateriau as any, calculateStockSurface(stock, uniteMateriaux))}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  if (displayFormat === "compact") {
    return (
      <ul className="space-y-1 text-sm">
        {sortedStocks.map((stock) => {
          const isLow = isLowStock(stock)
          const isEmpty = isOutOfStock(stock)
          const statusColor = isEmpty ? "text-red-500" : isLow ? "text-yellow-500" : "text-green-500"
          
          return (
            <li key={stock.stock_id} className="flex items-center justify-between">
              <span>{stock.largeur} cm</span>
              <span className={statusColor}>
                {formatStockLength(stock.longeur_en_stock, uniteMateriaux)}
                {isEmpty && <XCircle className="ml-1 inline h-3 w-3" />}
                {isLow && !isEmpty && <AlertTriangle className="ml-1 inline h-3 w-3" />}
                {!isLow && !isEmpty && <CheckCircle className="ml-1 inline h-3 w-3" />}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  // Default: table format
  return (
    <Table className="border rounded-md">
      <TableHeader>
        <TableRow>
          <TableHead>Largeur</TableHead>
          <TableHead>Stock disponible</TableHead>
          <TableHead>Seuil d'alerte</TableHead>
          {showSurface && <TableHead>Surface équivalente</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedStocks.map((stock) => {
          const isLow = isLowStock(stock)
          const isEmpty = isOutOfStock(stock)
          const statusColor = isEmpty ? "text-red-500" : isLow ? "text-yellow-500" : "text-green-500"
          
          return (
            <TableRow key={stock.stock_id}>
              <TableCell>{stock.largeur} cm</TableCell>
              <TableCell className={statusColor}>
                {formatStockLength(stock.longeur_en_stock, uniteMateriaux)}
                {isEmpty && <XCircle className="ml-1 inline h-4 w-4" />}
                {isLow && !isEmpty && <AlertTriangle className="ml-1 inline h-4 w-4" />}
              </TableCell>
              <TableCell>{formatStockLength(stock.seuil_alerte, uniteMateriaux)}</TableCell>
              {showSurface && (
                <TableCell>
                  {formatSurfaceDisplay(tempMateriau as any, calculateStockSurface(stock, uniteMateriaux))}
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
} 