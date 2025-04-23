"use client"

import { Order } from "@/lib/order-service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Printer, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderDetailProps {
  order: Order
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

export function OrderDetail({ order, onEdit, onDelete, onBack }: OrderDetailProps) {
  const router = useRouter()
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount)
  }
  
  // Calculate total amount
  const calculateTotal = () => {
    if (!order.details) return 0
    return order.details.reduce((total, detail) => total + detail.sous_total, 0)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Détails de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informations de la commande</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">N° Commande:</span>{" "}
                  {order.numero_commande}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {format(new Date(order.date_creation), "dd MMMM yyyy", { locale: fr })}
                </p>
                <p>
                  <span className="font-medium">Statut:</span>{" "}
                  <Badge variant="outline" className={getStatusColor(order.statut)}>
                    {order.statut}
                  </Badge>
                </p>
                {order.est_commande_speciale && (
                  <Badge variant="secondary">Commande spéciale</Badge>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Informations client</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nom:</span>{" "}
                  {order.client?.nom} {order.client?.prenom}
                </p>
                <p>
                  <span className="font-medium">Téléphone:</span>{" "}
                  {order.client?.telephone}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.client?.email || "Non renseigné"}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span>{" "}
                  {order.client?.adresse || "Non renseignée"}
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-4">Détails des produits</h3>
            <div className="space-y-4">
              {order.details?.map((detail) => (
                <div key={detail.detail_id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">
                        {detail.commentaires?.materiau_nom || "Matériau"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {detail.dimensions.largeur_demandee}x{detail.dimensions.longueur}cm
                      </p>
                      <p className="text-sm text-gray-500">
                        {detail.dimensions.nombre_exemplaires} exemplaire(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(detail.sous_total)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(detail.prix_unitaire)} / unité
                      </p>
                    </div>
                  </div>
                  {detail.commentaires?.commentaires && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p className="font-medium">Commentaires:</p>
                      <p>{detail.commentaires.commentaires}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total: {formatCurrency(calculateTotal())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 