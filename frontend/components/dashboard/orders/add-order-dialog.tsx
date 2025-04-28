"use client"

import { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react"
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
import { materiaux } from "@/lib/api/materiaux"
import { Materiau, Remise } from "@/lib/api/types"
import { CommandeCreate } from "@/lib/api/commandes"
import { formatCurrency } from "@/lib/api/utils"
import { toast } from "sonner"
import { clients } from "@/lib/api/client"
import { Client } from "@/lib/api/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { remises } from "@/lib/api/remises"

// Form schema
const formSchema = z.object({
  clientInfo: z.object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    telephone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide").optional(),
    adresse: z.string().optional(),
  }),
  details: z.array(z.object({
    materiau_id: z.number(),
    quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
    dimensions: z.string().refine((val) => {
      const [largeur, hauteur] = val.split('x').map(Number)
      return !isNaN(largeur) && !isNaN(hauteur) && largeur > 0 && hauteur > 0
    }, "Format invalide. Utilisez le format LxH (ex: 100x200)"),
    prix_unitaire: z.number().min(0, "Le prix unitaire doit être positif"),
    commentaires: z.string().optional(),
  })),
  commentaires: z.string().optional(),
  est_commande_speciale: z.boolean().default(false),
  priorite: z.number().min(0).max(5).default(1),
  code_remise: z.string().optional(),
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
  const [remiseInfo, setRemiseInfo] = useState<Remise | null>(null)

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
      details: [{
        materiau_id: 0,
        quantite: 1,
        dimensions: "",
        prix_unitaire: 0,
        commentaires: "",
      }],
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
      const data = await response
      setMateriauList(data)
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

  const addDetail = () => {
    const currentDetails = form.getValues("details")
    form.setValue("details", [
      ...currentDetails,
      {
        materiau_id: 0,
        quantite: 1,
        dimensions: "",
        prix_unitaire: 0,
        commentaires: "",
      }
    ])
  }

  const removeDetail = (index: number) => {
    const currentDetails = form.getValues("details")
    if (currentDetails.length > 1) {
      form.setValue("details", currentDetails.filter((_, i) => i !== index))
    }
  }

  const updatePrixUnitaire = (index: number, materiauId: number) => {
    const materiau = materiauList.find(m => m.materiau_id === materiauId)
    if (materiau) {
      const dimensions = form.getValues(`details.${index}.dimensions`)
      if (dimensions) {
        const [largeur, hauteur] = dimensions.split('x').map(Number)
        if (!isNaN(largeur) && !isNaN(hauteur)) {
          const surface = largeur * hauteur
          const prix = materiau.prix_unitaire * surface
          form.setValue(`details.${index}.prix_unitaire`, prix)
        }
      } else {
        form.setValue(`details.${index}.prix_unitaire`, materiau.prix_unitaire)
      }
    }
  }

  // Calculer le total
  const calculateTotal = () => {
    const total = form.getValues("details").reduce((sum, detail) => {
      return sum + (detail.quantite * detail.prix_unitaire);
    }, 0);
    return total;
  }

  // Vérifier le code remise
  const checkDiscountCode = useCallback(async (code: string) => {
    if (!code) {
      setRemiseInfo(null)
      return
    }

    try {
      const remise = await remises.getByCode(code)
      if (remise && remises.isValid(remise)) {
        setRemiseInfo(remise)
        toast.success("Code de remise appliqué")
      } else {
        setRemiseInfo(null)
        toast.error("Code de remise invalide ou expiré")
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du code remise:", error)
      setRemiseInfo(null)
      toast.error("Code de remise invalide")
    }
  }, [])

  // Écouter les changements de code remise
  useEffect(() => {
    const code = form.watch("code_remise")
    if (code) {
      checkDiscountCode(code)
    } else {
      setRemiseInfo(null)
    }
  }, [form.watch("code_remise"), checkDiscountCode])

  // Calculer le total avec remise
  const calculateTotalWithDiscount = () => {
    const total = calculateTotal()
    if (!remiseInfo) return total
    
    const discountAmount = remises.calculateDiscount(total, remiseInfo)
    return Math.max(0, total - discountAmount)
  }

  // Calculer le montant de la remise
  const calculateDiscountAmount = () => {
    const total = calculateTotal()
    if (!remiseInfo) return 0
    
    return remises.calculateDiscount(total, remiseInfo)
  }

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
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    form.setValue("clientInfo", {
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email || "",
      adresse: client.adresse || "",
    })
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      setError(null)

      const orderData = {
        ...data,
        files: selectedFiles,
        remise: remiseInfo ? {
          remise_id: remiseInfo.remise_id,
          code_remise: remiseInfo.code_remise,
          type: remiseInfo.type,
          valeur: remiseInfo.valeur
        } : undefined
      }

      const response = await commandes.create(orderData)
      
      toast.success("Commande créée avec succès")
      onSuccess?.(response)
      onOpenChange(false)
    } catch (err) {
      console.error("Erreur lors de la création de la commande:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      toast.error("Erreur lors de la création de la commande")
    } finally {
      setLoading(false)
    }
  }

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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Articles*</h3>
                <Button type="button" variant="outline" size="sm" onClick={addDetail}>
                  <Plus className="mr-1 h-4 w-4" /> Ajouter un article
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matériau</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.getValues("details").map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`details.${index}.materiau_id`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(parseInt(value))
                                    updatePrixUnitaire(index, parseInt(value))
                                  }}
                                  value={field.value.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {materiauList.map((materiau) => (
                                      <SelectItem 
                                        key={materiau.materiau_id} 
                                        value={materiau.materiau_id.toString()}
                                      >
                                        {materiau.nom || materiau.type_materiau}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`details.${index}.dimensions`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <FormControl>
                                  <Input {...field} placeholder="LxH" className="w-[100px]" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`details.${index}.quantite`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    className="w-[80px]" 
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`details.${index}.prix_unitaire`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <FormControl>
                                  <Input 
                                    className="w-[100px]" 
                                    {...field}
                                    value={field.value}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            form.getValues(`details.${index}.quantite`) *
                            form.getValues(`details.${index}.prix_unitaire`)
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDetail(index)}
                            disabled={form.getValues("details").length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(calculateTotal())}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
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
                name="code_remise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code de remise</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le code de remise"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Le code de remise sera appliqué automatiquement si valide
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Prix total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              {remiseInfo && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Remise ({remises.formatDiscount(remiseInfo)}):</span>
                    <span>-{formatCurrency(calculateDiscountAmount())}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total après remise:</span>
                    <span>{formatCurrency(calculateTotalWithDiscount())}</span>
                  </div>
                </>
              )}
            </div>

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
