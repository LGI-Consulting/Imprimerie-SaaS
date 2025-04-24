import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface StockLevelIndicatorProps {
  quantity: number;
  threshold: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StockLevelIndicator({
  quantity,
  threshold,
  className,
  showIcon = true,
  size = 'md'
}: StockLevelIndicatorProps) {
  const getStatus = () => {
    if (quantity <= 0) {
      return {
        label: 'Rupture',
        variant: 'destructive',
        color: 'bg-red-500'
      };
    } else if (quantity <= threshold) {
      return {
        label: 'Faible',
        variant: 'warning',
        color: 'bg-yellow-500'
      };
    } else {
      return {
        label: 'Normal',
        variant: 'success',
        color: 'bg-green-500'
      };
    }
  };

  const status = getStatus();
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-full",
        sizeClasses[size],
        status.color,
        "transition-colors duration-200"
      )} />
      <span className={cn(
        "text-sm font-medium",
        status.variant === 'destructive' && "text-red-600",
        status.variant === 'warning' && "text-yellow-600",
        status.variant === 'success' && "text-green-600"
      )}>
        {status.label}
      </span>
      {showIcon && status.variant === 'warning' && (
        <AlertTriangle className={cn(
          "text-yellow-500",
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      )}
    </div>
  );
} 