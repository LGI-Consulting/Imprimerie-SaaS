"use client"

import * as React from "react"
import { Filter, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type SortOption = "name_asc" | "name_desc" | "recent" | "oldest"

export interface ClientFilters {
  search: string
  sort: SortOption
  showActiveOnly: boolean
}

interface ClientFiltersProps {
  filters: ClientFilters
  onFiltersChange: (filters: ClientFilters) => void
  className?: string
}

export function ClientFilters({
  filters,
  onFiltersChange,
  className,
}: ClientFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    })
  }

  const handleSortChange = (sort: SortOption) => {
    onFiltersChange({
      ...filters,
      sort,
    })
  }

  const handleActiveOnlyChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      showActiveOnly: checked,
    })
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "name_asc":
        return "Nom (A-Z)"
      case "name_desc":
        return "Nom (Z-A)"
      case "recent":
        return "Plus récents"
      case "oldest":
        return "Plus anciens"
      default:
        return "Trier par"
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          placeholder="Rechercher un client..."
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filtres</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Trier par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleSortChange("name_asc")}
            className="flex items-center justify-between"
          >
            <span>Nom (A-Z)</span>
            {filters.sort === "name_asc" && <SortAsc className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortChange("name_desc")}
            className="flex items-center justify-between"
          >
            <span>Nom (Z-A)</span>
            {filters.sort === "name_desc" && <SortDesc className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortChange("recent")}
            className="flex items-center justify-between"
          >
            <span>Plus récents</span>
            {filters.sort === "recent" && <SortDesc className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortChange("oldest")}
            className="flex items-center justify-between"
          >
            <span>Plus anciens</span>
            {filters.sort === "oldest" && <SortAsc className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="flex items-center space-x-2 p-2">
            <Checkbox
              id="active-only"
              checked={filters.showActiveOnly}
              onCheckedChange={handleActiveOnlyChange}
            />
            <Label htmlFor="active-only">Clients actifs uniquement</Label>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 