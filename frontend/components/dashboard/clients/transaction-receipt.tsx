"use client"

import { forwardRef, useRef, MouseEvent } from "react"
import { useReactToPrint } from "react-to-print"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Printer, Download, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction } from "@/lib/api/client"
import { Client } from "@/lib/api/types"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface TransactionReceiptProps {
  transaction: Transaction
  client: Client
  onClose?: () => void
}

export function TransactionReceipt({ transaction, client, onClose }: TransactionReceiptProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Configuration pour l'impression
  const handlePrint = useReactToPrint({
    documentTitle: `Reçu-${transaction.transaction_id}`,
    contentRef: componentRef,
    // Amélioration de la qualité du PDF
    print: async (printIframe) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByTagName('html')[0];
        html.dataset.printJs = 'true';
        await new Promise((resolve) => {
          setTimeout(() => {
            window.print();
            resolve(null);
          }, 500);
        });
      }
    },
  })

  // Configuration pour le PDF
  const handleDownloadPDF = useReactToPrint({
    documentTitle: `Reçu-${transaction.transaction_id}`,
    contentRef: componentRef,
    print: async (printIframe) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByTagName('html')[0];
        html.dataset.printJs = 'true';
        await new Promise((resolve) => {
          setTimeout(() => {
            window.print();
            resolve(null);
          }, 500);
        });
      }
    },
    onAfterPrint: () => {
      toast.success("PDF généré et téléchargé avec succès");
    },
  })

  return (
    <div className="space-y-4">
      <div ref={componentRef} className="bg-white p-6 rounded-lg shadow-sm">
        <ReceiptContent transaction={transaction} client={client} />
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (handlePrint) {
                handlePrint()
              }
            }}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (handleDownloadPDF) {
                handleDownloadPDF()
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              alert("Fonctionnalité de partage à venir !")
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>
        <Button variant="default" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}

const ReceiptContent = forwardRef<HTMLDivElement, { transaction: Transaction; client: Client }>(
  ({ transaction, client }, ref) => {
    // Fonction pour formater un montant en FCFA
    const formatAmount = (amount: number | string) => {
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
      return numericAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' FCFA'
    }

    // Fonction pour formater la date
    const formatDate = (dateStr: string) => {
      return format(new Date(dateStr), "dd MMMM yyyy à HH:mm", { locale: fr })
    }

    // Déterminer le type de transaction pour l'affichage
    const getTransactionType = (type: string) => {
      switch (type) {
        case "depot": return "Dépôt"
        case "retrait": return "Retrait"
        case "imputation_dette": return "Imputation dette"
        case "paiement_dette": return "Paiement dette"
        default: return type
      }
    }

    // Déterminer si c'est un crédit ou un débit
    const isCredit = transaction.type_transaction === "depot" || transaction.type_transaction === "paiement_dette"
    
    return (
      <div ref={ref} className="min-w-[380px] max-w-[500px] mx-auto print:shadow-none print:p-0">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">IMPRIMERIE LGI</h1>
          <p className="text-sm text-muted-foreground">
            Agbalépédogan, non loin du CEG
            <br />
            Tél: +228 90 90 90 90
          </p>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">Reçu de Transaction</h2>
          <p className="text-sm">N° {transaction.transaction_id.toString().padStart(6, "0")}</p>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{formatDate(transaction.date_transaction)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Client:</span>
            <span>{client.prenom} {client.nom}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">ID Client:</span>
            <span>CLT-{client.client_id.toString().padStart(4, "0")}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="font-medium">Type:</span>
            <Badge variant={isCredit ? "default" : "secondary"}>
              {getTransactionType(transaction.type_transaction)}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Montant:</span>
            <span className="font-semibold">{formatAmount(transaction.montant)}</span>
          </div>

          {transaction.commentaire && (
            <div className="flex flex-col gap-2">
              <span className="font-medium">Commentaire:</span>
              <p className="text-sm bg-muted p-2 rounded">{transaction.commentaire}</p>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="font-medium">Solde avant:</span>
            <span>{formatAmount(transaction.solde_avant)}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Solde après:</span>
            <span>{formatAmount(transaction.solde_apres)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>Merci de votre confiance!</p>
          <p className="mt-1">Ce reçu a été généré électroniquement et ne nécessite pas de signature.</p>
          <p className="mt-4 text-[10px]">Imprimerie LGI - RCCM: TG-LOM-01-2022-B13-00099 - NIF: 1001595341</p>
        </div>
      </div>
    )
  }
)

ReceiptContent.displayName = "ReceiptContent" 
