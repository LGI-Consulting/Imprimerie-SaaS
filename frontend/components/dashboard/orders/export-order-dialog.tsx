
"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Printer } from "lucide-react"

import { Commande, Client, DetailCommande, PrintFile, Materiau } from "@/lib/api/types"
import { 
  generateAndDownloadOrderPDF, 
  generateAndPrintOrderPDF, 
  CommandeWithDetails 
} from "@/lib/pdf/generate-order-pdf"
import { Dimensions } from "@/lib/pdf/types"

// Interface pour les détails de commande avec matériau
interface DetailCommandeWithMateriau extends DetailCommande {
  materiau?: {
    materiau_id: number;
    type_materiau: string;
    nom?: string;
  };
}

interface ExportOrderDialogProps {
  order: Commande & {
    client: Client;
    details: DetailCommande[];
    files?: PrintFile[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportOrderDialog({
  order,
  open,
  onOpenChange
}: ExportOrderDialogProps) {
  const [format, setFormat] = useState<'A4' | 'A5'>('A4')
  const [isExporting, setIsExporting] = useState(false)
  const [action, setAction] = useState<'print' | 'download'>('print')

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Adapter l'objet order pour qu'il soit compatible avec CommandeWithDetails
      const adaptedOrder = {
        ...order,
        details: order.details.map(detail => {
          // Créer un objet materiau si nécessaire
          const materiau = {
            materiau_id: detail.materiau_id,
            type_materiau: ""
          };
          
          return {
            ...detail,
            // Convertir les dimensions pour qu'elles soient compatibles
            dimensions: detail.dimensions as string | Dimensions | undefined,
            // Ajouter materiau
            materiau: materiau
          };
        })
      } as CommandeWithDetails;
      
      if (action === 'print') {
        // Utiliser la fonction d'impression qui ouvre la boîte de dialogue d'impression
        await generateAndPrintOrderPDF(adaptedOrder, format)
        toast.success("Facture envoyée à l'impression")
      } else {
        // Utiliser la fonction de téléchargement
        await generateAndDownloadOrderPDF(adaptedOrder, format)
        toast.success("Facture téléchargée avec succès")
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast.error(`Erreur lors de la ${action === 'print' ? 'génération' : 'téléchargement'} de la facture`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exporter la facture</DialogTitle>
          <DialogDescription>
            Choisissez le format et l'action pour la facture de la commande {order.numero_commande}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as 'A4' | 'A5')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Action
            </Label>
            <div className="col-span-3 flex gap-2">
              <Button 
                type="button" 
                variant={action === 'print' ? 'default' : 'outline'} 
                onClick={() => setAction('print')}
                className="flex-1"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
              <Button 
                type="button" 
                variant={action === 'download' ? 'default' : 'outline'} 
                onClick={() => setAction('download')}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {action === 'print' ? 'Impression...' : 'Téléchargement...'}
              </>
            ) : (
              action === 'print' ? 'Imprimer la facture' : 'Télécharger la facture'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
