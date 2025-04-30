"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, Phone, MapPin, User, FileText, Clock, CreditCard, Wallet, AlertCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { clients, Transaction } from "@/lib/api/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Client } from "@/lib/api/types"
interface ViewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    client_id: number
    nom: string
    prenom: string
    email?: string | null
    telephone: string
    adresse?: string | null
    date_creation?: string
    derniere_visite?: string
    notes?: string
    dette?: number
    depot?: number
  }
}

export function ViewClientDialog({ open, onOpenChange, client }: ViewClientDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [balances, setBalances] = useState({ dette: 0, depot: 0 })
  
  // Charger les transactions et les soldes à l'ouverture du dialogue
  useEffect(() => {
    if (open && client) {
      setLoading(true)
      
      // Récupérer les soldes à jour
      const currentBalances = clients.getAccountBalance(client as Client)
      setBalances(currentBalances)
      
      // Récupérer les transactions
      clients.getTransactions(client.client_id)
        .then(data => {
          setTransactions(data)
        })
        .catch(error => {
          console.error("Erreur lors du chargement des transactions:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, client])
  
  // Fonction pour formater un montant en FCFA
  const formatAmount = (amount?: number) => {
    return typeof amount === 'number' 
      ? amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' FCFA'
      : '0.00 FCFA'
  }
  
  // Fonction pour formater la date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return format(new Date(dateStr), "dd MMM yyyy HH:mm", { locale: fr })
  }
  
  // Fonction pour obtenir l'icône et la couleur selon le type de transaction
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'depot':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'retrait':
        return <ArrowDownLeft className="h-4 w-4 text-yellow-500" />
      case 'imputation_dette':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'paiement_dette':
        return <Wallet className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }
  
  // Fonction pour obtenir le label du type de transaction
  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'depot': return 'Dépôt'
      case 'retrait': return 'Retrait'
      case 'imputation_dette': return 'Ajout dette'
      case 'paiement_dette': return 'Paiement dette'
      default: return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails du client
          </DialogTitle>
          <DialogDescription>Informations détaillées sur {client.prenom} {client.nom}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="informations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="informations">Informations principales</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="informations">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2 pb-2">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                  {client.prenom[0]}{client.nom[0]}
                </div>
                <h3 className="text-xl font-semibold">{client.prenom} {client.nom}</h3>
                <Badge variant="outline">CLT-{client.client_id.toString().padStart(4, "0")}</Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Contact</CardTitle>
                    <CardDescription>Informations de contact</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.email || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.telephone}</span>
                    </div>
                    {client.adresse && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{client.adresse}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Dates</CardTitle>
                    <CardDescription>Informations temporelles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {client.date_creation && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Inscription: {format(new Date(client.date_creation), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    )}
                    {client.derniere_visite && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Dernière visite: {format(new Date(client.derniere_visite), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {client.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Notes</CardTitle>
                    <CardDescription>Informations complémentaires</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm whitespace-pre-line">{client.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="finance">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className={balances.dette > 0 ? "border-destructive/50" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Dette client
                    </CardTitle>
                    <CardDescription>Montant dû par le client</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {formatAmount(balances.dette)}
                      </div>
                      {balances.dette > 0 && (
                        <Badge variant="destructive">À payer</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      Dépôt disponible
                    </CardTitle>
                    <CardDescription>Crédit disponible du client</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatAmount(balances.depot)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Transactions financières</CardTitle>
                  <CardDescription>Historique des dépôts, retraits et paiements</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p>Chargement des transactions...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="max-h-[300px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.transaction_id}>
                              <TableCell className="font-medium">
                                {formatDate(transaction.date_transaction)}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type_transaction)}
                                {getTransactionLabel(transaction.type_transaction)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatAmount(transaction.montant)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p>Aucune transaction trouvée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="historique">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historique des commandes</CardTitle>
                  <CardDescription>Liste des commandes passées par ce client</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>Aucune commande trouvée</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historique des paiements</CardTitle>
                  <CardDescription>Liste des paiements effectués par ce client</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>Aucun paiement trouvé</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
