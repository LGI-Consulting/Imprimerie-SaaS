"use client";

import { EmployeesList } from "@/components/dashboard/employees/employees-list";
import { EmployeeFilters } from "@/components/dashboard/employees/employee-filters";
import { EmployeeSearch } from "@/components/dashboard/employees/employee-search";
import { useState } from "react";
import type { Role } from "@/lib/api/types/employee.types";

type FiltersFormValues = {
  role?: Role;
  est_actif?: boolean;
  date_embauche_debut?: string;
  date_embauche_fin?: string;
  tri?: "nom_asc" | "nom_desc" | "date_asc" | "date_desc";
  departement?: string;
  performance_min?: number;
};

type SearchFormValues = {
  query?: string;
  role?: Role;
  est_actif?: boolean;
  date_embauche_debut?: string;
  date_embauche_fin?: string;
};

export default function EmployeesPage() {
  const [filters, setFilters] = useState<FiltersFormValues>({});
  const [search, setSearch] = useState<SearchFormValues>({});

  const handleFiltersChange = (newFilters: FiltersFormValues) => {
    setFilters(newFilters);
  };

  const handleSearch = (newSearch: SearchFormValues) => {
    setSearch(newSearch);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleResetSearch = () => {
    setSearch({});
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Employés</h1>
      </div>

      <div className="space-y-6">
        <EmployeeSearch
          onSearch={handleSearch}
          onReset={handleResetSearch}
        />

        <EmployeeFilters
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        <EmployeesList />
      </div>
    </div>
  );
} 