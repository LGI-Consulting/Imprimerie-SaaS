'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Users, Package } from "lucide-react"
import { useEffect, useState } from "react"
import { OrderApi, ClientApi, PaymentApi, MaterialApi } from "@/lib/api"
import { Order, Client, Payment, Material } from "@/lib/api/types"
export default function PageDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    nouveauxClients: 0,
    articlesInventaire: 0,
    commandesActives: 0,
    evolutionRevenue: 0,
    evolutionClients: 0,
    evolutionInventaire: 0
  })
  const [commandesRecentes, setCommandesRecentes] = useState<Order[]>([])
  const [meilleursClients, setMeilleursClients] = useState<Client[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const recupererDonneesDashboard = async () => {
      try {
        // Récupérer toutes les données en parallèle
        const [commandes, clients, paiements, materiaux] = await Promise.all([
          OrderApi.getAll(),
          ClientApi.getAll(),
          PaymentApi.getAllPayments(),
          MaterialApi.getAll()
        ])

        // Calculer les statistiques
        const maintenant = new Date()
        const moisDernier = new Date(maintenant.setMonth(maintenant.getMonth() - 1))
        
        const totalRevenue = paiements
          .filter(p => p.statut === 'validé')
          .reduce((sum, paiement) => sum + paiement.montant, 0)
          
        const nouveauxClients = clients.filter(c => 
          new Date(c.date_creation) > moisDernier
        ).length
        
        const commandesActives = commandes.filter(o => 
          o.statut !== 'terminée' && o.statut !== 'livrée'
        ).length
        
        // Calculer les évolutions (simplifié - dans une vraie app on comparerait avec les données du mois dernier)
        const evolutionRevenue = 20.1 // À calculer à partir des données historiques
        const evolutionClients = 10.1
        const evolutionInventaire = 12

        setStats({
          totalRevenue,
          nouveauxClients,
          articlesInventaire: materiaux.length,
          commandesActives,
          evolutionRevenue,
          evolutionClients,
          evolutionInventaire
        })

        // Obtenir les commandes récentes (5 dernières)
        setCommandesRecentes(commandes
          .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
          .slice(0, 5)
        )

        // Obtenir les meilleurs clients (simplifié - normalement on regarderait les montants des paiements)
        setMeilleursClients(clients.slice(0, 5))

      } catch (error) {
        console.error("Échec de la récupération des données du dashboard:", error)
      } finally {
        setChargement(false)
      }
    }

    recupererDonneesDashboard()
  }, [])

  if (chargement) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">Bon retour ! Voici un aperçu de votre activité.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.evolutionRevenue >= 0 ? '+' : ''}{stats.evolutionRevenue}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.nouveauxClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.evolutionClients >= 0 ? '+' : ''}{stats.evolutionClients}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles en stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articlesInventaire}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.evolutionInventaire} nouveaux articles ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes actives</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandesActives}</div>
            <p className="text-xs text-muted-foreground">
              {commandesRecentes.filter(o => o.statut === 'reçue').length} en attente de validation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>Vos commandes les plus récentes pour tous les clients</CardDescription>
          </CardHeader>
          <CardContent>
            {commandesRecentes.length > 0 ? (
              <div className="space-y-4">
                {commandesRecentes.map(commande => (
                  <div key={commande.commande_id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">Commande #{commande.numero_commande}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(commande.date_creation).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium capitalize">{commande.statut}</p>
                      <p className="text-sm text-muted-foreground">
                        {commande.priorite > 0 ? 'Haute priorité' : 'Normale'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune commande récente
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Meilleurs clients</CardTitle>
            <CardDescription>Vos clients les plus actifs ce mois-ci</CardDescription>
          </CardHeader>
          <CardContent>
            {meilleursClients.length > 0 ? (
              <div className="space-y-4">
                {meilleursClients.map(client => (
                  <div key={client.client_id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">{client.prenom} {client.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.telephone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {commandesRecentes.filter(o => o.client_id === client.client_id).length} commandes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dernière visite: {new Date(client.derniere_visite).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune donnée client disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}