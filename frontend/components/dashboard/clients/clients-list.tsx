"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { ClientDataTable } from "./client-data-table"
import { AddClientDialog } from "./add-client-dialog"
import { EditClientDialog } from "./edit-client-dialog"
import { ViewClientDialog } from "./view-client-dialog"
import { Client } from "@/lib/api/types"
import { clients } from "@/lib/api/client"
import { useNotificationStore } from "@/lib/store/notifications"
import { ClientFilters } from "./client-filters"

interface ClientsListProps {
  filters?: ClientFilters
}

export function ClientsList({ filters }: ClientsListProps) {
  const { addNotification } = useNotificationStore()
  const [clientsList, setClientsList] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // États pour les dialogues
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Charger les clients
  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      let data = await clients.getAll()
      
      if (data){
        // Appliquer les filtres
      if (filters) {
        if (filters.search) {
          data = data.filter(client => 
            client.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
            client.prenom.toLowerCase().includes(filters.search.toLowerCase()) ||
            client.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            client.telephone.includes(filters.search)
          )
        }

        if (filters.showActiveOnly) {
          // On ne filtre pas par actif car cette propriété n'existe pas dans le type Client
          // On pourrait ajouter cette propriété si nécessaire
        }

        // Appliquer le tri
        switch (filters.sort) {
          case "name_asc":
            data.sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom))
            break
          case "name_desc":
            data.sort((a, b) => (b.nom + b.prenom).localeCompare(a.nom + a.prenom))
            break
          case "recent":
            data.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
            break
          case "oldest":
            data.sort((a, b) => new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime())
            break
        }
      }
      }
      

      setClientsList(data)
      setError(null)
    } catch (err) {
      console.error("Erreur lors du chargement des clients:", err)
      setError("Impossible de charger les clients")
      toast.error("Erreur lors du chargement des clients")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Gérer les actions sur les clients
  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setViewDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setEditDialogOpen(true)
  }

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.prenom} ${client.nom} ?`)) {
      return
    }

    try {
      await clients.delete(client.client_id)
      toast.success("Client supprimé avec succès")
      
      // Ajouter une notification pour la suppression
      addNotification(
        "order_complete",
        {
          orderId: client.client_id.toString(),
          clientName: `${client.prenom} ${client.nom}`
        },
        "accueil",
        "caisse"
      )
      
      loadClients()
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      toast.error("Erreur lors de la suppression du client")
    }
  }

  const handleAddClient = async (clientData: {
    nom: string
    prenom: string
    email?: string | null
    telephone: string
    adresse?: string | null
  }) => {
    try {
      const newClient = await clients.create(clientData)
      toast.success("Client ajouté avec succès")
      
      // Ajouter une notification pour le nouveau client
      addNotification(
        "new_order",
        {
          orderId: newClient.client_id.toString(),
          clientName: `${clientData.prenom} ${clientData.nom}`
        },
        "accueil",
        "caisse"
      )
      
      loadClients()
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err)
      toast.error("Erreur lors de l'ajout du client")
    }
  }

  const handleUpdateClient = async (clientData: {
    client_id: number
    nom: string
    prenom: string
    email?: string | null
    telephone: string
    adresse?: string | null
  }) => {
    try {
      await clients.update(clientData.client_id, {
        nom: clientData.nom,
        prenom: clientData.prenom,
        email: clientData.email,
        telephone: clientData.telephone,
        adresse: clientData.adresse,
      })
      toast.success("Client mis à jour avec succès")
      
      // Ajouter une notification pour la mise à jour
      addNotification(
        "new_order",
        {
          orderId: clientData.client_id.toString(),
          clientName: `${clientData.prenom} ${clientData.nom}`
        },
        "accueil",
        "caisse"
      )
      
      loadClients()
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err)
      toast.error("Erreur lors de la mise à jour du client")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

     { clientsList && (
      <ClientDataTable
      data={clientsList}
      onViewClient={handleViewClient}
      onEditClient={handleEditClient}
      onDeleteClient={handleDeleteClient}
    />
     )
     }

{ !clientsList && (
      <ClientDataTable
      data={[]}
      onViewClient={handleViewClient}
      onEditClient={handleEditClient}
      onDeleteClient={handleDeleteClient}
    />
     )
     }

      {/* Dialogues */}
      <AddClientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddClient={handleAddClient}
      />

      {selectedClient && (
        <>
          <EditClientDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            client={selectedClient}
            onUpdateClient={handleUpdateClient}
          />

          <ViewClientDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            client={selectedClient}
          />
        </>
      )}
    </div>
  )
} 