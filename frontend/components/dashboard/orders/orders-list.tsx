"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye, MoreHorizontal, FileText, Trash2, Edit2, Printer, Percent, Euro } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

import { commandes, CommandeFilters, CommandesResponse } from "@/lib/api/commandes"
import { clients } from "@/lib/api/client"
import { formatCurrency } from "@/lib/api/utils"
import { Commande, StatutCommande, Client, DetailCommande, Remise, TypeRemise } from "@/lib/api/types"
import { ViewOrderDialog } from "./view-order-dialog"
import { AddOrderDialog } from "./add-order-dialog"
import { useNotificationStore } from "@/lib/store/notifications"

interface OrdersListProps {
  userRole?: string
  onFileReject?: (orderId: number, fileName: string) => void
  onStatusChange?: (orderId: number, newStatus: string) => void
}

// Définir une interface pour la commande avec détails
interface CommandeWithDetails extends Omit<Commande, 'remise'> {
  client: Client;
  details: DetailCommande[];
  remise?: {
    type: TypeRemise;
    valeur: number;
    code?: string;
    montant_applique: number;
  };
}

const ITEMS_PER_PAGE = 10
const STATUS_OPTIONS: { value: StatutCommande; label: string }[] = [
  { value: "reçue", label: "Reçue" },
  { value: "payée", label: "Payée" },
  { value: "en_impression", label: "En impression" },
  { value: "terminée", label: "Terminée" },
  { value: "livrée", label: "Livrée" },
]

