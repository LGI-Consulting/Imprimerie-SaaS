"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OrderList } from "@/components/orders/order-list"
import { OrderDetail } from "@/components/orders/order-detail"
import { OrderForm } from "@/components/orders/order-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useOrders } from "@/hooks/use-orders"
import { CreateOrderData, Order } from "@/lib/order-service"
import { toast } from "@/components/ui/use-toast"

export default function OrdersPage() {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { orders, loading, error, createOrder, updateOrder, deleteOrder } = useOrders()

  const handleViewOrder = (orderId: string) => {
    setSelectedOrder(orderId)
  }

  const handleEditOrder = (orderId: string) => {
    setSelectedOrder(orderId)
    setIsEditing(true)
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      try {
        await deleteOrder(orderId)
        setSelectedOrder(null)
        toast({
          title: "Commande supprimée",
          description: "La commande a été supprimée avec succès.",
        })
      } catch (error) {
        console.error("Error deleting order:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression de la commande.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCreateOrder = async (data: CreateOrderData) => {
    try {
      await createOrder(data)
      setIsCreating(false)
      toast({
        title: "Commande créée",
        description: "La commande a été créée avec succès.",
      })
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrder = async (orderId: string, data: CreateOrderData) => {
    try {
      await updateOrder(orderId, data)
      setIsEditing(false)
      setSelectedOrder(null)
      toast({
        title: "Commande mise à jour",
        description: "La commande a été mise à jour avec succès.",
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la commande.",
        variant: "destructive",
      })
    }
  }

  const getSelectedOrderData = (): Order | undefined => {
    return orders.find(order => order.commande_id === selectedOrder)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Commande
        </Button>
      </div>

      {selectedOrder ? (
        <OrderDetail
          order={getSelectedOrderData()!}
          onEdit={() => setIsEditing(true)}
          onDelete={() => handleDeleteOrder(selectedOrder)}
          onBack={() => setSelectedOrder(null)}
        />
      ) : (
        <OrderList
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {isCreating && (
        <OrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {isEditing && selectedOrder && (
        <OrderForm
          initialData={getSelectedOrderData()!}
          onSubmit={(data) => handleUpdateOrder(selectedOrder, data)}
          onCancel={() => {
            setIsEditing(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}
