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

export function ClientsList() {
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
      const data = await clients.getAll()
      setClientsList(data)
      setError(null)
    } catch (err) {
      console.error("Erreur lors du chargement des clients:", err)
      setError("Impossible de charger les clients")
      toast.error("Erreur lors du chargement des clients")
    } finally {
      setLoading(false)
    }
  }, [])

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
      await clients.create(clientData)
      toast.success("Client ajouté avec succès")
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

      <ClientDataTable
        data={clientsList}
        onViewClient={handleViewClient}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
      />

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