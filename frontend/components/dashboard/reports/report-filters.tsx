"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "./date-range-picker"

// Types pour les options de filtres
export interface FilterOptions {
  dateRange?: DateRange
  sortBy?: string
  sortOrder?: "asc" | "desc"
  limit?: number
  status?: string
  client?: string
  material?: string
  employee?: string
  paymentMethod?: string
  discountType?: string
  materialType?: string
  stockLevel?: string
}

interface ReportFiltersProps {
  type: "sales" | "production" | "client" | "financial" | "materials"
  onFilterChange: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

export function ReportFilters({ type, onFilterChange, initialFilters }: ReportFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {})

  // Mettre à jour les filtres et notifier le parent
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Réinitialiser les filtres
  const handleReset = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtres communs */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => handleFilterChange("dateRange", range)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trier par</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Montant</SelectItem>
                  <SelectItem value="quantity">Quantité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ordre</label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Croissant</SelectItem>
                  <SelectItem value="desc">Décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres spécifiques au type de rapport */}
          {type === "sales" && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminée</SelectItem>
                    <SelectItem value="livree">Livrée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Input
                  type="text"
                  placeholder="Rechercher un client"
                  value={filters.client}
                  onChange={(e) => handleFilterChange("client", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Matériau</label>
                <Input
                  type="text"
                  placeholder="Rechercher un matériau"
                  value={filters.material}
                  onChange={(e) => handleFilterChange("material", e.target.value)}
                />
              </div>
            </div>
          )}

          {type === "production" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employé</label>
                <Input
                  type="text"
                  placeholder="Rechercher un employé"
                  value={filters.employee}
                  onChange={(e) => handleFilterChange("employee", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminée</SelectItem>
                    <SelectItem value="livree">Livrée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "financial" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Méthode de paiement</label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => handleFilterChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carte">Carte bancaire</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type de remise</label>
                <Select
                  value={filters.discountType}
                  onValueChange={(value) => handleFilterChange("discountType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pourcentage">Pourcentage</SelectItem>
                    <SelectItem value="montant">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "materials" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de matériau</label>
                <Select
                  value={filters.materialType}
                  onValueChange={(value) => handleFilterChange("materialType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="papier">Papier</SelectItem>
                    <SelectItem value="encre">Encre</SelectItem>
                    <SelectItem value="toner">Toner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau de stock</label>
                <Select
                  value={filters.stockLevel}
                  onValueChange={(value) => handleFilterChange("stockLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bas">Stock bas</SelectItem>
                    <SelectItem value="moyen">Stock moyen</SelectItem>
                    <SelectItem value="eleve">Stock élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 