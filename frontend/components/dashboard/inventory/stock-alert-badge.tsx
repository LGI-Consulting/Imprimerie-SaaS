import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertLevel = 'critical' | 'warning' | 'normal';

interface StockAlertBadgeProps {
  level: AlertLevel;
  message?: string;
  className?: string;
  showIcon?: boolean;
}

export function StockAlertBadge({
  level,
  message,
  className,
  showIcon = true
}: StockAlertBadgeProps) {
  const getAlertConfig = () => {
    switch (level) {
      case 'critical':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          defaultMessage: 'Stock critique'
        };
      case 'warning':
        return {
          variant: 'secondary' as const,
          icon: AlertTriangle,
          defaultMessage: 'Stock faible'
        };
      case 'normal':
        return {
          variant: 'default' as const,
          icon: CheckCircle2,
          defaultMessage: 'Stock normal'
        };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn("flex items-center gap-1", className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {message || config.defaultMessage}
    </Badge>
  );
} 