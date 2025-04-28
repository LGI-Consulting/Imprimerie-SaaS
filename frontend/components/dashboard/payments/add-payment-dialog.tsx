"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, CreditCard, Building, Banknote, Loader2 } from "lucide-react"
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

// Importer les types et fonctions de l'API
import { paiements } from "@/lib/api/paiements"
import { clients } from "@/lib/api/client"
import { commandes } from "@/lib/api/commandes"
import { Paiement, Facture, MethodePaiement, StatutPaiement, Commande, DetailCommande } from "@/lib/api/types"
import { generateAndDownloadPaymentPDF } from "@/lib/pdf/generate-payment-pdf"

// Form schema with conditional validation based on payment method
const formSchema = z
  .object({
    clientId: z.string({
      required_error: "Veuillez sélectionner un client",
    }),
    orderId: z.string({
      required_error: "Veuillez sélectionner une commande",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Le montant doit être un nombre positif",
    }),
    date: z.date({
      required_error: "Veuillez sélectionner une date",
    }),
    paymentMethod: z.enum(["espèces", "Flooz", "Mixx"], {
      required_error: "Veuillez sélectionner un mode de paiement",
    }),
    description: z.string().optional(),
    invoiceNumber: z.string().optional(),
    // Credit Card fields
    cardNumber: z.string().optional(),
    cardholderName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    // Bank Transfer fields
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    // Cash fields
    receivedBy: z.string().optional(),
    notes: z.string().optional(),
    // Nouveaux champs pour le paiement en espèces
    montantRecu: z.string().optional(),
    monnaieRendue: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "espèces") {
        return !!data.receivedBy && !!data.montantRecu && Number(data.montantRecu) >= Number(data.amount)
      }
      return true
    },
    {
      message: "Veuillez remplir tous les champs requis pour le mode de paiement sélectionné",
      path: ["paymentMethod"],
    },
  )

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPayment: (payment: Paiement, facture?: Facture) => void
}

