"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Loader2, UserCog } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Client } from "@/lib/api/types"

const formSchema = z.object({
  nom: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  prenom: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().transform(val => val || ""),
  telephone: z.string().min(10, {
    message: "Le numéro de téléphone doit contenir au moins 10 chiffres.",
  }),
  adresse: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }).optional().transform(val => val || ""),
  notes: z.string().optional(),
  dette: z.number().min(0, {
    message: "La dette ne peut pas être négative.",
  }),
  depot: z.number().min(0, {
    message: "Le dépôt ne peut pas être négatif.",
  }),
})

interface EditClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
  onUpdateClient: (client: {
    client_id: number
    nom: string
    prenom: string
    email?: string | null
    telephone: string
    adresse?: string | null
    notes?: string
    dette: number
    depot: number
  }) => void
}

export function EditClientDialog({ open, onOpenChange, client, onUpdateClient }: EditClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("informations")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: client.nom,
      prenom: client.prenom,
      email: client.email || "",
      telephone: client.telephone,
      adresse: client.adresse || "",
      notes: "",
      dette: client.dette,
      depot: client.depot,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      await onUpdateClient({
        client_id: client.client_id,
        nom: values.nom,
        prenom: values.prenom,
        email: values.email || null,
        telephone: values.telephone,
        adresse: values.adresse || null,
        notes: values.notes || undefined,
        dette: values.dette,
        depot: values.depot,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Erreur lors de la mise à jour du client:", err)
      setError("Une erreur est survenue lors de la mise à jour du client. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Modifier le client
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du client ci-dessous. Les champs obligatoires sont marqués d'un astérisque.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="informations">Informations principales</TabsTrigger>
            <TabsTrigger value="details">Détails supplémentaires</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="informations">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom*</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom*</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="jean.dupont@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone*</FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adresse"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adresse complète du client"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Adresse complète incluant le code postal si possible</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informations supplémentaires sur le client"
                          className="resize-none min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ajoutez des informations complémentaires sur le client, ses préférences, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="finance">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dette</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Montant de la dette actuelle</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="depot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dépôt</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Montant du dépôt actuel</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
