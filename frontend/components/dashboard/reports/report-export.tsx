"use client"

import { useState } from "react"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DateRangePicker } from "./date-range-picker"
import type { FilterOptions } from "./report-filters"

// Types pour les options d'export
interface ExportOptions {
  format: "pdf" | "excel" | "csv"
  dateRange?: DateRange
  filters?: FilterOptions
  columns: string[]
  includeHeader: boolean
  includeFooter: boolean
  language: "fr" | "en"
}

interface ReportExportProps {
  type: "sales" | "production" | "client" | "financial" | "materials"
  data: any
  filters?: FilterOptions
  onExport: (options: ExportOptions) => Promise<void>
}

export function ReportExport({ type, data, filters, onExport }: ReportExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    dateRange: filters?.dateRange,
    filters,
    columns: getDefaultColumns(type),
    includeHeader: true,
    includeFooter: true,
    language: "fr",
  })

  // Obtenir les colonnes par défaut selon le type de rapport
  function getDefaultColumns(type: string): string[] {
    switch (type) {
      case "sales":
        return ["date", "client", "amount", "status"]
      case "production":
        return ["date", "employee", "status", "processingTime"]
      case "client":
        return ["name", "orders", "totalSpent", "lastOrder"]
      case "financial":
        return ["date", "paymentMethod", "amount", "discount"]
      case "materials":
        return ["name", "type", "stockLevel", "cost"]
      default:
        return []
    }
  }

  // Mettre à jour les options d'export
  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  // Gérer l'export
  const handleExport = async () => {
    try {
      setIsExporting(true)
      await onExport(options)
      setIsOpen(false)
    } catch (error) {
      console.error("Error exporting report:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Exporter</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Options d'export</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Format d'export */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={options.format}
              onValueChange={(value) => handleOptionChange("format", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Période */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Période</label>
            <DateRangePicker
              value={options.dateRange}
              onChange={(range) => handleOptionChange("dateRange", range)}
            />
          </div>

          {/* Colonnes à inclure */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Colonnes à inclure</label>
            <div className="grid grid-cols-2 gap-2">
              {getDefaultColumns(type).map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={options.columns.includes(column)}
                    onCheckedChange={(checked) => {
                      const newColumns = checked
                        ? [...options.columns, column]
                        : options.columns.filter((c) => c !== column)
                      handleOptionChange("columns", newColumns)
                    }}
                  />
                  <label
                    htmlFor={column}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {column}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Options de mise en page */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mise en page</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="header"
                checked={options.includeHeader}
                onCheckedChange={(checked) => handleOptionChange("includeHeader", checked)}
              />
              <label
                htmlFor="header"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Inclure l'en-tête
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="footer"
                checked={options.includeFooter}
                onCheckedChange={(checked) => handleOptionChange("includeFooter", checked)}
              />
              <label
                htmlFor="footer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Inclure le pied de page
              </label>
            </div>
          </div>

          {/* Langue */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Langue</label>
            <Select
              value={options.language}
              onValueChange={(value) => handleOptionChange("language", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exportation..." : "Exporter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 