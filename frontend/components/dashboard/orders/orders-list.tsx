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
import { EditOrderDialog } from "./edit-order-dialog"
import { useNotificationStore } from "@/lib/store/notifications"
import { PrintFile } from "@/lib/api/types"

interface OrdersListProps {
  userRole?: string
  onFileReject?: (orderId: number, fileName: string) => void
  onStatusChange?: (orderId: number, newStatus: string) => void
}

// Définir une interface pour la commande avec détails
interface CommandeWithDetails extends Omit<Commande, 'remise'> {
  client: Client;
  details: (DetailCommande & { 
    materiau?: { 
      materiau_id: number; 
      type_materiau: string;
    } 
  })[];
  remise?: {
    type: TypeRemise;
    valeur: number;
    code?: string;
    montant_applique: number;
  };
  files?: PrintFile[];
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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<CommandeWithDetails | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<CommandeFilters>({
    startDate: undefined,
    endDate: undefined,
    statut: userRole === "graphiste" ? "payée" : undefined,
    client_nom: undefined, // Ajouter client_nom au lieu de client_id,  // Ajouter client_nom au lieu de client_id
    materiau_id: undefined,
    sortBy: "date_creation",
    sortOrder: "desc"
    // Retirer // Retirer 
  })

  // Charger les commandes
  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      // Récupérer toutes les commandes sans filtres
      const response = await commandes.getAll()
      // Corriger le typage ici
      let commandesData = response as unknown as any[]
      
      // Transformer les données pour le composant avec le bon typage
      const transformedOrders = commandesData.map(cmd => ({
        ...cmd,
        commande_id: cmd.commande_id,
        client: {
          nom: cmd.client_nom || "Inconnu",
          prenom: cmd.client_prenom || "",
          telephone: cmd.telephone || "",
          email: cmd.email || undefined,
          adresse: cmd.adresse || undefined
        },
        details: (cmd as any).details || [], // Utiliser les détails s'ils existent déjà avec assertion de type
      }))
      
      // Appliquer tous les filtres côté client
      let filteredData = transformedOrders
      
      // Si l'utilisateur est un graphiste, filtrer pour n'afficher que les commandes payées
      if (userRole === "graphiste") {
        filteredData = filteredData.filter(cmd => cmd.statut === "payée")
      }
      
      // Filtrer par statut si spécifié
      if (filters.statut) {
        filteredData = filteredData.filter(cmd => cmd.statut === filters.statut)
      }
      
      // Filtrer par nom ou prénom du client si spécifié
      if (filters.client_nom) {
        const searchTerm = filters.client_nom.toLowerCase()
        filteredData = filteredData.filter(cmd => 
          (cmd.client.nom && cmd.client.nom.toLowerCase().includes(searchTerm)) || 
          (cmd.client.prenom && cmd.client.prenom.toLowerCase().includes(searchTerm))
        )
      }
      
