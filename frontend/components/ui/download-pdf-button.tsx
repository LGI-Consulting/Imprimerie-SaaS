"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { useToast } from "./use-toast";
import { generateAndDownloadReceiptPDF } from "@/lib/pdf/generate-payment-pdf";
import { Paiement, Facture } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface DownloadPDFButtonProps extends React.PropsWithChildren {
  paiement: Paiement;
  facture?: Facture;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
}

export const DownloadPDFButton = React.forwardRef<HTMLButtonElement, DownloadPDFButtonProps>(
  (
    {
      paiement,
      facture,
      className,
      variant = "default",
      size = "default",
      disabled = false,
      onSuccess,
      onError,
      retryCount = 3,
      retryDelay = 1000,
      children,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);
    const [retryAttempt, setRetryAttempt] = React.useState(0);
    const { toast } = useToast();

    const handleDownload = React.useCallback(async () => {
      if (isLoading || !facture) return;

      setIsLoading(true);
      setError(null);

      try {
        await generateAndDownloadReceiptPDF(paiement, facture);
        toast({
          title: "Succès",
          description: "Le ticket de caisse a été téléchargé avec succès.",
        });
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Une erreur est survenue");
        setError(error);
        onError?.(error);

        // Tentative de nouvelle génération si le nombre de tentatives n'est pas atteint
        if (retryAttempt < retryCount) {
          toast({
            title: "Erreur",
            description: "Impossible de générer le ticket. Nouvelle tentative...",
            variant: "destructive",
          });
          
          setTimeout(() => {
            setRetryAttempt((prev) => prev + 1);
            handleDownload();
          }, retryDelay);
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de générer le ticket après plusieurs tentatives. Veuillez réessayer plus tard.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }, [paiement, facture, isLoading, retryAttempt, retryCount, retryDelay, toast, onSuccess, onError]);

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        disabled={disabled || isLoading || !facture}
        onClick={handleDownload}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {children || "Télécharger le ticket"}
      </Button>
    );
  }
);

DownloadPDFButton.displayName = "DownloadPDFButton"; 