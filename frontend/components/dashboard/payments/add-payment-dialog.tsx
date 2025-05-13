
import { useState, useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, CreditCard, Building, Banknote, Loader2, Search } from "lucide-react"
import { format } from "date-fns"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DownloadPDFButton } from "@/components/ui/download-pdf-button"
import { useAuth } from "@/lib/context/auth-context"
// Importer les types et fonctions de l'API
import { paiements } from "@/lib/api/paiements"
import { clients } from "@/lib/api/client"
import { commandes } from "@/lib/api/commandes"
import { Paiement, Facture, MethodePaiement, StatutPaiement, Commande, DetailCommande, Client } from "@/lib/api/types"
import { generateAndDownloadPaymentPDF } from "@/lib/pdf/generate-payment-pdf"

// Définir le schéma de validation en dehors du composant
const formSchema = z.object({
  client_id: z.string({
    required_error: "Veuillez sélectionner un client",
  }),
  commande_id: z.string({
    required_error: "Veuillez sélectionner une commande",
  }),
  montant: z.number().min(0, "Le montant doit être un nombre positif"),
  montant_recu: z.number().min(0, "Le montant reçu doit être un nombre positif"),
  methode: z.enum(["espèces", "Flooz", "Mixx"], {
    required_error: "Veuillez sélectionner un mode de paiement",
  }),
  description: z.string().optional(),
  reference_transaction: z.string().optional(),
  date_paiement: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
});

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPayment: (payment: Paiement, facture?: Facture) => void
}

