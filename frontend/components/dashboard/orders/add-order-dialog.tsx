"use client"

import { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Plus, Trash2, Upload, User } from "lucide-react"
import { useDropzone } from 'react-dropzone'

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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { commandes } from "@/lib/api/commandes"
import materiaux from "@/lib/api/materiaux"
import { Materiau, StockMateriauxLargeur, SituationPaiement, MateriauxAvecStocks } from "@/lib/api/types"
import { formatCurrency } from "@/lib/api/utils"
import { toast } from "sonner"
import { clients } from "@/lib/api/client"
import { Client } from "@/lib/api/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/context/auth-context"
import { calculateOrderPrice } from "@/lib/utils/price-calculator"

// Form schema
const formSchema = z.object({
  clientInfo: z.object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    telephone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    adresse: z.string().optional().or(z.literal("")),
  }),
  materiau_id: z.number().min(1, "Le matériau est requis"),
  dimensions: z.object({
    largeur: z.number().min(1, "La largeur doit être supérieure à 0"),
    longueur: z.number().min(1, "La longueur doit être supérieure à 0"),
  }),
  quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
  options: z.record(z.any()).optional(),
  situation_paiement: z.enum(["credit", "comptant"] as const),
  commentaires: z.string().optional(),
  est_commande_speciale: z.boolean().default(false),
  priorite: z.number().min(0).max(5).default(1),
})

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: any) => void
}

