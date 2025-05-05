"use client"

import { useState, useEffect, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Upload, X, Check, ChevronsUpDown } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { OrderFilesList } from "./order-files-list"
import { calculateOrderPrice } from "@/lib/utils/price-calculator"
import { validateStock, findSuitableMaterialWidth } from "@/lib/utils/stock-validator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/api/utils"
import { toast } from "sonner"

import { useAuth } from "@/lib/context/auth-context"
import { commandes } from "@/lib/api/commandes"
import materiaux from "@/lib/api/materiaux"
import { clients } from "@/lib/api/client"
import { Files } from "@/lib/api/files"
import type { 
  Commande, 
  DetailCommande, 
  Materiau, 
  PrintFile, 
  StatutCommande,
  StockMateriauxLargeur,
  Client
} from "@/lib/api/types"

import { MateriauxAvecStocks } from "@/lib/api/types"

// Form schema
const formSchema = z.object({
  clientInfo: z.object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    telephone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    adresse: z.string().optional().or(z.literal("")),
  }),
  statut: z.string({
    required_error: "Veuillez sélectionner un statut",
  }),
  priorite: z.number().min(0).max(5).default(1),
  est_commande_speciale: z.boolean().default(false),
  commentaires: z.string().optional(),
  materiau_id: z.number().min(1, "Le matériau est requis"),
  dimensions: z.object({
    largeur: z.number().min(1, "La largeur doit être supérieure à 0"),
    longueur: z.number().min(1, "La longueur doit être supérieure à 0"),
  }),
  quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
  options: z.record(z.any()).optional(),
  situation_paiement: z.enum(["credit", "comptant"] as const).default("comptant"),
})

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Commande & {
    client: Client
    details: (DetailCommande & {
      materiau: Materiau
    })[]
    files: PrintFile[]
  }
  onSuccess?: (updatedOrder: Commande | undefined) => void
}