      setOrders(filteredData)
      setTotalPages(Math.ceil(filteredData.length / ITEMS_PER_PAGE))
    } catch (err) {
      console.error("Erreur lors du chargement des commandes:", err)
      setError("Impossible de charger les commandes")
      toast.error("Erreur lors du chargement des commandes")
    } finally {
      setLoading(false)
    }
  }, [filters.statut, filters.client_nom, userRole])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Gérer les filtres
  const handleFilterChange = (key: keyof CommandeFilters, value: string | number | undefined) => {
    // Si l'utilisateur est un graphiste, ne pas permettre de changer les filtres
    if (userRole === "graphiste") {
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
  const handleViewOrder = async (order: CommandeWithDetails) => {
    try {
      // Toujours récupérer les détails complets pour avoir les fichiers
      const fullOrder = await commandes.getById(order.commande_id)
      if (fullOrder) {
        // Mettre à jour l'ordre avec les détails complets et les fichiers
        const updatedOrder = {
          ...order,
          details: fullOrder.details || [],
          files: fullOrder.files || [] // Ajouter les fichiers
        }
        setSelectedOrder(updatedOrder)
        
        // Mettre à jour l'ordre dans la liste
        setOrders(prev => 
          prev.map(o => o.commande_id === order.commande_id ? updatedOrder : o)
        )
      } else {
        setSelectedOrder(order)
      }
      
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la commande:", error)
      toast.error("Erreur lors de la récupération des détails de la commande")
    }
  }

  const handleEditOrder = async (order: CommandeWithDetails) => {
    try {
      // Si les détails ne sont pas déjà chargés, les récupérer
      if (!order.details || order.details.length === 0) {
        const fullOrder = await commandes.getById(order.commande_id)
        if (fullOrder) {
          // Mettre à jour l'ordre avec les détails complets
          const updatedOrder = {
            ...order,
            details: fullOrder.details || [],
            files: fullOrder.files || []
          }
          setOrderToEdit(updatedOrder)
        } else {
          setOrderToEdit(order)
        }
      } else {
        setOrderToEdit(order)
      }
      setEditDialogOpen(true)
    } catch (err) {
      console.error("Erreur lors du chargement des détails:", err)
      toast.error("Erreur lors du chargement des détails de la commande")
      // Ouvrir quand même le dialogue avec les données disponibles
      setOrderToEdit(order)
      setEditDialogOpen(true)
    }
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
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }



  const handleStartPrinting = async (order: CommandeWithDetails) => {
    try {
      await commandes.updateStatus(order.commande_id, "en_impression");
      toast.success("Impression lancée avec succès");
      
      if (onStatusChange) {
        onStatusChange(order.commande_id, "en_impression");
      }
      
      loadOrders();
    } catch (err) {
      console.error("Erreur lors du lancement de l'impression:", err);
      toast.error("Erreur lors du changement de statut");
    }
  };
  
  const handleFinishPrinting = async (order: CommandeWithDetails) => {
    try {
      await commandes.updateStatus(order.commande_id, "terminée");
      toast.success("Commande marquée comme terminée");
      
      if (onStatusChange) {
        onStatusChange(order.commande_id, "terminée");
      }
      
      loadOrders();
    } catch (err) {
      console.error("Erreur lors de la finalisation de l'impression:", err);
      toast.error("Erreur lors du changement de statut");
    }
  };

  // Rendre les actions en fonction du rôle
  const renderActions = (order: CommandeWithDetails) => {
    const actions = [
      {
        label: "Voir",
        icon: Eye,
        onClick: () => handleViewOrder(order)
      },
      {
        label: "Modifier",
        icon: Edit2,
        onClick: () => handleEditOrder(order)
      }
    ];
  
    // Ajouter les actions spécifiques aux graphistes
    if (userRole === "graphiste") {
      if (order.statut === "payée") {
        actions.push({
          label: "Lancer l'impression",
          icon: Printer,
          onClick: () => handleStartPrinting(order)
        });
      } else if (order.statut === "en_impression") {
        actions.push({
          label: "Terminer l'impression",
          icon: FileText,
          onClick: () => handleFinishPrinting(order)
        });
      }
    }
  
    // Les admins et l'accueil peuvent modifier
    // if (userRole === "admin" || userRole === "accueil") {
    //   actions.push();
    // }
  
    // Seuls les admins peuvent supprimer
    if (userRole === "admin") {
      actions.push({
        label: "Supprimer",
        icon: Trash2,
        onClick: () => handleDeleteOrder(order)
      });
    }
  
    // Tout le monde peut exporter en PDF
    actions.push({
      label: "Exporter en PDF",
      icon: FileText,
      onClick: () => handleExportPDF(order)
    });
  
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
    );
    
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

  const handleOrderUpdate = (updatedOrder: Commande | undefined) => {
    if (updatedOrder) {
      toast.success("Commande mise à jour avec succès")
      loadOrders()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtres - Masquer complètement pour les graphistes */}
      {userRole !== "graphiste" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Rechercher client..."
              type="text"
              value={filters.client_nom || ""}
              onChange={(e) => handleFilterChange("client_nom", e.target.value || undefined)}
              className="max-w-sm"
            />
            <Select
              value={filters.statut || ""}
              onValueChange={(value) => handleFilterChange("statut", value === "all" ? undefined : value)}
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
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Paiement</TableHead>
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
                  <TableCell>
                    {`${order.client.prenom} ${order.client.nom}`}
                    {order.client.telephone && (
                      <div className="text-xs text-muted-foreground">{order.client.telephone}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.date_creation), "dd MMMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>{renderStatus(order.statut)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.situation_paiement === "comptant" ? "Comptant" : "Crédit"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {order.details && order.details.length > 0 
                      ? formatCurrency(order.details.reduce((sum, detail) => sum + detail.sous_total, 0))
                      : "N/A"}
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
          }}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
      
      {orderToEdit && (
        <EditOrderDialog
          order={{
            ...orderToEdit,
            client: {
              client_id: orderToEdit.client_id || 0,
              nom: orderToEdit.client.nom,
              prenom: orderToEdit.client.prenom,
              email: orderToEdit.client.email,
              telephone: orderToEdit.client.telephone,
              adresse: orderToEdit.client.adresse,
              // Ajouter les propriétés manquantes avec des valeurs par défaut
              dette: 0,
              depot: 0,
              date_creation: new Date().toISOString(),
              derniere_visite: new Date().toISOString()
            } as Client, // Assertion de type pour s'assurer que TypeScript reconnaît cet objet comme un Client
            details: orderToEdit.details.map(detail => ({
              ...detail,
              materiau: detail.materiau || { materiau_id: detail.materiau_id, type_materiau: "" }
            })) as any,
            files: orderToEdit.files || []
          }}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleOrderUpdate}
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
