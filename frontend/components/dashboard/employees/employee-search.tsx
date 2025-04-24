"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, X } from "lucide-react";
import type { Role } from "@/lib/api/types/employee.types";

// Schéma de validation pour les filtres
const searchSchema = z.object({
  query: z.string().optional(),
  role: z.enum(["admin", "accueil", "caisse", "graphiste"]).optional(),
  est_actif: z.boolean().optional(),
  date_embauche_debut: z.string().optional(),
  date_embauche_fin: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface EmployeeSearchProps {
  onSearch: (filters: SearchFormValues) => void;
  onReset: () => void;
}

export function EmployeeSearch({ onSearch, onReset }: EmployeeSearchProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
      role: undefined,
      est_actif: undefined,
      date_embauche_debut: "",
      date_embauche_fin: "",
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    onSearch(data);
  };

  const handleReset = () => {
    form.reset();
    onReset();
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Recherche simple */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Rechercher par nom, email..."
                        className="pl-8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Rechercher</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdvanced(!isAdvanced)}
            >
              {isAdvanced ? "Filtres simples" : "Filtres avancés"}
            </Button>
          </div>

          {/* Filtres avancés */}
          {isAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                name="est_actif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true" ? true : value === "false" ? false : undefined)
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Actif</SelectItem>
                        <SelectItem value="false">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_embauche_debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'embauche (début)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_embauche_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'embauche (fin)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 