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