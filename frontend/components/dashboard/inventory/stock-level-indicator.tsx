import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle, CheckCircle, BarChart2 } from "lucide-react";
import type { StockMateriauxLargeur } from "@/lib/api/types";
import { isLowStock, isOutOfStock, formatStockLength } from "@/lib/utils/stock-calculations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StockLevelIndicatorProps {
  stock: StockMateriauxLargeur;
  uniteMesure?: string;
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'bar' | 'badge';
}

export function StockLevelIndicator({
  stock,
  uniteMesure,
  className,
  showIcon = true,
  showLabel = true,
  showValue = false,
  size = 'md',
  variant = 'dot'
}: StockLevelIndicatorProps) {
  const isEmpty = isOutOfStock(stock);
  const isLow = isLowStock(stock);
  const unite = uniteMesure || stock.unite_mesure;

  const getStatus = () => {
    if (isEmpty) {
      return {
        label: 'Rupture',
        variant: 'destructive',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        icon: <XCircle className={getIconSize()} />
      };
    } else if (isLow) {
      return {
        label: 'Faible',
        variant: 'warning',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        icon: <AlertTriangle className={getIconSize()} />
      };
    } else {
      return {
        label: 'Normal',
        variant: 'success',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        icon: <CheckCircle className={getIconSize()} />
      };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const getDotSize = () => {
    switch (size) {
      case 'sm': return 'h-2 w-2';
      case 'lg': return 'h-4 w-4';
      default: return 'h-3 w-3';
    }
  };

  const getBarHeight = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const status = getStatus();
  const percentage = stock.seuil_alerte > 0 
    ? Math.min(100, (stock.longeur_en_stock / stock.seuil_alerte) * 100) 
    : 0;

  // Variante avec une barre de progression
  if (variant === 'bar') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("w-full space-y-1", className)}>
              <div className="flex items-center justify-between">
                {showLabel && (
                  <span className={cn("text-xs font-medium", status.textColor)}>
                    {status.label}
                  </span>
                )}
                {showValue && (
                  <span className="text-xs">
                    {formatStockLength(stock.longeur_en_stock, unite)}
                  </span>
                )}
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn("absolute left-0 top-0 transition-all", getBarHeight(), status.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p>Stock: {formatStockLength(stock.longeur_en_stock, unite)}</p>
              <p>Seuil: {formatStockLength(stock.seuil_alerte, unite)}</p>
              <p>Largeur: {stock.largeur} cm</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante avec un badge
  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                isEmpty ? "bg-red-100 text-red-800" : isLow ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800",
                className
              )}
            >
              {showIcon && status.icon}
              {showValue && formatStockLength(stock.longeur_en_stock, unite)}
              {showLabel && status.label}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p>Stock: {formatStockLength(stock.longeur_en_stock, unite)}</p>
              <p>Seuil: {formatStockLength(stock.seuil_alerte, unite)}</p>
              <p>Largeur: {stock.largeur} cm</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante par défaut avec un point coloré
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className={cn(
              "rounded-full",
              getDotSize(),
              status.color,
              "transition-colors duration-200"
            )} />
            {showLabel && (
              <span className={cn(
                "text-sm font-medium",
                status.textColor
              )}>
                {status.label}
              </span>
            )}
            {showIcon && status.icon}
            {showValue && (
              <span className="text-sm">
                {formatStockLength(stock.longeur_en_stock, unite)}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p>Stock: {formatStockLength(stock.longeur_en_stock, unite)}</p>
            <p>Seuil: {formatStockLength(stock.seuil_alerte, unite)}</p>
            <p>Largeur: {stock.largeur} cm</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 