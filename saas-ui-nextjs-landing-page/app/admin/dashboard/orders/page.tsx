"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OrderApi, ClientApi } from "../../../../lib/api"
import { Order, Client } from "../../../../lib/api/types"
import { AddOrderDialog } from "@/components/dashboard/orders/add-order-dialog"
import { ViewOrderDialog } from "@/components/dashboard/orders/view-order-dialog"
import { EditOrderDialog } from "@/components/dashboard/orders/edit-order-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PageCommandes() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("tous")
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, clientsData] = await Promise.all([
          OrderApi.getAll(),
          ClientApi.getAll()
        ])
        setOrders(ordersData)
        setClients(clientsData)
      } catch (error) {
        console.error("Échec de la récupération des données:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Obtenir le nom du client par ID
  const getClientName = (clientId: number | null) => {
    if (!clientId) return "Client inconnu"
    const client = clients.find(c => c.client_id === clientId)
    return client ? `${client.prenom} ${client.nom}` : "Client inconnu"
  }

  // Filtrer les commandes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.numero_commande?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(order.client_id).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = 
      statusFilter === "tous" || 
      order.statut.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Couleurs des badges de statut
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "terminée":
      case "livrée":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "en_impression":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "reçue":
      case "payée":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Formater le statut pour l'affichage
  const formatStatus = (status: string) => {
    switch (status) {
      case "reçue": return "Reçue"
      case "payée": return "Payée"
      case "en_impression": return "En cours"
      case "terminée": return "Terminée"
      case "livrée": return "Livrée"
      default: return status
    }
  }

  // Gérer la visualisation d'une commande
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewOrderOpen(true)
  }

  // Gérer l'édition d'une commande
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsEditOrderOpen(true)
  }

  // Gérer la suppression d'une commande
  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (selectedOrder) {
      try {
        await OrderApi.delete(selectedOrder.commande_id)
        setOrders(orders.filter(order => order.commande_id !== selectedOrder.commande_id))
      } catch (error) {
        console.error("Échec de la suppression de la commande:", error)
      } finally {
        setIsDeleteDialogOpen(false)
      }
    }
  }

  // Gérer l'ajout d'une commande
  const handleAddOrder = async (newOrder: Omit<Order, "commande_id">) => {
    try {
      const createdOrder = await OrderApi.create(newOrder)
      setOrders([...orders, createdOrder])
    } catch (error) {
      console.error("Échec de l'ajout de la commande:", error)
    }
  }

  // Gérer la mise à jour d'une commande
  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      await OrderApi.update(updatedOrder.commande_id, updatedOrder)
      setOrders(orders.map(order => 
        order.commande_id === updatedOrder.commande_id ? updatedOrder : order
      ))
    } catch (error) {
      console.error("Échec de la mise à jour de la commande:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Commandes</h2>
          <p className="text-muted-foreground">Gérez et visualisez toutes les commandes clients</p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => setIsAddOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des commandes..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="reçue">Reçue</SelectItem>
                  <SelectItem value="payée">Payée</SelectItem>
                  <SelectItem value="en_impression">En cours</SelectItem>
                  <SelectItem value="terminée">Terminée</SelectItem>
                  <SelectItem value="livrée">Livrée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro de commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.commande_id}>
                      <TableCell className="font-medium">{order.numero_commande}</TableCell>
                      <TableCell>{getClientName(order.client_id)}</TableCell>
                      <TableCell>{new Date(order.date_creation).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.statut)}>
                          {formatStatus(order.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.priorite > 0 ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                            Haute
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Normale
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Voir la commande" 
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Modifier la commande" 
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Supprimer la commande"
                            onClick={() => handleDeleteClick(order)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'ajout de commande */}
      <AddOrderDialog 
        open={isAddOrderOpen} 
        onOpenChange={setIsAddOrderOpen} 
        onAddOrder={handleAddOrder}
        clients={clients}
      />

      {/* Dialogue de visualisation de commande */}
      {selectedOrder && (
        <ViewOrderDialog 
          open={isViewOrderOpen} 
          onOpenChange={setIsViewOrderOpen} 
          order={selectedOrder}
          clientName={getClientName(selectedOrder.client_id)}
        />
      )}

      {/* Dialogue d'édition de commande */}
      {selectedOrder && (
        <EditOrderDialog
          open={isEditOrderOpen}
          onOpenChange={setIsEditOrderOpen}
          order={selectedOrder}
          onUpdateOrder={handleUpdateOrder}
          clients={clients}
        />
      )}

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La commande
              {selectedOrder && <span className="font-medium"> {selectedOrder.numero_commande}</span>} sera définitivement supprimée du système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}