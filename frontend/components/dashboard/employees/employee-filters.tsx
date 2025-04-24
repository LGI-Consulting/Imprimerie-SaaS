"use client";

import { useState } from "react";
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
import { Filter, X } from "lucide-react";
import type { Role } from "@/lib/api/types/employee.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Schéma de validation pour les filtres
const filtersSchema = z.object({
  role: z.enum(["admin", "accueil", "caisse", "graphiste"]).optional(),
  est_actif: z.boolean().optional(),
  date_embauche_debut: z.string().optional(),
  date_embauche_fin: z.string().optional(),
  tri: z.enum(["nom_asc", "nom_desc", "date_asc", "date_desc"]).optional(),
  departement: z.string().optional(),
  performance_min: z.number().min(0).max(100).optional(),
});

type FiltersFormValues = z.infer<typeof filtersSchema>;

interface EmployeeFiltersProps {
  onFiltersChange: (filters: FiltersFormValues) => void;
  onReset: () => void;
}

export function EmployeeFilters({ onFiltersChange, onReset }: EmployeeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<FiltersFormValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      role: undefined,
      est_actif: undefined,
      date_embauche_debut: "",
      date_embauche_fin: "",
      tri: undefined,
      departement: "",
      performance_min: undefined,
    },
  });

  const onSubmit = (data: FiltersFormValues) => {
    onFiltersChange(data);
  };

  const handleReset = () => {
    form.reset();
    onReset();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Filtres avancés</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {isExpanded ? "Réduire" : "Développer"}
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtre par rôle */}
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

              {/* Filtre par statut */}
              <FormField
                control={form.control}
                name="est_actif"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Statut actif</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Afficher uniquement les employés actifs
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Filtre par département */}
              <FormField
                control={form.control}
                name="departement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du département" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Filtre par date d'embauche */}
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

              {/* Filtre par performance */}
              <FormField
                control={form.control}
                name="performance_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance minimale (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tri */}
              <FormField
                control={form.control}
                name="tri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tri</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un tri" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nom_asc">Nom (A-Z)</SelectItem>
                        <SelectItem value="nom_desc">Nom (Z-A)</SelectItem>
                        <SelectItem value="date_asc">Date d'embauche (Plus ancien)</SelectItem>
                        <SelectItem value="date_desc">Date d'embauche (Plus récent)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <Button type="submit">Appliquer les filtres</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 