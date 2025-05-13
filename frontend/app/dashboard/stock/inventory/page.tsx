"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { inventoryApi } from "@/lib/api/inventory"
import { Rouleau, Utilisation, UtilisationStats } from "@/types/inventory"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { RouleauForm } from "@/components/stock/rouleau-form"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"

export default function InventoryPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [rouleaux, setRouleaux] = useState<Rouleau[]>([])
  const [utilisations, setUtilisations] = useState<Utilisation[]>([])
  const [selectedMateriau, setSelectedMateriau] = useState<number | null>(null)
  const [utilisationsStats, setUtilisationsStats] = useState<UtilisationStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin", "accueil"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await inventoryApi.getRouleaux()
        setRouleaux(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Charger les statistiques d'utilisation quand un matériau est sélectionné
  useEffect(() => {
    if (selectedMateriau) {
      const loadStats = async () => {
        try {
          const stats = await inventoryApi.getUtilisationsStats(selectedMateriau)
          setUtilisationsStats(stats)
        } catch (error) {
          console.error("Erreur lors du chargement des statistiques:", error)
        }
      }

      loadStats()
    }
  }, [selectedMateriau])

  const handleRouleauAdded = async () => {
    setIsDialogOpen(false)
    // Recharger les données
    const response = await inventoryApi.getRouleaux()
    setRouleaux(response.data)
  }

  if (!user || !hasRole(["admin", "accueil"])) {
    return <UnauthorizedAlert onDismiss={() => router.push("/dashboard")} />
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  // Extraire les matériaux uniques des rouleaux avec une clé unique
  const materiaux = Array.from(
    new Map(
      rouleaux.map((r) => [
        `${r.materiau_id}-${r.largeur}`,
        { id: r.materiau_id, nom: r.materiau_nom, largeur: r.largeur }
      ])
    ).values()
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestion de l'Inventaire</h1>

      <Tabs defaultValue="rouleaux" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rouleaux">Rouleaux</TabsTrigger>
          <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
        </TabsList>

        {/* Onglet Rouleaux */}
        <TabsContent value="rouleaux">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rouleaux en Stock</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Ajouter un Rouleau</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau Rouleau</DialogTitle>
                  </DialogHeader>
                  <RouleauForm
                    onSuccess={handleRouleauAdded}
                    onCancel={() => setIsDialogOpen(false)}
                    materiaux={materiaux.map(m => ({
                      materiau_id: m.id,
                      nom: m.nom,
                      type_materiau: "standard" // À adapter selon vos besoins
                    }))}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Matériau</TableHead>
                    <TableHead>Largeur</TableHead>
                    <TableHead>Longueur Restante</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date Réception</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rouleaux.map((rouleau) => (
                    <TableRow key={rouleau.rouleau_id}>
                      <TableCell>{rouleau.numero_rouleau}</TableCell>
                      <TableCell>{rouleau.materiau_nom}</TableCell>
                      <TableCell>{rouleau.largeur} cm</TableCell>
                      <TableCell>{rouleau.longueur_restante} m</TableCell>
                      <TableCell>{rouleau.fournisseur}</TableCell>
                      <TableCell>
                        {format(new Date(rouleau.date_reception), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="statistiques">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques d'Utilisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => setSelectedMateriau(Number(e.target.value))}
                  >
                    <option value="">Sélectionner un matériau</option>
                    {materiaux.map((materiau) => (
                      <option key={`${materiau.id}-${materiau.largeur}`} value={materiau.id}>
                        {materiau.nom} ({materiau.largeur}cm)
                      </option>
                    ))}
                  </select>
                </div>

                {utilisationsStats.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisations</TableHead>
                        <TableHead>Différence Moyenne</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {utilisationsStats.map((stat) => (
                        <TableRow key={stat.date}>
                          <TableCell>
                            {format(new Date(stat.date), "dd/MM/yyyy", {
                              locale: fr,
                            })}
                          </TableCell>
                          <TableCell>{stat.nombre_utilisations}</TableCell>
                          <TableCell>{stat.pourcentage_moyen.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}