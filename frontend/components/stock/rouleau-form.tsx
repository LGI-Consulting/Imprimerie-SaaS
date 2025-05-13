"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { inventoryApi } from "@/lib/api/inventory";
import type { NewRouleau } from "@/types/inventory";

const formSchema = z.object({
  materiau_id: z.string().min(1, "Le matériau est requis"),
  largeur: z.string().min(1, "La largeur est requise"),
  longueur_initiale: z.string().min(1, "La longueur est requise"),
  numero_rouleau: z.string().min(1, "Le numéro de rouleau est requis"),
  fournisseur: z.string().min(1, "Le fournisseur est requis"),
  prix_achat_total: z.string().min(1, "Le prix d'achat est requis"),
});

interface RouleauFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  materiaux: Array<{
    materiau_id: number;
    nom: string;
    type_materiau: string;
  }>;
}

export function RouleauForm({ onSuccess, onCancel, materiaux }: RouleauFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materiau_id: "",
      largeur: "",
      longueur_initiale: "",
      numero_rouleau: "",
      fournisseur: "",
      prix_achat_total: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const newRouleau: NewRouleau = {
        materiau_id: Number(values.materiau_id),
        largeur: Number(values.largeur),
        longueur_initiale: Number(values.longueur_initiale),
        numero_rouleau: values.numero_rouleau,
        fournisseur: values.fournisseur,
        prix_achat_total: Number(values.prix_achat_total),
      };

      await inventoryApi.createRouleau(newRouleau);
      toast.success("Rouleau ajouté avec succès");
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de l'ajout du rouleau:", error);
      toast.error("Erreur lors de l'ajout du rouleau");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="materiau_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matériau</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un matériau" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materiaux.map((materiau) => (
                    <SelectItem
                      key={materiau.materiau_id}
                      value={materiau.materiau_id.toString()}
                    >
                      {materiau.nom} ({materiau.type_materiau})
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
          name="largeur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Largeur (cm)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longueur_initiale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longueur Initiale (m)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero_rouleau"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de Rouleau</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fournisseur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fournisseur</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prix_achat_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix d'Achat Total</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 