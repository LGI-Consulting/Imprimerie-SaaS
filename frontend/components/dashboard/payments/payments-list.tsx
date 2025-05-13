"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Paiement, PaiementsFilter, MethodePaiement, StatutPaiement, Facture } from "@/lib/api/types"
import { paiements } from "@/lib/api/paiements"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, FileText, RefreshCw, Loader2 } from "lucide-react"
import { ViewPaymentDialog } from "./view-payment-dialog"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { addDays, isWithinInterval } from "date-fns"
import { DateRange } from "react-day-picker"
import { generateAndDownloadReceiptPDF } from "@/lib/pdf/generate-payment-pdf"
import { toast } from "sonner"

type MethodePaiementFilter = MethodePaiement | "all"

interface PaymentWithFacture extends Paiement {
  facture: Facture;
}

export function PaymentsList() {
  const [allPayments, setAllPayments] = React.useState<PaymentWithFacture[]>([])
  const [filteredPayments, setFilteredPayments] = React.useState<PaymentWithFacture[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentWithFacture | null>(null)
  const [filters, setFilters] = React.useState<Omit<PaiementsFilter, 'methode'> & { methode?: MethodePaiementFilter }>({})

  // Fonction pour appliquer les filtres localement
  const applyFilters = React.useCallback(() => {
    let result = [...allPayments]

    // Filtre par méthode
    if (filters.methode && filters.methode !== "all") {
      result = result.filter(payment => payment.methode === filters.methode as MethodePaiement)
    }

    // Filtre par date
    if (filters.dateDebut || filters.dateFin) {
      result = result.filter(payment => {
        const paymentDate = new Date(payment.date_paiement)
        const start = filters.dateDebut ? new Date(filters.dateDebut) : new Date(0)
        const end = filters.dateFin ? new Date(filters.dateFin) : new Date()
        return isWithinInterval(paymentDate, { start, end })
      })
    }

    // Filtre par montant
    if (filters.montantMin !== undefined || filters.montantMax !== undefined) {
      result = result.filter(payment => {
        const amount = Number(payment.montant)
        const min = filters.montantMin !== undefined ? filters.montantMin : -Infinity
        const max = filters.montantMax !== undefined ? filters.montantMax : Infinity
        return amount >= min && amount <= max
      })
    }

    setFilteredPayments(result)
  }, [allPayments, filters])

  // Effet pour appliquer les filtres quand ils changent
  React.useEffect(() => {
    applyFilters()
  }, [filters, applyFilters])

  const fetchPayments = React.useCallback(async () => {
    try {
      setLoading(true);
      // Récupérer les paiements
      const response = await paiements.getPaginated(1, 1000);
      const paymentsData = response.payments;

      // Récupérer toutes les factures
      const factures = await paiements.getAllFactures();
      console.log("Factures:", factures);

      // Associer les factures aux paiements et ne garder que ceux qui ont une facture
      const paymentsWithFactures = paymentsData
        .map(payment => {
          const facture = factures.find(f => f.paiement_id === payment.paiement_id);
          if (facture) {
            return {
              ...payment,
              facture
            } as PaymentWithFacture;
          }
          return null;
        })
        .filter((payment): payment is PaymentWithFacture => payment !== null);

      setAllPayments(paymentsWithFactures);
      setFilteredPayments(paymentsWithFactures);
    } catch (error) {
      toast.error("Impossible de charger les paiements. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const columns: ColumnDef<PaymentWithFacture>[] = [
    {
      accessorKey: "paiement_id",
      header: "ID",
    },
    {
      accessorKey: "date_paiement",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date_paiement") as string
        return new Date(date).toLocaleDateString()
      },
    },
    {
      accessorKey: "montant",
      header: "Montant",
      cell: ({ row }) => {
        const amount = row.getValue("montant") as number
        return paiements.formatAmount(amount)
      },
    },
    {
      accessorKey: "methode",
      header: "Méthode",
      cell: ({ row }) => {
        const method = row.getValue("methode") as MethodePaiement
        return (
          <Badge variant="outline" className={getMethodColor(method)}>
            {paiements.getPaymentMethodLabel(method)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("statut") as StatutPaiement
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            {paiements.getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPayment(payment)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span>Voir</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={async (e) => {
                e.stopPropagation();
                
                try {
                  // Récupérer le paiement avec sa facture associée
                  const paymentWithInvoice = await paiements.getById(payment.paiement_id);
                  
                  if (!paymentWithInvoice.facture) {
                    toast.error("Aucune facture associée à ce paiement");
                    return;
                  }
                  
                  await generateAndDownloadReceiptPDF(
                    paymentWithInvoice.payment, 
                    paymentWithInvoice.facture
                  );
                  toast.success("Le ticket de caisse a été généré avec succès");
                } catch (error) {
                  console.error("Erreur lors de la génération du ticket de caisse:", error);
                  toast.error("Erreur lors de la génération du ticket de caisse");
                }
              }}
            >
              <FileText className="h-4 w-4" />
              <span>Ticket de caisse</span>
            </Button>
          </div>
        )
      },
    },
  ]

  const getMethodColor = (method: MethodePaiement) => {
    switch (method.toLowerCase()) {
      case "flooz":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "mixx":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "espèces":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStatusColor = (status: StatutPaiement) => {
    switch (status.toLowerCase()) {
      case "validé":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "en_attente":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "échoué":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const handleDateRangeChange = (range: DateRange | null) => {
    setFilters((prev) => ({
      ...prev,
      dateDebut: range?.from?.toISOString(),
      dateFin: range?.to?.toISOString(),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          value={filters.methode}
          onValueChange={(value: MethodePaiementFilter) =>
            setFilters((prev) => ({ ...prev, methode: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Méthode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les méthodes</SelectItem>
            <SelectItem value="espèces">Espèces</SelectItem>
            <SelectItem value="Flooz">Flooz</SelectItem>
            <SelectItem value="Mixx">Mixx</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          value={
            filters.dateDebut || filters.dateFin
              ? {
                  from: filters.dateDebut ? new Date(filters.dateDebut) : undefined,
                  to: filters.dateFin ? new Date(filters.dateFin) : undefined,
                }
              : null
          }
          onChange={handleDateRangeChange}
          className="w-full"
        />

        <div className="flex gap-2 w-full">
          <Input
            type="number"
            placeholder="Min"
            value={filters.montantMin || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                montantMin: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.montantMax || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                montantMax: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="w-full"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={fetchPayments}
            className="h-10 w-10"
            disabled={loading}
            title="Actualiser la liste"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        filterColumn="paiement_id"
      />

      {selectedPayment && (
        <ViewPaymentDialog
          open={!!selectedPayment}
          onOpenChange={(open) => !open && setSelectedPayment(null)}
          payment={selectedPayment}
          facture={selectedPayment.facture}
        />
      )}
    </div>
  )
} 