export function OrdersList({ 
  userRole = "user",
  onFileReject,
  onStatusChange
}: OrdersListProps) {
  const router = useRouter()
  const { addNotification } = useNotificationStore()
  const [orders, setOrders] = useState<CommandeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<CommandeWithDetails | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<CommandeFilters>({
    startDate: undefined,
    endDate: undefined,
    statut: userRole === "graphiste" ? "payée" : undefined,
    client_id: undefined,
    materiau_id: undefined,
    sortBy: "date_creation",
    sortOrder: "desc",
    code_remise: undefined
  })

  // Charger les commandes
  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      // Convertir les filtres étendus en filtres standard pour l'API
      const apiFilters: CommandeFilters = {
        ...filters,
        // Exclure code_remise des filtres envoyés à l'API
        code_remise: undefined
      }
      
      const response = await commandes.getAll()
      let commandesData = response as unknown as (Commande & { client: Client })[]
      
      // Si l'utilisateur est un graphiste, filtrer pour n'afficher que les commandes payées
      if (userRole === "graphiste") {
        commandesData = commandesData.filter(cmd => cmd.statut === "payée")
      }
      
      // Filtrer par code de remise côté client si nécessaire
      let filteredData = commandesData
      if (filters.code_remise) {
        filteredData = commandesData.filter(cmd => 
          cmd.remise && cmd.remise.code === filters.code_remise
        )
      }
      
      filteredData && setOrders(filteredData.map(cmd => ({
        ...cmd,
        details: [], // Les détails seront chargés lors de l'ouverture du dialog
        remise: cmd.remise
      })))
      filteredData && setTotalPages(Math.ceil(filteredData.length / ITEMS_PER_PAGE))
    } catch (err) {
      console.error("Erreur lors du chargement des commandes:", err)
      setError("Impossible de charger les commandes")
      toast.error("Erreur lors du chargement des commandes")
    } finally {
      setLoading(false)
    }
  }, [filters, userRole])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Gérer les filtres
  const handleFilterChange = (key: keyof CommandeFilters, value: string | number | undefined) => {
    // Si l'utilisateur est un graphiste, ne pas permettre de changer le filtre de statut
    if (userRole === "graphiste" && key === "statut") {
      return
    }
    
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Réinitialiser la pagination
  }

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Gérer les actions
  const handleViewOrder = (order: CommandeWithDetails) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleEditOrder = (order: CommandeWithDetails) => {
    router.push(`/dashboard/orders/${order.commande_id}/edit`)
  }

  const handleDeleteOrder = async (order: CommandeWithDetails) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      return
    }

    try {
      await commandes.delete(order.commande_id)
      toast.success("Commande supprimée avec succès")
      
      // Ajouter une notification pour la suppression
      addNotification(
        "order_complete",
        {
          orderId: order.commande_id.toString(),
          orderNumber: order.numero_commande,
          clientName: `${order.client.prenom} ${order.client.nom}`
        },
        "accueil",
        "caisse"
      )
      
      loadOrders()
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      toast.error("Erreur lors de la suppression de la commande")
    }
  }

  const handleExportPDF = async (order: CommandeWithDetails) => {
    try {
      // Implémenter l'export PDF
      toast.success("PDF généré avec succès")
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err)
      toast.error("Erreur lors de la génération du PDF")
    }
  }

  // Rendu du statut
  const renderStatus = (status: StatutCommande) => {
    const statusConfig: Record<StatutCommande, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
      reçue: { label: "Reçue", variant: "default" },
      payée: { label: "Payée", variant: "secondary" },
      en_impression: { label: "En impression", variant: "outline" },
      terminée: { label: "Terminée", variant: "secondary" },
      livrée: { label: "Livrée", variant: "secondary" },
      annulée: { label: "Annulée", variant: "destructive" }
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Calculer le sous-total d'une commande
  const calculateSubtotal = (details: DetailCommande[]) => {
    return details.reduce((total, detail) => {
      return total + (detail.quantite * detail.prix_unitaire)
    }, 0)
  }

  // Calculer la remise d'une commande
  const calculateDiscount = (order: CommandeWithDetails) => {
    if (!order.remise || !order.details.length) return 0
    
    const subtotal = calculateSubtotal(order.details)
    
    if (order.remise.type === 'pourcentage') {
      return (subtotal * order.remise.valeur) / 100
    } else {
      return Math.min(subtotal, order.remise.valeur)
    }
  }

  // Calculer le total d'une commande après remise
  const calculateTotal = (order: CommandeWithDetails) => {
    const subtotal = calculateSubtotal(order.details)
    const discount = calculateDiscount(order)
    return subtotal - discount
  }

  // Rendu de la remise
  const renderRemise = (order: CommandeWithDetails) => {
    if (!order.remise) return null

    return (
      <div className="flex items-center gap-1 text-green-600">
        {order.remise.type === 'pourcentage' ? (
          <Percent className="h-4 w-4" />
        ) : (
          <Euro className="h-4 w-4" />
        )}
        <span>-{formatCurrency(calculateDiscount(order))}</span>
        <Badge variant="outline" className="ml-1 text-xs">
          {order.remise.code}
        </Badge>
      </div>
    )
  }

  // Rendre les actions en fonction du rôle
  const renderActions = (order: CommandeWithDetails) => {
    const actions = [
      {
        label: "Voir",
        icon: Eye,
        onClick: () => handleViewOrder(order)
      }
    ]

    // Les admins et l'accueil peuvent modifier
    if (userRole === "admin" || userRole === "accueil") {
      actions.push({
        label: "Modifier",
        icon: Edit2,
        onClick: () => handleEditOrder(order)
      })
    }

    // Seuls les admins peuvent supprimer
    if (userRole === "admin") {
      actions.push({
        label: "Supprimer",
        icon: Trash2,
        onClick: () => handleDeleteOrder(order)
      })
    }

    // Tout le monde peut exporter en PDF
    actions.push({
      label: "Exporter en PDF",
      icon: FileText,
      onClick: () => handleExportPDF(order)
    })

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const handleFileReject = (orderId: number, fileName: string) => {
    if (onFileReject) {
      onFileReject(orderId, fileName)
    }
  }

  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(orderId, newStatus)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtres - Masquer le filtre de statut pour les graphistes */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="ID Client"
            type="number"
            value={filters.client_id || ""}
            onChange={(e) => handleFilterChange("client_id", e.target.value ? Number(e.target.value) : undefined)}
            className="max-w-sm"
          />
          {userRole !== "graphiste" && (
            <Select
              value={filters.statut || ""}
              onValueChange={(value) => handleFilterChange("statut", value || undefined)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            placeholder="Code de remise"
            value={filters.code_remise || ""}
            onChange={(e) => handleFilterChange("code_remise", e.target.value || undefined)}
            className="max-w-sm"
          />
        </div>
        {(userRole === "admin" || userRole === "accueil") && (
          <Button onClick={() => setAddDialogOpen(true)}>
            Nouvelle commande
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Sous-total</TableHead>
              <TableHead className="text-right">Remise</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // État de chargement
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              // État d'erreur
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {error}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              // État vide
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            ) : (
              // Données
              orders.map((order) => (
                <TableRow key={order.commande_id}>
                  <TableCell>{order.numero_commande}</TableCell>
                  <TableCell>{clients.getFullName(order.client)}</TableCell>
                  <TableCell>
                    {format(new Date(order.date_creation), "dd MMMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>{renderStatus(order.statut)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateSubtotal(order.details))}
                  </TableCell>
                  <TableCell className="text-right">
                    {renderRemise(order)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(calculateTotal(order))}
                  </TableCell>
                  <TableCell>
                    {renderActions(order)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && !error && orders.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogs */}
      {selectedOrder && (
        <ViewOrderDialog
          order={{
            ...selectedOrder,
            details: selectedOrder.details,
            clientInfo: {
              prenom: selectedOrder.client.prenom,
              nom: selectedOrder.client.nom,
              telephone: selectedOrder.client.telephone,
              email: selectedOrder.client.email || undefined,
              adresse: selectedOrder.client.adresse || undefined
            },
            created_at: selectedOrder.date_creation,
            id: selectedOrder.commande_id,
            remise: selectedOrder.remise ? {
              type: selectedOrder.remise.type,
              valeur: selectedOrder.remise.valeur,
              code: selectedOrder.remise.code || undefined,
              montant_applique: calculateDiscount(selectedOrder)
            } : undefined
          }}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
      <AddOrderDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          loadOrders()
          setAddDialogOpen(false)
        }}
      />
    </div>
  )
}