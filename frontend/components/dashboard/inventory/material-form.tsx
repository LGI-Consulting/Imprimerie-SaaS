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

import type { Materiau } from "@/lib/api/types"
import { materiaux } from "@/lib/api/materiaux"

// Schéma de validation
const materialFormSchema = z.object({
  type_materiau: z.string().min(1, "Le type de matériau est requis"),
  nom: z.string().optional(),
  description: z.string().optional(),
  prix_unitaire: z.number().min(0, "Le prix doit être positif"),
  unite_mesure: z.string().min(1, "L'unité de mesure est requise"),
  options_disponibles: z.record(z.any()).optional(),
})

type MaterialFormValues = z.infer<typeof materialFormSchema>

interface MaterialFormProps {
  initialData?: Materiau
  onSubmit?: (data: MaterialFormValues) => void
  onCancel?: () => void
}

const UNITS = [
  { value: "m²", label: "Mètre carré" },
  { value: "m", label: "Mètre linéaire" },
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

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      type_materiau: initialData?.type_materiau || "",
      nom: initialData?.nom || "",
      description: initialData?.description || "",
      prix_unitaire: initialData?.prix_unitaire || 0,
      unite_mesure: initialData?.unite_mesure || "",
      options_disponibles: initialData?.options_disponibles || {},
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
        await materiaux.create(data)
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