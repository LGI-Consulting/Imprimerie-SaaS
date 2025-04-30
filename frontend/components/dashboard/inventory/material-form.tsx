"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, X } from "lucide-react"

import type { Materiau, StockMateriauxLargeur } from "@/lib/api/types"
import materiaux from "@/lib/api/materiaux"

// Interface étendue pour les matériaux avec leurs stocks
interface MateriauAvecStocks extends Materiau {
  stocks: StockMateriauxLargeur[];
}

// Schéma de validation
const materialFormSchema = z.object({
  type_materiau: z.string().min(1, "Le type de matériau est requis"),
  nom: z.string().optional(),
  description: z.string().optional(),
  prix_unitaire: z.number().min(0, "Le prix doit être positif"),
  unite_mesure: z.string().min(1, "L'unité de mesure est requise"),
  options_disponibles: z.record(z.any()).optional(),
  largeurs: z.array(
    z.object({
      largeur: z.number().min(1, "La largeur doit être positive"),
      longeur_en_stock: z.number().min(0, "Le stock ne peut pas être négatif"),
      seuil_alerte: z.number().min(0, "Le seuil ne peut pas être négatif"),
    })
  ).optional(),
})

type MaterialFormValues = z.infer<typeof materialFormSchema>

interface MaterialFormProps {
  initialData?: MateriauAvecStocks
  onSubmit?: (data: MaterialFormValues) => void
  onCancel?: () => void
}

const UNITS = [
  { value: "cm", label: "Centimètre (prix en m²)" },
  { value: "cm_lineaire", label: "Centimètre linéaire (prix en m)" },
  { value: "unité", label: "Unité" },
]

const MATERIAL_TYPES = [
  { value: "bâche", label: "Bâche" },
  { value: "autocollant", label: "Autocollant" },
  { value: "banner", label: "Banner" },
  { value: "papier", label: "Papier" },
]

export function MaterialForm({ initialData, onSubmit, onCancel }: MaterialFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const defaultLargeurs = initialData?.stocks?.map(stock => ({
    largeur: stock.largeur,
    longeur_en_stock: stock.longeur_en_stock,
    seuil_alerte: stock.seuil_alerte,
  })) || [];

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      type_materiau: initialData?.type_materiau || "",
      nom: initialData?.nom || "",
      description: initialData?.description || "",
      prix_unitaire: initialData?.prix_unitaire || 0,
      unite_mesure: initialData?.unite_mesure || "",
      options_disponibles: initialData?.options_disponibles || {},
      largeurs: defaultLargeurs.length > 0 ? defaultLargeurs : [{ largeur: 0, longeur_en_stock: 0, seuil_alerte: 0 }],
    },
  })

  const handleSubmit = async (data: MaterialFormValues) => {
    try {
      setIsLoading(true)
      
      if (initialData) {
        await materiaux.update(initialData.materiau_id, data)
        toast({
          title: "Succès",
          description: "Le matériau a été mis à jour avec succès",
        })
      } else {
        // Assurer qu'il y a au moins une largeur pour créer le matériau
        if (!data.largeurs || data.largeurs.length === 0) {
          toast({
            title: "Erreur",
            description: "Au moins une largeur est requise",
            variant: "destructive",
          })
          return;
        }

        // S'assurer que les valeurs de largeur sont valides
        const validLargeurs = data.largeurs.filter(l => l.largeur > 0);
        if (validLargeurs.length === 0) {
          toast({
            title: "Erreur",
            description: "Veuillez ajouter au moins une largeur valide",
            variant: "destructive",
          })
          return;
        }

        await materiaux.create({
          type_materiau: data.type_materiau,
          description: data.description,
          prix_unitaire: data.prix_unitaire,
          unite_mesure: data.unite_mesure,
          options_disponibles: data.options_disponibles,
          largeurs: validLargeurs,
        })
        toast({
          title: "Succès",
          description: "Le matériau a été créé avec succès",
        })
      }

      onSubmit?.(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour ajouter une nouvelle largeur
  const addLargeur = () => {
    const currentLargeurs = form.getValues("largeurs") || [];
    form.setValue("largeurs", [
      ...currentLargeurs,
      { largeur: 0, longeur_en_stock: 0, seuil_alerte: 0 }
    ]);
  };

  // Fonction pour supprimer une largeur
  const removeLargeur = (index: number) => {
    const currentLargeurs = form.getValues("largeurs") || [];
    if (currentLargeurs.length > 1) {
      form.setValue("largeurs", 
        currentLargeurs.filter((_, i) => i !== index)
      );
    }
  };

  // Obtenir les largeurs actuelles de manière sécurisée
  const currentLargeurs = form.watch("largeurs") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Modifier le matériau" : "Nouveau matériau"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type_materiau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de matériau</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MATERIAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du matériau" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optionnel - Nom spécifique du matériau
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du matériau"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optionnel - Description détaillée du matériau
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prix_unitaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix unitaire</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unite_mesure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unité de mesure</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une unité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Largeurs disponibles</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addLargeur}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              {currentLargeurs.map((_, index) => (
                <div key={index} className="flex gap-2 mb-2 items-end">
                  <FormField
                    control={form.control}
                    name={`largeurs.${index}.largeur`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Largeur (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Largeur"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`largeurs.${index}.longeur_en_stock`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Stock initial</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Stock"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`largeurs.${index}.seuil_alerte`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Seuil d'alerte</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Seuil"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLargeur(index)}
                    disabled={currentLargeurs.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {currentLargeurs.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Aucune largeur ajoutée. Cliquez sur "Ajouter" pour en créer une.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 