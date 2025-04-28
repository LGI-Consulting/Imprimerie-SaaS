"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Paiement, PaiementsFilter, MethodePaiement, StatutPaiement, Facture } from "@/lib/api/types"
import { paiements } from "@/lib/api/paiements"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { ViewPaymentDialog } from "./view-payment-dialog"
import { DownloadPDFButton } from "@/components/ui/download-pdf-button"
import { useToast } from "@/components/ui/use-toast"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"

interface PaymentWithFacture extends Paiement {
  facture: Facture;
}

export function PaymentsList() {
  const [payments, setPayments] = React.useState<PaymentWithFacture[]>([])
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentWithFacture | null>(null)
  const [filters, setFilters] = React.useState<PaiementsFilter>({})
  const { toast } = useToast()

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
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPayment(payment)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DownloadPDFButton
              paiement={payment}
              facture={payment.facture}
              variant="ghost"
              size="icon"
            />
          </div>
        )
      },
    },
  ]

  const fetchPayments = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await paiements.getPaginated(page, pageSize, filters)
      setPayments(response.payments as PaymentWithFacture[])
      setTotal(response.total)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paiements. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters, toast])

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

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
      startDate: range?.from?.toISOString(),
      endDate: range?.to?.toISOString(),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value as StatutPaiement }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="validé">Validé</SelectItem>
            <SelectItem value="échoué">Échoué</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.method}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, method: value as MethodePaiement }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Méthode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les méthodes</SelectItem>
            <SelectItem value="espèces">Espèces</SelectItem>
            <SelectItem value="flooz">Flooz</SelectItem>
            <SelectItem value="mixx">Mixx</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          value={
            filters.startDate || filters.endDate
              ? {
                  from: filters.startDate ? new Date(filters.startDate) : undefined,
                  to: filters.endDate ? new Date(filters.endDate) : undefined,
                }
              : null
          }
          onChange={handleDateRangeChange}
        />

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minAmount || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minAmount: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="w-[120px]"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxAmount || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxAmount: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="w-[120px]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        filterColumn="paiement_id"
        onRowClick={(row) => setSelectedPayment(row)}
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