"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Plus, Trash2, Upload, X } from "lucide-react"
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

import { useAuth } from "@/lib/context/auth-context"
import { commandes } from "@/lib/api/commandes"
import { materiaux } from "@/lib/api/materiaux"
import { formatDate, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

import type { 
  Commande, 
  DetailCommande, 
  Materiau, 
  PrintFile, 
  StatutCommande 
} from "@/lib/api/types"

// Form schema
const formSchema = z.object({
  statut: z.string({
    required_error: "Veuillez sélectionner un statut",
  }),
  priorite: z.number().min(0).max(5).default(1),
  est_commande_speciale: z.boolean().default(false),
  commentaires: z.string().optional(),
  details: z
    .array(
      z.object({
        materiau_id: z.number({
          required_error: "Veuillez sélectionner un matériau",
        }),
        quantite: z.number().min(1, {
          message: "La quantité doit être supérieure à 0",
        }),
        dimensions: z.string().refine((val) => {
          const [largeur, hauteur] = val.split('x').map(Number)
          return !isNaN(largeur) && !isNaN(hauteur) && largeur > 0 && hauteur > 0
        }, "Format invalide. Utilisez le format LxH (ex: 100x200)"),
        prix_unitaire: z.number().min(0, {
          message: "Le prix unitaire doit être positif",
        }),
        commentaires: z.string().optional(),
      }),
    )
    .min(1, {
      message: "Veuillez ajouter au moins un article à la commande",
    }),
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
  onSuccess?: (updatedOrder: Commande) => void
}

export function EditOrderDialog({ open, onOpenChange, order, onSuccess }: EditOrderDialogProps) {
  const { user, hasRole } = useAuth()
  const [materiauList, setMateriauList] = useState<Materiau[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<PrintFile[]>(order.files || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      details: order.details.map(detail => ({
        materiau_id: detail.materiau_id || 0,
        quantite: detail.quantite,
        dimensions: detail.dimensions || "",
        prix_unitaire: detail.prix_unitaire,
        commentaires: detail.commentaires || "",
      })),
    },
  })

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
    const details = form.getValues("details")
    return details.reduce((total, detail) => {
      return total + (detail.quantite * detail.prix_unitaire)
    }, 0)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const updateData = {
        statut: values.statut,
        priorite: values.priorite,
        est_commande_speciale: values.est_commande_speciale,
        commentaires: values.commentaires,
        details: values.details,
        files: selectedFiles,
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
      setIsSubmitting(false)
    }
  }

  // Vérifier les permissions selon le rôle
  const canEditStatus = hasRole(['admin', 'caisse'])
  const canEditDetails = hasRole(['admin', 'graphiste'])
  const canEditPriority = hasRole(['admin', 'caisse'])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Modifier la commande #{order.numero_commande}</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la commande. Les champs marqués d'un astérisque sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <p>Total: {formatCurrency(calculateTotal())}</p>
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
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Fichiers</h3>
                {existingFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Fichiers existants</h4>
                    <div className="space-y-2">
                      {existingFiles.map((file) => (
                        <div key={file.print_file_id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{file.file_name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExistingFile(file.print_file_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Mise à jour..." : "Mettre à jour la commande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
