"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { employes } from "@/lib/api/employes"
import { useToast } from "@/components/ui/use-toast"
import type { Employe } from "@/lib/api/types/employee.types"

const employeeSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 caractères"),
  role: z.enum(["admin", "accueil", "caisse", "graphiste"]),
  password: z.string().optional(),
  date_embauche: z.string().min(1, "La date d'embauche est requise"),
  notes: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export interface EditEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employe | null
  onSuccess: () => void
}

export function EditEmployeeDialog({ open, onOpenChange, employee, onSuccess }: EditEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      role: "accueil",
      password: "",
      date_embauche: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  useEffect(() => {
    if (employee) {
      form.reset({
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        telephone: employee.telephone,
        role: employee.role,
        password: "",
        date_embauche: employee.date_embauche,
        notes: employee.notes || "",
      })
    }
  }, [employee, form])

  const onSubmit = async (data: EmployeeFormValues) => {
    if (!employee) return

    try {
      setIsSubmitting(true)
      
      const updateData = { ...data }
      if (!updateData.password) {
        delete updateData.password
      }
      
      await employes.update(employee.employe_id, updateData)
      
      toast({
        title: "Succès",
        description: "Employé mis à jour avec succès",
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'employé",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'employé</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'employé. Laissez le mot de passe vide pour le conserver.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
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
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemple.com" {...field} />
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
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="accueil">Accueil</SelectItem>
                      <SelectItem value="caisse">Caisse</SelectItem>
                      <SelectItem value="graphiste">Graphiste</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Laissez vide pour conserver" {...field} />
                  </FormControl>
                  <FormDescription>
                    Laissez vide pour conserver le mot de passe actuel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_embauche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'embauche</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input placeholder="Notes additionnelles" {...field} />
                  </FormControl>
                  <FormDescription>
                    Informations supplémentaires (optionnel).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Mise à jour en cours..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
