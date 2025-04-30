"use client"

import { useState, useEffect, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Plus, Trash2, Upload, X, Percent, Euro } from "lucide-react"
import { format } from "date-fns"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useAuth } from "@/lib/context/auth-context"
import { commandes } from "@/lib/api/commandes"
import materiaux from "@/lib/api/materiaux"
import { remises } from "@/lib/api/remises"
import { formatDate, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { OrderFilesList } from "./order-files-list"

import type { 
  Commande, 
  DetailCommande, 
  Materiau, 
  PrintFile, 
  StatutCommande,
  Remise,
  StockMateriauxLargeur
} from "@/lib/api/types"

// Form schema
const formSchema = z.object({
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
  situation_paiement: z.enum(["credit", "comptant"] as const),
})

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Commande & {
    client: {
      client_id: number
      nom: string
      prenom: string
      email: string | null
      telephone: string
      adresse: string | null
    }
    details: (DetailCommande & {
      materiau: Materiau
    })[]
    files: PrintFile[]
  }
  onSuccess?: (updatedOrder: Commande | undefined) => void
}

export function EditOrderDialog({ open, onOpenChange, order, onSuccess }: EditOrderDialogProps) {
  const { user, hasRole } = useAuth()
  const [materiauList, setMateriauList] = useState<Materiau[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<PrintFile[]>(order.files || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRemise, setCurrentRemise] = useState<Remise | null>(null)
  const [remiseError, setRemiseError] = useState<string | null>(null)
  const [isCheckingRemise, setIsCheckingRemise] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<PrintFile[]>(order.files || [])
  const [uploading, setUploading] = useState(false)
  const [priceCalculation, setPriceCalculation] = useState<{
    totalPrice: number;
    unitPrice: number;
    area: number;
    selectedWidth: number;
    materialLengthUsed: number;
    optionsCost: number;
    optionsDetails: Record<string, any>;
  } | null>(null)

  // Charger la liste des matériaux
  useEffect(() => {
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
  }, [])

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

  const removeExistingFile = (fileId: number) => {
    setExistingFiles(prev => prev.filter(file => file.print_file_id !== fileId))
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      statut: order.statut,
      priorite: order.priorite,
      est_commande_speciale: order.est_commande_speciale,
      commentaires: order.commentaires || "",
      materiau_id: order.details[0]?.materiau_id || 0,
      dimensions: {
        largeur: order.details[0]?.dimensions ? parseInt(order.details[0].dimensions.split('x')[0]) : 0,
        longueur: order.details[0]?.dimensions ? parseInt(order.details[0].dimensions.split('x')[1]) : 0,
      },
      quantite: order.details[0]?.quantite || 1,
      options: order.details[0]?.commentaires ? JSON.parse(order.details[0].commentaires) : {},
      situation_paiement: order.situation_paiement,
    },
  })

  // Calculer le prix en temps réel
  const calculatePrice = useCallback(() => {
    const values = form.getValues()
    const currentMateriau = materiauList.find(m => m.materiau_id === values.materiau_id)
    
    if (!currentMateriau) return

    try {
      // Pour l'instant, on utilise une largeur fixe de 100cm pour le calcul
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

  // Recalculer le prix quand les valeurs changent
  useEffect(() => {
    calculatePrice()
  }, [form.watch(["materiau_id", "dimensions.largeur", "dimensions.longueur", "quantite", "options"]), calculatePrice])

  const handleSave = async () => {
    setLoading(true)
    try {
      const values = form.getValues()
      const updateData = {
        statut: values.statut as StatutCommande,
        priorite: values.priorite,
        est_commande_speciale: values.est_commande_speciale,
        commentaires: values.commentaires,
        details: [{
          materiau_id: values.materiau_id,
          quantite: values.quantite,
          dimensions: `${values.dimensions.largeur}x${values.dimensions.longueur}`,
          prix_unitaire: priceCalculation?.unitPrice || 0,
          commentaires: JSON.stringify(values.options || {})
        }],
        files: files.map(file => new File([], file.file_name, { type: file.mime_type || '' })),
        situation_paiement: values.situation_paiement
      }

      const updatedOrder = await commandes.update(order.commande_id, updateData)
      
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
      setLoading(false)
    }
  }

  // Vérifier les permissions selon le rôle
  const canEditStatus = hasRole(['admin', 'caisse'])
  const canEditDetails = hasRole(['admin', 'graphiste'])
  const canEditPriority = hasRole(['admin', 'caisse'])
  const canEditRemise = hasRole(['admin', 'caisse'])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Modifier la commande #{order.commande_id}</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la commande ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Détails de la commande</TabsTrigger>
            <TabsTrigger value="files">Fichiers</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-2">Client</h3>
                    <p>{order.client.prenom} {order.client.nom}</p>
                    <p>{order.client.telephone}</p>
                    {order.client.email && <p>{order.client.email}</p>}
                    {order.client.adresse && <p>{order.client.adresse}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Informations de commande</h3>
                    <p>Date: {formatDate(order.date_creation)}</p>
                    <p>Numéro: {order.numero_commande}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    {form.getValues("materiau_id") && materiauList.find(m => m.materiau_id === form.getValues("materiau_id"))?.options_disponibles && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Options disponibles</h3>
                        {Object.entries(materiauList.find(m => m.materiau_id === form.getValues("materiau_id"))?.options_disponibles || {}).map(([key, option]) => (
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
                                        field.onChange({
                                          ...field.value,
                                          quantity: parseInt(e.target.value)
                                        })
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
                  </div>
                )}

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
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-6">
              <div className="rounded-lg border border-dashed p-6" {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez des fichiers ici, ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG (max. 10MB)
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
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Fichiers existants</h4>
                <OrderFilesList 
                  files={files} 
                  loading={uploading}
                  onDelete={handleDeleteFile}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSave)}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
