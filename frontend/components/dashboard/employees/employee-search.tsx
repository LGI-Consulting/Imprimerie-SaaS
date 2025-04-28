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
           
          </div>

        

         
        </form>
      </Form>
    </div>
  );
} 