export function EditOrderDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: EditOrderDialogProps) {
  const { user, hasRole } = useAuth();
  const [materiauList, setMateriauList] = useState<MateriauxAvecStocks[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<PrintFile[]>(order.files || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMateriau, setSelectedMateriau] =
    useState<MateriauxAvecStocks | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>(
    {}
  );
  const [selectedWidth, setSelectedWidth] = useState<number | null>(null)
  const [priceCalculation, setPriceCalculation] = useState<{
    totalPrice: number;
    unitPrice: number;
    area: number;
    selectedWidth: number;
    materialLengthUsed: number;
    optionsCost: number;
    optionsDetails: Record<string, any>;
    basePrice: number;
    materiau_id?: number;
    stock_id?: number;
  } | null>(null)

  // Fonction pour extraire les dimensions
  const extractDimensions = (dimensions: any) => {
    // Si c'est une chaîne au format "largeurxlongueur"
    if (typeof dimensions === 'string' && dimensions.includes('x')) {
      const [largeur, longueur] = dimensions.split('x').map(d => parseInt(d, 10));
      return { largeur, longueur };
    }
    
    // Si c'est un objet avec largeur et longueur
    if (dimensions && typeof dimensions === 'object') {
      // Essayer différentes propriétés possibles
      const largeur = dimensions.largeur || dimensions.largeur_materiau || dimensions.largeur_demandee || 0;
      const longueur = dimensions.longueur || 0;
      return { largeur, longueur };
    }
    
    // Valeur par défaut
    return { largeur: 0, longueur: 0 };
  };

  // Fonction pour gérer la fermeture du dialog
  const handleDialogClose = (isOpen: boolean) => {
    // Si le dialog se ferme
    if (!isOpen) {
      // Réinitialiser le formulaire avec les valeurs initiales de la commande
      form.reset({
        clientInfo: {
          nom: order.client.nom,
          prenom: order.client.prenom,
          telephone: order.client.telephone,
          email: order.client.email || "",
          adresse: order.client.adresse || "",
        },
        statut: order.statut,
        priorite: order.priorite,
        est_commande_speciale: order.est_commande_speciale,
        commentaires: order.commentaires || "",
        materiau_id: order.details[0]?.materiau_id || 0,
        dimensions: extractDimensions(order.details[0]?.dimensions),
        quantite: order.details[0]?.quantite || 1,
        options: order.details[0]?.commentaires ? 
          (typeof order.details[0].commentaires === 'string' ? 
            JSON.parse(order.details[0].commentaires) : 
            order.details[0].commentaires) : 
          {},
        situation_paiement: order.situation_paiement,
      });
      
      // Réinitialiser les états
      setSelectedFiles([]);
      setFiles(order.files || []);
      setError(null);
      setSelectedMateriau(null);
      setSelectedOptions({});
      setSelectedWidth(null);
      setPriceCalculation(null);
    }
    
    // Appeler la fonction onOpenChange fournie par le parent
    onOpenChange(isOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientInfo: {
        nom: order.client.nom,
        prenom: order.client.prenom,
        telephone: order.client.telephone,
        email: order.client.email || "",
        adresse: order.client.adresse || "",
      },
      statut: order.statut,
      priorite: order.priorite,
      est_commande_speciale: order.est_commande_speciale,
      commentaires: order.commentaires || "",
      materiau_id: order.details[0]?.materiau_id || 0,
      dimensions: extractDimensions(order.details[0]?.dimensions),
      quantite: order.details[0]?.quantite || 1,
      options: order.details[0]?.commentaires ? 
        (typeof order.details[0].commentaires === 'string' ? 
          JSON.parse(order.details[0].commentaires) : 
          order.details[0].commentaires) : 
        {},
      situation_paiement: order.situation_paiement,
    },
  })
  
  // Utiliser useEffect pour réinitialiser le formulaire quand la commande change
  useEffect(() => {
    if (open) {
      form.reset({
        clientInfo: {
          nom: order.client.nom,
          prenom: order.client.prenom,
          telephone: order.client.telephone,
          email: order.client.email || "",
          adresse: order.client.adresse || "",
        },
        statut: order.statut,
        priorite: order.priorite,
        est_commande_speciale: order.est_commande_speciale,
        commentaires: order.commentaires || "",
        materiau_id: order.details[0]?.materiau_id || 0,
        dimensions: extractDimensions(order.details[0]?.dimensions),
        quantite: order.details[0]?.quantite || 1,
        options: order.details[0]?.commentaires ? 
          (typeof order.details[0].commentaires === 'string' ? 
            JSON.parse(order.details[0].commentaires) : 
            order.details[0].commentaires) : 
          {},
        situation_paiement: order.situation_paiement,
      });
      
      // Réinitialiser les états
      setSelectedFiles([]);
      setFiles(order.files || []);
      setError(null);
      
      // Charger la liste des matériaux si ce n'est pas déjà fait
      if (materiauList.length === 0) {
        const loadMateriaux = async () => {
          try {
            const data = await materiaux.getAll()
            setMateriauList(data)
          } catch (error) {
            console.error('Erreur lors du chargement des matériaux:', error)
            setError('Erreur lors du chargement des matériaux')
          }
        }
        loadMateriaux()
      }
    }
  }, [open, order, form]);

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

  const removeExistingFile = async (fileId: number) => {
    try {
      await Files.delete(fileId)
      setFiles(prev => prev.filter(file => file.print_file_id !== fileId))
      toast.success("Fichier supprimé avec succès")
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error)
      toast.error("Erreur lors de la suppression du fichier")
    }
  }

  

  // Mettre à jour le matériau sélectionné quand le formulaire change
  useEffect(() => {
    const materiau_id = form.watch("materiau_id")
    const materiau = materiauList.find(m => m.materiau_id === materiau_id)
    setSelectedMateriau(materiau || null)
    setSelectedWidth(null)
    
    if (materiau && materiau.options_disponibles) {
      const initialOptions = form.getValues("options") || {}
      setSelectedOptions(initialOptions)
    }
  }, [form.watch("materiau_id"), materiauList])

  // Vérifier le stock et calculer le prix
  const checkStockAvailability = useCallback(async () => {
    const largeur = form.watch("dimensions.largeur")
    const longueur = form.watch("dimensions.longueur")
    const quantite = form.watch("quantite")
    const estCommandeSpeciale = form.watch("est_commande_speciale")

    if (!selectedMateriau) return

    if (!largeur || !longueur || !quantite) return

    try {
      const requestedWidth = largeur
      const availableWidths = selectedMateriau.stocks?.map((s) => s.largeur) || []
      const widthToUse = selectedWidth && availableWidths.includes(selectedWidth)
        ? selectedWidth
        : findSuitableMaterialWidth(requestedWidth, availableWidths)

      if (widthToUse && widthToUse !== selectedWidth) {
        setSelectedWidth(widthToUse)
      }

      const stock = selectedMateriau.stocks?.find((s) => s.largeur === widthToUse)

      if (!stock) {
        setError("Stock non disponible pour ce matériau")
        return
      }

      const result = validateStock(longueur, quantite, stock)

      if (!result.available) {
        setError(result.message || "Stock non disponible")
      } else if (result.message) {
        toast.warning(result.message)
        setError(null)
      } else {
        setError(null)
      }

      const calculation = calculateOrderPrice(
        selectedMateriau,
        stock,
        { largeur, longueur },
        quantite,
        selectedOptions,
        estCommandeSpeciale
      )

      setPriceCalculation({
        ...calculation,
        materiau_id: selectedMateriau.materiau_id,
        stock_id: stock.stock_id,
      })
    } catch (error) {
      console.error("Erreur lors de la vérification du stock:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la vérification du stock")
    }
  }, [form, selectedMateriau, selectedWidth, selectedOptions])

  // Calculer le prix
  const calculatePrice = useCallback(() => {
    const values = form.getValues()
    const currentMateriau = materiauList.find(
      (m) => m.materiau_id === values.materiau_id
    );
    
    const estCommandeSpeciale = values.est_commande_speciale

    if (!currentMateriau) return

    try {
      const stockLargeur = selectedWidth
      const stock = currentMateriau.stocks?.find((s) => s.largeur === stockLargeur) || {
        largeur: stockLargeur || 100,
        longeur_en_stock: 1000,
      } as StockMateriauxLargeur

      const calculation = calculateOrderPrice(
        currentMateriau,
        stock,
        values.dimensions,
        values.quantite,
        values.options,
        estCommandeSpeciale
      )

      let optionsCost = 0
      const optionsDetails: Record<string, any> = {}

      if (currentMateriau.options_disponibles && values.options) {
        Object.entries(values.options).forEach(([key, value]) => {
          const optionPrice = currentMateriau.options_disponibles[key]
          if (optionPrice === undefined) return

          const cost = calculation.area * optionPrice
          optionsCost += cost
          optionsDetails[key] = {
            option: key,
            quantity: 1,
            unit_price: optionPrice,
            total_price: cost,
          }
        })
      }

      const finalPrice = estCommandeSpeciale ? 0 : calculation.totalPrice + optionsCost

      setPriceCalculation({
        ...calculation,
        totalPrice: finalPrice,
        optionsCost,
        optionsDetails,
        basePrice: calculation.totalPrice,
        materiau_id: currentMateriau.materiau_id,
      })
    } catch (error) {
      console.error("Erreur de calcul:", error)
      setPriceCalculation(null)
      toast.error(error instanceof Error ? error.message : "Erreur de calcul")
    }
  }, [form, materiauList, selectedWidth])

  // Gérer le changement d'option
  const handleOptionChange = useCallback(
    (optionKey: string, isChecked: boolean) => {
      const currentOptions = { ...selectedOptions }

      if (isChecked) {
        currentOptions[optionKey] = true
      } else {
        delete currentOptions[optionKey]
      }

      form.setValue("options", currentOptions, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
      
      setSelectedOptions(currentOptions)
      calculatePrice()
      checkStockAvailability()
    },
    [form, calculatePrice, checkStockAvailability, selectedOptions]
  )

  // Mettre à jour les calculs quand les valeurs changent
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && [
        "materiau_id",
        "dimensions.largeur",
        "dimensions.longueur",
        "quantite",
        "est_commande_speciale",
      ].includes(name)) {
        calculatePrice()
        checkStockAvailability()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, calculatePrice, checkStockAvailability])

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    try {
      const uploadedFiles = await Files.upload(order.commande_id, selectedFiles)
      setFiles(prev => [...prev, ...uploadedFiles])
      setSelectedFiles([])
      toast.success("Fichiers ajoutés avec succès")
    } catch (error) {
      console.error("Erreur lors de l'upload des fichiers:", error)
      toast.error("Erreur lors de l'upload des fichiers")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setLoading(true)
    try {
      const values = form.getValues()
      
      // Validation des données
      if (!values.materiau_id || values.materiau_id <= 0) {
        setError("Veuillez sélectionner un matériau")
        return
      }
      
      if (values.dimensions.largeur <= 0 || values.dimensions.longueur <= 0) {
        setError("Les dimensions doivent être supérieures à 0")
        return
      }
      
      if (values.quantite <= 0) {
        setError("La quantité doit être supérieure à 0")
        return
      }
      
      // Trouver le stock approprié
      const stock = selectedMateriau?.stocks?.find(
        (s) => s.largeur === priceCalculation?.selectedWidth
      )

      if (!stock && !values.est_commande_speciale) {
        setError("Stock non disponible pour ce matériau")
        return
      }
      
      // Préparer les données pour l'API
      const updateData = {
        clientInfo: values.clientInfo,
        statut: values.statut as StatutCommande,
        priorite: values.priorite.toString(), // Convertir en string
        est_commande_speciale: values.est_commande_speciale,
        commentaires: values.commentaires,
        details: [{
          materiau_id: values.materiau_id,
          quantite: values.quantite,
          dimensions: `${values.dimensions.largeur}x${values.dimensions.longueur}`,
          prix_unitaire: priceCalculation?.unitPrice || 0,
          commentaires: typeof values.options === 'string' ? 
            values.options : 
            JSON.stringify(values.options || {})
        }],
        situation_paiement: values.situation_paiement,
        calculatedPrice: priceCalculation
      }

      // Mise à jour de la commande
      const updatedOrder = await commandes.update(order.commande_id, updateData)
      
      // Upload des nouveaux fichiers si nécessaire
      if (selectedFiles.length > 0) {
        await handleUploadFiles()
      }
      
      if (onSuccess) {
        onSuccess(updatedOrder)
      }
      
      toast.success("Commande mise à jour avec succès")
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error)
      setError("Erreur lors de la mise à jour de la commande")
      toast.error("Erreur lors de la mise à jour de la commande")
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Vérifier les permissions selon le rôle
  const canEditStatus = hasRole(['admin', 'caisse'])
  const canEditDetails = hasRole(['admin', 'graphiste'])
  const canEditPriority = hasRole(['admin', 'caisse'])

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la commande #{order.commande_id}</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la commande ci-dessous.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="clientInfo"
                render={() => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <div className="border rounded-md p-3">
                      <p className="font-medium">{order.client.prenom} {order.client.nom}</p>
                      <p>{order.client.telephone}</p>
                      {order.client.email && <p>{order.client.email}</p>}
                      {order.client.adresse && <p>{order.client.adresse}</p>}
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {canEditStatus && (
                  <FormField
                    control={form.control}
                    name="statut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="reçue">Reçue</SelectItem>
                            <SelectItem value="payée">Payée</SelectItem>
                            <SelectItem value="en_impression">En impression</SelectItem>
                            <SelectItem value="terminée">Terminée</SelectItem>
                            <SelectItem value="livrée">Livrée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {canEditPriority && (
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
                )}
              </div>
            </div>

            {canEditDetails && (
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
                          const materiau = materiauList.find(m => m.materiau_id === parseInt(value))
                          if (materiau) {
                            form.setValue("options", {})
                          }
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
                              {materiau.nom || materiau.type_materiau}
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

                {/* Options disponibles */}
                {selectedMateriau?.options_disponibles && (
                  <div className="space-y-2 mt-4">
                    <FormLabel>Options disponibles</FormLabel>
                    {Object.entries(selectedMateriau.options_disponibles).map(
                      ([key, price]) => {
                        const isSelected = !!form.watch(`options.${key}`)
                        const priceDisplay = price
                          ? ` (+${formatCurrency(price)} / m²)`
                          : " (gratuit)"

                        return (
                          <div key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`option-${key}`}
                              checked={isSelected}
                              onChange={(e) => {
                                handleOptionChange(key, e.target.checked)
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`option-${key}`} className="text-sm">
                              {key} {priceDisplay}
                            </label>
                          </div>
                        )
                      }
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="est_commande_speciale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
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

            {/* Section fichiers */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fichiers</h3>
              <div className="rounded-lg border border-dashed p-6" {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez des fichiers ici, ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tous formats d'impression acceptés (sans limite de taille)
                  </p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Nouveaux fichiers</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Taille</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFiles.map((file, index) => (
                          <TableRow key={index}>
                            <TableCell>{file.name}</TableCell>
                            <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Button 
                    onClick={handleUploadFiles} 
                    disabled={uploading}
                    className="mt-2"
                  >
                    {uploading ? "Téléchargement..." : "Télécharger les fichiers"}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Fichiers existants</h4>
                <OrderFilesList 
                  files={files} 
                  loading={uploading}
                  onDelete={removeExistingFile}
                />
              </div>
            </div>

            {/* Résumé des prix */}
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
