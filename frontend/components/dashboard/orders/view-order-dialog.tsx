"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Commande, TypeRemise, DetailCommande, PrintFile, Materiau } from "@/lib/api/types"
import { formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/api/utils"
import { OrderFilesList } from "./order-files-list"
import { useState, useEffect } from "react"
import materiaux from "@/lib/api/materiaux"

interface ViewOrderDialogProps {
  order: Commande & {
    details: DetailCommande[];
    clientInfo: {
      prenom: string;
      nom: string;
      telephone: string;
      email?: string;
      adresse?: string;
    };
    created_at: string;
    id: number;
    remise?: {
      type: 'pourcentage' | 'montant_fixe';
      valeur: number;
      code?: string;
      montant_applique: number;
    };
    files?: PrintFile[];
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewOrderDialog({
  order,
  open,
  onOpenChange,
}: ViewOrderDialogProps) {
  const [materiauxList, setMateriauxList] = useState<Materiau[]>([])
  
  // Charger la liste des matériaux
  useEffect(() => {
    const loadMateriaux = async () => {
      try {
        const data = await materiaux.getAll()
        setMateriauxList(data)
      } catch (error) {
        console.error('Erreur lors du chargement des matériaux:', error)
      }
    }
    
    if (open) {
      loadMateriaux()
    }
  }, [open])
  
  // Fonction pour obtenir le nom du matériau à partir de son ID
  const getMaterialName = (materiau_id: number) => {
    const materiau = materiauxList.find(m => m.materiau_id === materiau_id)
    return materiau ? materiau.type_materiau : `ID: ${materiau_id}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reçue":
        return "bg-yellow-500"
      case "payée":
        return "bg-blue-500"
      case "en_impression":
        return "bg-purple-500"
      case "terminée":
        return "bg-green-500"
      case "livrée":
        return "bg-green-600"
      default:
        return "bg-gray-500"
    }
  }

  const calculateSubtotal = () => {
    return order.details.reduce(
      (total: number, item: DetailCommande) => total + item.quantite * item.prix_unitaire,
      0
    )
  }

  const calculateDiscount = () => {
    if (!order.remise) return 0
    
    const subtotal = calculateSubtotal()
    
    if (order.remise.type === 'pourcentage') {
      return (subtotal * order.remise.valeur) / 100
    } else {
      return order.remise.valeur
    }
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return subtotal - discount
  }

  const getRemiseTypeLabel = (type: TypeRemise) => {
    return type === 'pourcentage' ? '%' : '€'
  }

  const getOptionsDetails = (detail: DetailCommande) => {
    try {
      const parsedData = JSON.parse(detail.commentaires || "{}")
      
      // Vérifier si nous avons un tableau d'options dans la structure
      if (parsedData.options && Array.isArray(parsedData.options)) {
        return parsedData.options.map((option: any) => ({
          name: option.option || option.name || option.label || "Option",
          quantity: option.quantity || 1,
          unit_price: option.unit_price || option.price || 0,
          total_price: option.total_price || (option.quantity * option.unit_price) || 0
        }))
      }
      
      // Fallback pour l'ancien format (objet avec des clés)
      return Object.entries(parsedData).filter(([key]) => key !== "commentaires").map(([key, value]: [string, any]) => {
        if (typeof value === "object") {
          return {
            name: key,
            quantity: value.quantity || 1,
            unit_price: value.unit_price || 0,
            total_price: value.total_price || 0
          }
        } else {
          return {
            name: key,
            quantity: 1,
            unit_price: 0,
            total_price: 0
          }
        }
      })
    } catch (error) {
      console.error("Erreur lors du parsing des options:", error)
      return []
    }
  }

  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return "N/A";
    if (typeof dimensions === "string") return dimensions;
    
    try {
      // Si c'est un objet JSON stringifié
      if (typeof dimensions === "string") {
        dimensions = JSON.parse(dimensions);
      }
      
      // Extraire les propriétés principales si elles existent
      const { longueur, largeur_materiau, largeur_demandee } = dimensions;
      
      // Priorité: largeur_materiau > largeur_demandee
      if (longueur && (largeur_materiau || largeur_demandee)) {
        const largeur = largeur_materiau || largeur_demandee;
        return `${longueur} × ${largeur} cm`;
      }
      
      // Fallback: retourner une représentation formatée des dimensions disponibles
      return Object.entries(dimensions)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
        .join(", ");
    } catch (e) {
      console.error("Erreur lors du formatage des dimensions:", e);
      return "Format inconnu";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Client</h3>
              <p>
                {order.clientInfo.prenom} {order.clientInfo.nom}
              </p>
              <p>{order.clientInfo.telephone}</p>
              {order.clientInfo.email && <p>{order.clientInfo.email}</p>}
            </div>
            <div>
              <h3 className="font-semibold">Informations de commande</h3>
              <p>Date: {formatDate(order.created_at)}</p>
              <div className="flex items-center gap-1">
                Statut:{" "}
                <Badge className={getStatusColor(order.statut)}>
                  {order.statut}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                Mode de paiement:{" "}
                <Badge variant="outline">
                  {order.situation_paiement === "comptant" ? "Comptant" : "Crédit"}
                </Badge>
              </div>
            </div>
          </div>

          {order.clientInfo.adresse && (
            <div>
              <h3 className="font-semibold">Adresse de livraison</h3>
              <p>{order.clientInfo.adresse}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Articles commandés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matériau</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.details.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{getMaterialName(item.materiau_id)}</TableCell>
                    <TableCell>{formatDimensions(item.dimensions)}</TableCell>
                    <TableCell>{item.quantite}</TableCell>
                    <TableCell>{formatCurrency(item.prix_unitaire)}</TableCell>
                    <TableCell>
                      {formatCurrency(item.quantite * item.prix_unitaire)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {order.details.some(detail => detail.commentaires && JSON.parse(detail.commentaires)) && (
            <div>
              <h3 className="font-semibold mb-2">Options sélectionnées</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Option</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.details.flatMap(detail => getOptionsDetails(detail)).map((option, index) => (
                    <TableRow key={index}>
                      <TableCell>{option.name}</TableCell>
                      <TableCell>{option.quantity}</TableCell>
                      <TableCell>{formatCurrency(option.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(option.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Section des remises */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Récapitulatif et remises</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                {order.remise && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-2">
                      <span>Remise</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {order.remise.type === 'pourcentage' 
                          ? `${order.remise.valeur}%` 
                          : formatCurrency(order.remise.valeur)}
                      </Badge>
                      {order.remise.code && (
                        <span className="text-xs text-muted-foreground">
                          (Code: {order.remise.code})
                        </span>
                      )}
                    </div>
                    <span>-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section des fichiers */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Fichiers associés</h3>
              <OrderFilesList files={order.files || []} />
            </CardContent>
          </Card>

          {order.commentaires && (
            <div>
              <h3 className="font-semibold">Commentaires</h3>
              <p>{order.commentaires}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