export function AddPaymentDialog({ open, onOpenChange, onAddPayment }: AddPaymentDialogProps) {
  console.log("AddPaymentDialog render started with open:", open);
  
  // États essentiels
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Commande | null>(null);
  const [unpaidOrders, setUnpaidOrders] = useState<Commande[]>([]);
  const [resteAPayer, setResteAPayer] = useState<number>(0);
  const [monnaieRendue, setMonnaieRendue] = useState<number>(0);
  const [resteAPayerApresPaiement, setResteAPayerApresPaiement] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // États pour la gestion du succès d'un paiement
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [createdPayment, setCreatedPayment] = useState<Paiement | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<Facture | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isSubmitting = React.useRef(false);

  // Important: Créer le formulaire en dehors de tout bloc conditionnel
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: "",
      commande_id: "",
      montant: 0,
      montant_recu: 0,
      methode: "espèces",
      description: "",
      reference_transaction: "",
      date_paiement: new Date(),
    },
  });
  
  // Récupérer les valeurs du formulaire une seule fois par rendu à l'aide de useMemo
  const montantAPayer = form.watch("montant");
  const montantRecu = form.watch("montant_recu");
  const methodePaiement = form.watch("methode");
  
  // Créer des variables dérivées avec useMemo pour éviter des calculs répétés
  const calculatedMonnaieRendue = useMemo(() => {
    const mPayer = Number(montantAPayer);
    const mRecu = Number(montantRecu);
    return mRecu > mPayer ? mRecu - mPayer : 0;
  }, [montantAPayer, montantRecu]);

  const calculatedResteAPayerApresPaiement = useMemo(() => {
    if (!selectedOrder) return 0;
    
    const mPayer = Number(montantAPayer);
    const mRecu = Number(montantRecu);
    
    if (selectedOrder.situation_paiement === "credit") {
      return Math.max(0, resteAPayer - mRecu);
    }
    return 0;
  }, [selectedOrder, montantAPayer, montantRecu, resteAPayer]);

  // Mettre à jour les états dérivés une seule fois après les calculs
  useEffect(() => {
    setMonnaieRendue(calculatedMonnaieRendue);
    setResteAPayerApresPaiement(calculatedResteAPayerApresPaiement);
  }, [calculatedMonnaieRendue, calculatedResteAPayerApresPaiement]);
  
  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, resetting form");
      form.reset();
      setSelectedClient(null);
      setSelectedOrder(null);
      setUnpaidOrders([]);
      setResteAPayer(0);
      setMonnaieRendue(0);
      setResteAPayerApresPaiement(0);
      setPaymentSuccess(false);
      setCreatedPayment(null);
      setCreatedInvoice(null);
      setSearchQuery("");
      
      // Charger la liste des clients
      const loadClients = async () => {
        try {
          const response = await clients.getAll();
          setClientsList(response || []);
        } catch (error) {
          console.error('Erreur lors du chargement des clients:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des clients",
            variant: "destructive",
          });
        }
      };
      
      loadClients();
    }
  }, [open, form, toast]);

  // Charger les commandes non payées d'un client lorsqu'il est sélectionné
  useEffect(() => {
    if (selectedClient) {
      const loadClientOrders = async () => {
        try {
          // Récupérer d'abord toutes les commandes du client
          const allClientOrders = await commandes.getByClient(selectedClient.client_id);
          
          // Filtrer pour ne garder que les commandes avec statut "reçue" (non payées)
          // et exclure les commandes spéciales
          const unpaid = allClientOrders.filter(order => 
            order.statut === "reçue" && !order.est_commande_speciale
          );
          setUnpaidOrders(unpaid);
          
          // Réinitialiser la commande sélectionnée
          setSelectedOrder(null);
          form.setValue("commande_id", "");
        } catch (error) {
          console.error('Erreur lors du chargement des commandes du client:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les commandes du client",
            variant: "destructive",
          });
        }
      };
      
      loadClientOrders();
    } else {
      // Réinitialiser les commandes si aucun client n'est sélectionné
      setUnpaidOrders([]);
      setSelectedOrder(null);
      form.setValue("commande_id", "");
    }
  }, [selectedClient, form]);

  // Calculer le reste à payer quand une commande est sélectionnée
  useEffect(() => {
    const calculateResteAPayer = async () => {
      if (selectedOrder) {
        try {
          const paymentDetails = await paiements.getCommandePaymentDetails(selectedOrder.commande_id);
          if (paymentDetails && paymentDetails.reste_a_payer) {
            const resteAPayerNum = parseFloat(paymentDetails.reste_a_payer);
            setResteAPayer(resteAPayerNum);
            
            // Important: Utiliser batch setValue pour éviter les rendus multiples
            form.setValue("montant", resteAPayerNum);
            form.setValue("montant_recu", resteAPayerNum);
          } else {
            throw new Error("Données de paiement invalides");
          }
        } catch (error) {
          console.error("Erreur lors du calcul du reste à payer:", error);
          toast({
            title: "Erreur",
            description: "Impossible de calculer le reste à payer",
            variant: "destructive",
          });
          setResteAPayer(0);
          form.setValue("montant", 0);
          form.setValue("montant_recu", 0);
        }
      }
    };

    calculateResteAPayer();
  }, [selectedOrder, form, toast]);

  // Filtrer les clients en fonction de la recherche
  const filteredClients = useMemo(() => {
    return searchQuery.trim() === "" 
      ? clientsList 
      : clientsList.filter(client => 
          `${client.nom} ${client.prenom} ${client.telephone}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
  }, [clientsList, searchQuery]);

  // Gérer la soumission du formulaire
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submission started with data:", data);
    
    // Vérifier si une soumission est déjà en cours
    if (isLoading || isSubmitting.current) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    try {
      // Verrouiller la soumission
      isSubmitting.current = true;
      setIsLoading(true);
      
      const montantAPayer = Number(data.montant);
      const montantRecu = Number(data.montant_recu);
      
      // Validation pour le paiement comptant
      if (selectedOrder?.situation_paiement === "comptant" && montantRecu < montantAPayer) {
        toast({
          title: "Erreur",
          description: "Le montant reçu doit être supérieur ou égal au montant à payer pour une commande comptant",
          variant: "destructive",
        });
        setIsLoading(false);
        isSubmitting.current = false;
        return;
      }

      if (!user?.id) {
        toast({
          title: "Erreur",
          description: "Impossible d'identifier l'employé",
          variant: "destructive",
        });
        setIsLoading(false);
        isSubmitting.current = false;
        return;
      }

      // Créer l'objet conforme à l'interface PaiementCreate
      const paymentData = {
        montant: montantAPayer,
        commande_id: selectedOrder?.commande_id || 0,
        methode: data.methode,
        montant_recu: montantRecu,
        monnaie_rendue: Math.max(0, montantRecu - montantAPayer),
        description: data.description || undefined,
        employe_id: user.id,
        reference_transaction: data.reference_transaction || undefined
      };
      
      console.log("Sending payment data:", paymentData);
      
      const result = await paiements.create(paymentData);
      console.log("Payment created successfully:", result);
      
      setCreatedPayment(result.payment);
      setCreatedInvoice(result.facture || null);
      setPaymentSuccess(true);

      // Vérifier si le paiement est complet
      const paymentDetails = await paiements.getCommandePaymentDetails(selectedOrder?.commande_id || 0);
      
      if (paymentDetails && Number(paymentDetails.reste_a_payer) === 0 && selectedOrder) {
        try {
          await commandes.updateStatus(selectedOrder.commande_id, "payée");
          toast({
            title: "Succès",
            description: "La commande a été marquée comme payée",
          });
        } catch (error) {
          console.error("Erreur lors de la mise à jour du statut de la commande:", error);
          toast({
            title: "Attention",
            description: "Le paiement a été enregistré mais le statut de la commande n'a pas pu être mis à jour",
            variant: "destructive",
          });
        }
      }

      // Appeler la fonction de callback avec les données du paiement
      if (onAddPayment) {
        onAddPayment(result.payment, result.facture);
      }
      
      toast({
        title: "Succès",
        description: "Le paiement a été enregistré avec succès",
      });
      
      // Fermer le dialogue après un court délai
      setTimeout(() => {
        handleClose();
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  // Fermer le dialogue et réinitialiser le formulaire
  const handleClose = () => {
    isSubmitting.current = false;
    setIsLoading(false);
    onOpenChange(false);
    form.reset();
    setPaymentSuccess(false);
    setCreatedPayment(null);
    setCreatedInvoice(null);
    setSelectedClient(null);
    setSelectedOrder(null);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Si on ferme le dialogue et qu'une soumission est en cours, ignorer
      if (!newOpen && isSubmitting.current) {
        console.log("Ignoring close request during submission");
        return;
      }
      // Sinon, appeler la fonction de fermeture normale
      handleClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>Ajouter un paiement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau paiement pour une commande client.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            {/* Recherche de client */}
            <div className="space-y-2">
              <FormLabel>Rechercher un client</FormLabel>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Nom, prénom ou téléphone" 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Sélection du client */}
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const client = clientsList.find(c => c.client_id.toString() === value);
                      setSelectedClient(client || null);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {filteredClients.map((client) => (
                        <SelectItem key={client.client_id} value={client.client_id.toString()}>
                          {client.nom} {client.prenom} - {client.telephone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Détails du client sélectionné - Ajuster pour les petits écrans */}
            {selectedClient && (
              <div className="rounded-md border p-3 bg-muted/30 text-sm">
                <h4 className="text-sm font-medium mb-1">Détails du client</h4>
                <div className="text-sm text-muted-foreground">
                  <p className="break-words">Nom: {selectedClient.nom} {selectedClient.prenom}</p>
                  <p>Téléphone: {selectedClient.telephone}</p>
                  {selectedClient.email && <p className="break-words">Email: {selectedClient.email}</p>}
                  {unpaidOrders.length > 0 ? (
                    <p className="text-amber-600 font-medium">{unpaidOrders.length} commande(s) non payée(s)</p>
                  ) : (
                    <p className="text-gray-500">Aucune commande en attente</p>
                  )}
                </div>
              </div>
            )}

            {/* Sélection de la commande - Ajuster pour les petits écrans */}
            {selectedClient && unpaidOrders.length > 0 && (
              <FormField
                control={form.control}
                name="commande_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commande</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const order = unpaidOrders.find(o => o.commande_id.toString() === value);
                        setSelectedOrder(order || null);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une commande" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[40vh]">
                        {unpaidOrders.map((order) => (
                          <SelectItem key={order.commande_id} value={order.commande_id.toString()}>
                            {order.numero_commande} - {format(new Date(order.date_creation), 'dd/MM/yyyy')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedOrder && (
              <>
                {/* Détails de la commande - Améliorer pour les petits écrans */}
                <div className="rounded-md border p-3 bg-muted/30 text-sm">
                  <h4 className="text-sm font-medium mb-2">Détails de la commande</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex flex-wrap justify-between">
                      <span className="text-muted-foreground">Numéro</span>
                      <span className="font-medium">{selectedOrder.numero_commande}</span>
                    </div>
                    <div className="flex flex-wrap justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {format(new Date(selectedOrder.date_creation), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between">
                      <span className="text-muted-foreground">Montant total</span>
                      <span className="font-medium">{paiements.formatAmount(resteAPayer)}</span>
                    </div>
                    <div className="flex flex-wrap justify-between">
                      <span className="text-muted-foreground">Reste à payer</span>
                      <span className="font-medium">{paiements.formatAmount(resteAPayer)}</span>
                    </div>
                    <div className="flex flex-wrap justify-between">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium capitalize">
                        {selectedOrder.situation_paiement === "credit" ? "Crédit" : "Comptant"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Champs de formulaire - Adapter pour les petits écrans */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="montant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant à payer</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={true}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="methode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Méthode de paiement</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une méthode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="espèces">Espèces</SelectItem>
                            <SelectItem value="Flooz">Flooz</SelectItem>
                            <SelectItem value="Mixx">Mixx</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="montant_recu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant reçu</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={selectedOrder.situation_paiement === "comptant" ? resteAPayer : "0"}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        {selectedOrder.situation_paiement === "credit" && (
                          <FormDescription className="text-xs">
                            Reste à payer après: {paiements.formatAmount(resteAPayerApresPaiement)}
                          </FormDescription>
                        )}
                        {monnaieRendue > 0 && (
                          <FormDescription className="text-xs">
                            Monnaie à rendre: {paiements.formatAmount(monnaieRendue)}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(methodePaiement === "Flooz" || methodePaiement === "Mixx") && (
                    <FormField
                      control={form.control}
                      name="reference_transaction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Référence de transaction</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Entrez la référence de la transaction" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedOrder}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Valider le paiement"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
