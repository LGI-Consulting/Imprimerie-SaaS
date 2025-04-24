"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Types de matériaux prédéfinis
const MATERIAL_TYPES = [
  { value: "bâche", label: "Bâche" },
  { value: "autocollant", label: "Autocollant" },
  { value: "banner", label: "Banner" },
  { value: "papier", label: "Papier" },
  { value: "vinyle", label: "Vinyle" },
  { value: "toile", label: "Toile" },
  { value: "dibond", label: "Dibond" },
  { value: "aluminium", label: "Aluminium" },
  { value: "plexiglas", label: "Plexiglas" },
  { value: "mousse", label: "Mousse" },
] as const

interface MaterialTypeSelectProps {
  name: string
  label?: string
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
  onValueChange?: (value: string) => void
}

export function MaterialTypeSelect({
  name,
  label = "Type de matériau",
  placeholder = "Sélectionner un type...",
  className,
  required = false,
  disabled = false,
  onValueChange,
}: MaterialTypeSelectProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const form = useFormContext()

  // Mettre à jour la valeur du champ du formulaire
  const handleSelect = (currentValue: string) => {
    setValue(currentValue)
    setOpen(false)
    form.setValue(name, currentValue, { shouldValidate: true })
    onValueChange?.(currentValue)
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label && <FormLabel>{label}{required && " *"}</FormLabel>}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {field.value
                    ? MATERIAL_TYPES.find((type) => type.value === field.value)?.label
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Rechercher un type..." />
                <CommandEmpty>Aucun type trouvé.</CommandEmpty>
                <CommandGroup>
                  {MATERIAL_TYPES.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={type.value}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value === type.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {type.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 