export function AddPaymentDialog({ open, onOpenChange, onAddPayment }: AddPaymentDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("espèces")
  const [monnaieRendue, setMonnaieRendue] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [clientsList, setClientsList] = useState<any[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(true)
  const [clientOrders, setClientOrders] = useState<Commande[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<Commande | null>(null)
  const [orderDetails, setOrderDetails] = useState<DetailCommande[]>([])
  const [orderPayments, setOrderPayments] = useState<Paiement[]>([])
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)
  const [createdPayment, setCreatedPayment] = useState<Paiement | null>(null)
  const [createdInvoice, setCreatedInvoice] = useState<Facture | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      orderId: "",
      amount: "",
      date: new Date(),
      paymentMethod: "espèces",
      description: "",
      invoiceNumber: "",
      montantRecu: "",
      monnaieRendue: "0",
    },
  })

  // Charger les clients au chargement du composant
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true)
        const clientsData = await clients.getAll()
        setClientsList(clientsData)
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des clients",
          variant: "destructive",
        })
      } finally {
        setIsLoadingClients(false)
      }
    }

    if (open) {
      fetchClients()
    }
  }, [open, toast])

  // Charger les commandes lorsqu'un client est sélectionné
  useEffect(() => {
    const fetchClientOrders = async () => {
      const clientId = form.getValues("clientId")
      if (clientId) {
        try {
          setIsLoadingOrders(true)
          // Récupérer toutes les commandes du client
          const orders = await commandes.getByClient(Number(clientId))
          
          // Filtrer pour ne garder que celles avec le statut 'reçue'
          const pendingOrders = orders.filter(order => order.statut === 'reçue')
          
          setClientOrders(pendingOrders)
          
          // Réinitialiser la sélection de commande si la liste change
          if (pendingOrders.length === 0) {
            form.setValue("orderId", "")
            setSelectedOrder(null)
          }
        } catch (error) {
          console.error("Erreur lors du chargement des commandes:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger les commandes du client",
            variant: "destructive",
          })
        } finally {
          setIsLoadingOrders(false)
        }
      } else {
        setClientOrders([])
        setSelectedOrder(null)
      }
    }
    
    fetchClientOrders()
  }, [form.watch("clientId"), toast, form])

  // Charger les détails de la commande et les paiements lorsqu'une commande est sélectionnée
  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = form.getValues("orderId")
      if (orderId) {
        try {
          // Récupérer les détails de la commande
          const commandeData = await commandes.getById(Number(orderId))
          
          // Vérifier si les données existent
          if (commandeData && commandeData.details) {
            setOrderDetails(commandeData.details)
          } else {
            setOrderDetails([])
          }
          
          // Récupérer les paiements de la commande
          const paymentData = await paiements.getById(Number(orderId))
          
          // Vérifier si les données existent
          if (paymentData && paymentData.payment) {
            setOrderPayments([paymentData.payment])
          } else {
            setOrderPayments([])
          }
          
          // Calculer le montant total et le montant déjà payé
          if (commandeData && commandeData.details) {
            const totalAmount = commandeData.details.reduce((sum: number, detail: DetailCommande) => sum + detail.sous_total, 0)
            const paidAmount = paymentData && paymentData.payment ? paymentData.payment.montant : 0
            const remainingAmount = totalAmount - paidAmount
            
            // Mettre à jour le montant du formulaire avec le montant restant
            form.setValue("amount", remainingAmount.toString())
          }
        } catch (error) {
          console.error("Erreur lors du chargement des détails de la commande:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger les détails de la commande",
            variant: "destructive",
          })
        }
      } else {
        setOrderDetails([])
        setOrderPayments([])
      }
    }
    
    fetchOrderDetails()
  }, [form.watch("orderId"), toast, form])

  // Calculer la monnaie rendue en temps réel
  const watchAmount = form.watch("amount")
  const watchMontantRecu = form.watch("montantRecu")

  React.useEffect(() => {
    if (form.getValues("paymentMethod") === "espèces" && watchMontantRecu && watchAmount) {
      const montantRecu = Number(watchMontantRecu)
      const amount = Number(watchAmount)
      if (!isNaN(montantRecu) && !isNaN(amount)) {
        const monnaie = montantRecu - amount
        setMonnaieRendue(monnaie)
        form.setValue("monnaieRendue", monnaie.toString())
      }
    }
  }, [watchAmount, watchMontantRecu, form])

  // Calculer le montant total de la commande
  const calculateTotalAmount = () => {
    if (!orderDetails || orderDetails.length === 0) {
      return 0;
    }
    return orderDetails.reduce((sum: number, detail: DetailCommande) => sum + detail.sous_total, 0);
  }

  // Calculer le montant déjà payé
  const calculatePaidAmount = () => {
    if (!orderPayments || orderPayments.length === 0) {
      return 0;
    }
    return orderPayments.reduce((sum: number, payment: Paiement) => sum + payment.montant, 0);
  }

  // Calculer le montant restant à payer
  const calculateRemainingAmount = () => {
    return calculateTotalAmount() - calculatePaidAmount();
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setPaymentSuccess(false)
      setCreatedPayment(null)
      setCreatedInvoice(null)

      // Trouver les détails du client
      const client = clientsList.find((c) => c.id === values.clientId)
      if (!client) {
        throw new Error("Client non trouvé")
      }

      // Vérifier que le montant est valide
      const amount = Number(values.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Le montant doit être un nombre positif")
      }

      // Vérifier que le montant reçu est suffisant pour le paiement en espèces
      if (values.paymentMethod === "espèces") {
        const montantRecu = Number(values.montantRecu)
        if (isNaN(montantRecu) || montantRecu < amount) {
          throw new Error("Le montant reçu doit être supérieur ou égal au montant à payer")
        }
      }

      // Préparer les données pour l'API
      const paymentData = {
        amount: amount,
        client_id: Number(values.clientId),
        commande_id: Number(values.orderId),
        payment_method: values.paymentMethod as MethodePaiement,
        description: values.description || "",
        montant_recu: values.paymentMethod === "espèces" ? Number(values.montantRecu) : amount,
        monnaie_rendue: values.paymentMethod === "espèces" ? Number(values.monnaieRendue) : 0,
      }

      // Créer le paiement via l'API
      const result = await paiements.create(paymentData)
      
      if (result.payment) {
        setCreatedPayment(result.payment)
        if (result.facture) {
          setCreatedInvoice(result.facture)
        }
        
        setPaymentSuccess(true)
        
        toast({
          title: "Succès",
          description: "Le paiement a été enregistré avec succès",
        })
        
        // Appeler la fonction de callback avec les données créées
        onAddPayment(result.payment, result.facture)
      } else {
        throw new Error("Erreur lors de la création du paiement")
      }
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du paiement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fermer le dialogue et réinitialiser le formulaire
  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setPaymentSuccess(false)
    setCreatedPayment(null)
    setCreatedInvoice(null)
    setSelectedOrder(null)
  }

  // Update the active tab when payment method changes
  const watchPaymentMethod = form.watch("paymentMethod")
  if (watchPaymentMethod !== activeTab) {
    setActiveTab(watchPaymentMethod)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau paiement</DialogTitle>
          <DialogDescription>
            Entrez les détails du paiement ci-dessous. Les champs obligatoires sont marqués d'un astérisque.
          </DialogDescription>
        </DialogHeader>
        
        {paymentSuccess && createdPayment && createdInvoice ? (
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-green-50 p-4 text-green-800">
              <h3 className="text-lg font-medium">Paiement enregistré avec succès</h3>
              <p className="mt-1">Le paiement a été enregistré et le reçu est prêt à être téléchargé.</p>
            </div>
            
            <div className="flex justify-center">
              <DownloadPDFButton 
                paiement={createdPayment} 
                facture={createdInvoice}
                onSuccess={() => {
                  toast({
                    title: "Succès",
                    description: "Le reçu a été téléchargé avec succès",
                  })
                }}
                onError={(error) => {
                  toast({
                    title: "Erreur",
                    description: "Impossible de télécharger le reçu",
                    variant: "destructive",
                  })
                }}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client*</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Réinitialiser la sélection de commande lorsque le client change
                          form.setValue("orderId", "");
                          setSelectedOrder(null);
                        }} 
                        defaultValue={field.value}
                        disabled={isLoadingClients}
                      >
                      <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {isLoadingClients ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : clientsList && clientsList.length > 0 ? (
                            clientsList.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.nom} {client.prenom}
                          </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Aucun client trouvé
                            </div>
                          )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commande à payer*</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          const order = clientOrders.find(o => o.commande_id.toString() === value);
                          if (order) {
                            setSelectedOrder(order);
                          } else {
                            setSelectedOrder(null);
                          }
                        }} 
                        defaultValue={field.value}
                        disabled={isLoadingOrders || clientOrders.length === 0 || !form.getValues("clientId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une commande" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingOrders ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : clientOrders.length > 0 ? (
                            clientOrders.map((order) => (
                              <SelectItem key={order.commande_id} value={order.commande_id.toString()}>
                                Commande #{order.numero_commande} - {order.statut}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              {form.getValues("clientId") 
                                ? "Aucune commande en attente de paiement" 
                                : "Sélectionnez d'abord un client"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedOrder && (
                  <div className="sm:col-span-2 rounded-md bg-muted p-4 space-y-2">
                    <h4 className="font-medium">Détails de la commande</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Numéro de commande:</div>
                      <div>{selectedOrder.numero_commande}</div>
                      <div>Statut:</div>
                      <div>{selectedOrder.statut}</div>
                      <div>Montant total:</div>
                      <div>{paiements.formatAmount(calculateTotalAmount())}</div>
                      <div>Montant déjà payé:</div>
                      <div>{paiements.formatAmount(calculatePaidAmount())}</div>
                      <div>Montant restant:</div>
                      <div className="font-medium">{paiements.formatAmount(calculateRemainingAmount())}</div>
                    </div>
                  </div>
                )}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Montant*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                              {field.value ? format(field.value, "PPP") : <span>Sélectionner une date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Mode de paiement*</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setActiveTab(value)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un mode de paiement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="espèces">Espèces</SelectItem>
                          <SelectItem value="Flooz">Mobile money Moov</SelectItem>
                          <SelectItem value="Mixx">Mobile money Yas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                {form.watch("paymentMethod") === "espèces" && (
                  <>
                    <FormField
                      control={form.control}
                      name="montantRecu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant reçu*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input 
                                className="pl-7" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  const montantRecu = Number(e.target.value)
                                  const amount = Number(form.getValues("amount"))
                                  if (!isNaN(montantRecu) && !isNaN(amount)) {
                                    const monnaie = montantRecu - amount
                                    setMonnaieRendue(monnaie)
                                    form.setValue("monnaieRendue", monnaie.toString())
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monnaieRendue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monnaie rendue</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input 
                                className="pl-7 bg-muted" 
                                value={monnaieRendue.toFixed(2)}
                                readOnly 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Numéro de facture</FormLabel>
                    <FormControl>
                        <Input placeholder="FAC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Paiement pour services rendus" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="espèces" className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Espèces
                  </TabsTrigger>
                  <TabsTrigger value="Flooz" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                    Mobile money Moov
                </TabsTrigger>
                  <TabsTrigger value="Mixx" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                    Mobile money Yas
                </TabsTrigger>
              </TabsList>
                <TabsContent value="espèces" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="receivedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reçu par*</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Informations supplémentaires" {...field} />
                          </FormControl>
                          <FormDescription>Informations supplémentaires sur ce paiement en espèces</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="Flooz" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Numéro de téléphone*</FormLabel>
                        <FormControl>
                            <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nom du titulaire*</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
                <TabsContent value="Mixx" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nom du titulaire*</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>Numéro de téléphone*</FormLabel>
                        <FormControl>
                            <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer le paiement"
                  )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