export function AddOrderDialog({ open, onOpenChange, onSuccess }: AddOrderDialogProps) {
  const [materiauList, setMateriauList] = useState<Materiau[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [clientsList, setClientsList] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [priceCalculation, setPriceCalculation] = useState<{
    totalPrice: number;
    unitPrice: number;
    area: number;
    selectedWidth: number;
    materialLengthUsed: number;
    optionsCost: number;
    optionsDetails: Record<string, any>;
  } | null>(null)
  const { user } = useAuth()
  const [selectedMateriau, setSelectedMateriau] = useState<Materiau | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({})

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientInfo: {
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        adresse: "",
      },
      materiau_id: 0,
      dimensions: {
        largeur: 0,
        longueur: 0,
      },
      quantite: 1,
      situation_paiement: "comptant",
      commentaires: "",
      est_commande_speciale: false,
      priorite: 1,
    },
  })

  // Charger la liste des matériaux
  const loadMateriaux = useCallback(async () => {
    try {
      const response = await materiaux.getAll()
      if (!response) throw new Error('Erreur lors du chargement des matériaux')
      setMateriauList(response)
    } catch (error) {
      console.error('Erreur lors du chargement des matériaux:', error)
      setError('Erreur lors du chargement des matériaux')
    }
  }, [])

  // Charger les matériaux au montage du composant
  useEffect(() => {
    loadMateriaux()
  }, [loadMateriaux])

  // Configuration de dropzone pour les fichiers
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: (acceptedFiles) => {
      setSelectedFiles(prev => [...prev, ...acceptedFiles])
    }
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Calculer le prix en temps réel
  const calculatePrice = useCallback(() => {
    const values = form.getValues()
    const currentMateriau = materiauList.find(m => m.materiau_id === values.materiau_id)
    
    if (!currentMateriau) return

    try {
      // Pour l'instant, on utilise une largeur fixe de 100cm pour le calcul
      // Dans une version future, nous pourrions récupérer les stocks disponibles
      const stock = {
        largeur: 100,
        longeur_en_stock: 1000
      } as StockMateriauxLargeur

      const calculation = calculateOrderPrice(
        currentMateriau,
        stock,
        values.dimensions,
        values.quantite
      )

      // Calculer le coût des options
      let optionsCost = 0
      const optionsDetails: Record<string, any> = {}

      if (currentMateriau.options_disponibles && values.options) {
        Object.entries(values.options).forEach(([key, value]) => {
          const option = currentMateriau.options_disponibles[key]
          if (option && !option.is_free) {
            let cost = 0
            if (option.type === "fixed") {
              cost = option.price || 0
            } else if (option.type === "per_sqm") {
              cost = calculation.area * (option.price || 0)
            } else if (option.type === "per_unit" && value.quantity) {
              cost = value.quantity * (option.price || 0)
            }
            optionsCost += cost * values.quantite
            optionsDetails[key] = {
              option: key,
              quantity: value.quantity || 1,
              unit_price: cost,
              total_price: cost * values.quantite,
            }
          }
        })
      }

      setPriceCalculation({
        ...calculation,
        totalPrice: calculation.totalPrice + optionsCost,
        optionsCost,
        optionsDetails
      })
    } catch (error) {
      setPriceCalculation(null)
      toast.error(error instanceof Error ? error.message : "Erreur de calcul")
    }
  }, [form, materiauList])

  // Mettre à jour les options quand le matériau change
  const handleMateriauChange = useCallback((materiauId: number) => {
    const materiau = materiauList.find(m => m.materiau_id === materiauId)
    setSelectedMateriau(materiau || null)
    setSelectedOptions({})
    form.setValue("options", {})
  }, [materiauList, form])

  // Recalculer le prix quand les valeurs changent
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && ['materiau_id', 'dimensions.largeur', 'dimensions.longueur', 'quantite', 'options'].includes(name)) {
        calculatePrice()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, calculatePrice])

  // Rechercher des clients
  const searchClients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setClientsList([])
      return
    }

    setIsSearching(true)
    try {
      const results = await clients.search(query)
      setClientsList(results)
    } catch (error) {
      console.error('Erreur lors de la recherche des clients:', error)
      toast.error('Erreur lors de la recherche des clients')
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Sélectionner un client
  const handleClientSelect = useCallback((client: Client) => {
    setSelectedClient(client)
    form.setValue("clientInfo", {
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email || "",
      adresse: client.adresse || "",
    })
  }, [form])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Vérifier que les champs obligatoires sont présents
      if (!data.clientInfo.nom || !data.clientInfo.prenom || !data.clientInfo.telephone) {
        throw new Error("Les informations client sont incomplètes");
      }

      // Préparer les données client
      const clientInfo = {
        nom: data.clientInfo.nom.trim(),
        prenom: data.clientInfo.prenom.trim(),
        telephone: data.clientInfo.telephone.trim(),
        email: data.clientInfo.email?.trim() || undefined,
        adresse: data.clientInfo.adresse?.trim() || undefined
      };

      // Vérifier que les champs obligatoires ne sont pas vides après le trim
      if (!clientInfo.nom || !clientInfo.prenom || !clientInfo.telephone) {
        throw new Error("Les champs obligatoires ne peuvent pas être vides");
      }

      // Préparer les données de la commande
      const orderData = {
        clientInfo,
        materialType: data.materiau_id.toString(),
        width: parseFloat(data.dimensions.largeur.toString()),
        length: parseFloat(data.dimensions.longueur.toString()),
        quantity: parseInt(data.quantite.toString(), 10),
        options: {
          comments: data.commentaires || undefined,
          priorite: data.priorite?.toString() || undefined
        }
      };

      // Créer la commande
      const response = await commandes.create(orderData, selectedFiles);
      
      toast.success("La commande a été créée avec succès");
      
      onSuccess?.(response);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de la commande"
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de la commande"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle commande</DialogTitle>
          <DialogDescription>
            Créez une nouvelle commande en remplissant les informations ci-dessous.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="clientInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedClient ? clients.getFullName(selectedClient) : "Sélectionner un client..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Rechercher un client..."
                            value={clientSearch}
                            onValueChange={(value) => {
                              setClientSearch(value)
                              searchClients(value)
                            }}
                          />
                          <CommandEmpty>
                            {isSearching ? "Recherche en cours..." : "Aucun client trouvé"}
                          </CommandEmpty>
                          <CommandGroup>
                            {clientsList.map((client) => (
                              <CommandItem
                                key={client.client_id}
                                value={clients.getFullName(client)}
                                onSelect={() => handleClientSelect(client)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedClient?.client_id === client.client_id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {clients.getFullName(client)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Recherchez un client existant ou créez-en un nouveau ci-dessous.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientInfo.nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientInfo.prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientInfo.telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientInfo.adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="materiau_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matériau</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value))
                        handleMateriauChange(parseInt(value))
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un matériau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materiauList.map((materiau) => (
                          <SelectItem 
                            key={materiau.materiau_id} 
                            value={materiau.materiau_id.toString()}
                          >
                            {materiau.type_materiau}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dimensions.largeur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largeur (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.longueur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longueur (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quantite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="situation_paiement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mode de paiement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="comptant">Comptant</SelectItem>
                        <SelectItem value="credit">Crédit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Fichiers</h3>
                <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-primary">
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Glissez-déposez des fichiers ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG jusqu'à 10MB
                  </p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="est_commande_speciale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-primary"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Commande spéciale
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priorite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Normale</SelectItem>
                          <SelectItem value="2">Moyenne</SelectItem>
                          <SelectItem value="3">Haute</SelectItem>
                          <SelectItem value="4">Très haute</SelectItem>
                          <SelectItem value="5">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="commentaires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informations supplémentaires sur la commande" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Toute information additionnelle concernant cette commande</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedMateriau?.options_disponibles && Object.entries(selectedMateriau.options_disponibles).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Options disponibles</h3>
                {Object.entries(selectedMateriau.options_disponibles).map(([key, option]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`options.${key}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={!!field.value}
                            onChange={(e) => {
                              const newValue = e.target.checked ? { quantity: 1 } : undefined
                              field.onChange(newValue)
                              setSelectedOptions(prev => ({
                                ...prev,
                                [key]: newValue
                              }))
                            }}
                            className="accent-primary"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.name || key} {option.price ? `(+${formatCurrency(option.price)})` : ''}
                        </FormLabel>
                        {option.type === "per_unit" && field.value && (
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              value={field.value.quantity || 1}
                              onChange={(e) => {
                                const newValue = {
                                  ...field.value,
                                  quantity: parseInt(e.target.value)
                                }
                                field.onChange(newValue)
                                setSelectedOptions(prev => ({
                                  ...prev,
                                  [key]: newValue
                                }))
                              }}
                              className="w-20"
                            />
                          </FormControl>
                        )}
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

            {priceCalculation && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Prix unitaire:</span>
                  <span>{formatCurrency(priceCalculation.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface totale:</span>
                  <span>{priceCalculation.area.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Longueur de matériau utilisée:</span>
                  <span>{priceCalculation.materialLengthUsed.toFixed(2)} m</span>
                </div>
                {priceCalculation.optionsCost > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Coût des options:</span>
                    <span>{formatCurrency(priceCalculation.optionsCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Prix total:</span>
                  <span>{formatCurrency(priceCalculation.totalPrice)}</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer la commande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
