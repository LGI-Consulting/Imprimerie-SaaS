"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Wallet, ArrowUp, ArrowDown, AlertCircle, CreditCard, Loader2, X, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { clients } from "@/lib/api/client"
import { toast } from "sonner"
import { Client } from "@/lib/api/types"
import { Transaction } from "@/lib/api/client"
import { TransactionReceipt } from "./transaction-receipt"

// Schéma de validation pour les transactions
const transactionSchema = z.object({
  montant: z.number().positive({
    message: "Le montant doit être supérieur à 0",
  }),
  commentaire: z.string().optional(),
})

interface TransactionsClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
  onTransactionSuccess?: () => void
}

export function TransactionsClientDialog({ 
  open, 
  onOpenChange, 
  client, 
  onTransactionSuccess 
}: TransactionsClientDialogProps) {
  const [activeTab, setActiveTab] = useState("depot")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [balances, setBalances] = useState({ dette: 0, depot: 0 })
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  
  // Formulaire pour les transactions
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      montant: 0,
      commentaire: "",
    },
  })
  
  // Charger les transactions et soldes à l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      loadClientData()
    }
  }, [open, client.client_id])
  
  // Fonction pour charger les données client
  const loadClientData = async () => {
    setLoading(true)
    try {
      // Récupérer un client à jour
      const refreshedClient = await clients.getById(client.client_id)
      
      // Mettre à jour les soldes
      const currentBalances = clients.getAccountBalance(refreshedClient)
      setBalances(currentBalances)
      
      // Récupérer les transactions
      const transactionsList = await clients.getTransactions(client.client_id)
      setTransactions(transactionsList)
    } catch (error) {
      console.error("Erreur lors du chargement des données client:", error)
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }
  
  // Gérer le dépôt
  const handleDepot = async (data: z.infer<typeof transactionSchema>) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const transaction = await clients.ajouterDepot(client.client_id, {
        montant: data.montant,
        commentaire: data.commentaire,
      })
      
      toast.success("Dépôt ajouté avec succès")
      form.reset()
      loadClientData()
      setCurrentTransaction(transaction)
      setShowReceipt(true)
      
      if (onTransactionSuccess) {
        onTransactionSuccess()
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du dépôt:", err)
      setError("Une erreur est survenue lors de l'ajout du dépôt")
      toast.error("Erreur lors de l'ajout du dépôt")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Gérer le retrait
  const handleRetrait = async (data: z.infer<typeof transactionSchema>) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const transaction = await clients.retirerDepot(client.client_id, {
        montant: data.montant,
        commentaire: data.commentaire,
      })
      
      toast.success("Retrait effectué avec succès")
      form.reset()
      loadClientData()
      setCurrentTransaction(transaction)
      setShowReceipt(true)
      
      if (onTransactionSuccess) {
        onTransactionSuccess()
      }
    } catch (err) {
      console.error("Erreur lors du retrait:", err)
      setError("Une erreur est survenue lors du retrait. Vérifiez que le solde est suffisant.")
      toast.error("Erreur lors du retrait")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Gérer l'imputation de dette
  const handleImputerDette = async (data: z.infer<typeof transactionSchema>) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const transaction = await clients.imputerDette(client.client_id, {
        montant: data.montant,
        commentaire: data.commentaire,
      })
      
      toast.success("Dette imputée avec succès")
      form.reset()
      loadClientData()
      setCurrentTransaction(transaction)
      setShowReceipt(true)
      
      if (onTransactionSuccess) {
        onTransactionSuccess()
      }
    } catch (err) {
      console.error("Erreur lors de l'imputation de la dette:", err)
      setError("Une erreur est survenue lors de l'imputation de la dette")
      toast.error("Erreur lors de l'imputation de la dette")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Gérer le paiement de dette
  const handlePayerDette = async (data: z.infer<typeof transactionSchema>) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const transaction = await clients.payerDette(client.client_id, {
        montant: data.montant,
        commentaire: data.commentaire,
      })
      
      toast.success("Paiement de dette effectué avec succès")
      form.reset()
      loadClientData()
      setCurrentTransaction(transaction)
      setShowReceipt(true)
      
      if (onTransactionSuccess) {
        onTransactionSuccess()
      }
    } catch (err) {
      console.error("Erreur lors du paiement de la dette:", err)
      setError("Une erreur est survenue lors du paiement de la dette")
      toast.error("Erreur lors du paiement de la dette")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Gestion de soumission du formulaire selon l'onglet actif
  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    switch (activeTab) {
      case "depot":
        await handleDepot(data)
        break
      case "retrait":
        await handleRetrait(data)
        break
      case "imputer_dette":
        await handleImputerDette(data)
        break
      case "payer_dette":
        await handlePayerDette(data)
        break
    }
  }
  
  // Fonction pour formatter un montant
  const formatAmount = (amount?: number) => {
    return typeof amount === 'number' 
      ? amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' FCFA'
      : '0.00 FCFA'
  }
  
  // Fonction pour formater une date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return format(new Date(dateStr), "dd MMM yyyy HH:mm", { locale: fr })
  }
  
  // Fonction pour obtenir l'icône et la couleur selon le type de transaction
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'depot':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'retrait':
        return <ArrowDown className="h-4 w-4 text-yellow-500" />
      case 'imputation_dette':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'paiement_dette':
        return <CreditCard className="h-4 w-4 text-blue-500" />
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
        {showReceipt && currentTransaction ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Reçu de transaction
              </DialogTitle>
              <DialogDescription>
                Reçu de transaction pour {client.prenom} {client.nom}
              </DialogDescription>
            </DialogHeader>
            <TransactionReceipt 
              transaction={currentTransaction} 
              client={client} 
              onClose={() => setShowReceipt(false)} 
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Transactions financières
              </DialogTitle>
              <DialogDescription>
                Gérez les transactions financières pour {client.prenom} {client.nom}
              </DialogDescription>
            </DialogHeader>
            
            {/* Résumé des comptes */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Card className={balances.dette > 0 ? "border-destructive/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Dette client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {formatAmount(balances.dette)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Dépôt disponible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {formatAmount(balances.depot)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs 
              value={activeTab} 
              className="w-full"
              onValueChange={(value) => {
                setActiveTab(value)
                form.reset()
                setError(null)
              }}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="depot">Dépôt</TabsTrigger>
                <TabsTrigger value="retrait">Retrait</TabsTrigger>
                <TabsTrigger value="imputer_dette">Ajouter dette</TabsTrigger>
                <TabsTrigger value="payer_dette">Payer dette</TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  {/* Contenu commun à tous les onglets */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="montant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              placeholder="Entrez le montant" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {activeTab === "retrait" && "Montant à retirer du dépôt du client"}
                            {activeTab === "depot" && "Montant à ajouter au dépôt du client"}
                            {activeTab === "imputer_dette" && "Montant de dette à ajouter"}
                            {activeTab === "payer_dette" && "Montant de dette à payer"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="commentaire"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commentaire</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Optionnel: ajoutez un commentaire à cette transaction"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Ajoutez un commentaire pour décrire la raison de cette transaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Descriptions spécifiques à chaque onglet */}
                  <TabsContent value="depot">
                    <p className="text-sm text-muted-foreground">
                      Le dépôt permet d'ajouter de l'argent au compte du client. Ce montant pourra être utilisé pour de futures commandes.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="retrait">
                    <p className="text-sm text-muted-foreground">
                      Le retrait permet de diminuer le montant disponible sur le compte du client. Le solde doit être suffisant.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="imputer_dette">
                    <p className="text-sm text-muted-foreground">
                      L'imputation de dette permet d'ajouter un montant à la dette du client. Utilisez cette option quand le client doit de l'argent.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="payer_dette">
                    <p className="text-sm text-muted-foreground">
                      Le paiement de dette permet de réduire la dette du client. Le montant maximum est la dette actuelle.
                    </p>
                  </TabsContent>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          {activeTab === "depot" && "Ajouter le dépôt"}
                          {activeTab === "retrait" && "Effectuer le retrait"}
                          {activeTab === "imputer_dette" && "Imputer la dette"}
                          {activeTab === "payer_dette" && "Payer la dette"}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </Tabs>
            
            {/* Transactions récentes */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Transactions récentes</h3>
              
              {loading ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p>Chargement des transactions...</p>
                </div>
              ) : transactions.length > 0 ? (
                <div className="max-h-[200px] overflow-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <TableRow 
                          key={transaction.transaction_id}
                          className="cursor-pointer"
                          onClick={() => {
                            setCurrentTransaction(transaction)
                            setShowReceipt(true)
                          }}
                        >
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
                <div className="flex items-center justify-center h-16 text-muted-foreground border rounded-md">
                  <p>Aucune transaction trouvée</p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 