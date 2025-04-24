"use client"

import * as React from "react"
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
import { Client } from "@/lib/api/types"
import { clients } from "@/lib/api/client"

interface ClientSearchProps {
  value?: Client | null
  onSelect: (client: Client | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ClientSearch({
  value,
  onSelect,
  placeholder = "Rechercher un client...",
  className,
  disabled = false,
}: ClientSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [clientsList, setClientsList] = React.useState<Client[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  const searchClients = React.useCallback(async (query: string) => {
    if (!query) {
      setClientsList([])
      return
    }

    setIsSearching(true)
    try {
      const results = await clients.search(query)
      setClientsList(results)
    } catch (error) {
      console.error("Erreur lors de la recherche de clients:", error)
      setClientsList([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value ? clients.getFullName(value) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value)
              searchClients(value)
            }}
          />
          <CommandEmpty>
            {isSearching ? "Recherche en cours..." : "Aucun client trouvé"}
          </CommandEmpty>
          <CommandGroup>
            {clientsList.map((client) => (
              <CommandItem
                key={client.client_id}
                value={clients.getFullName(client)}
                onSelect={() => {
                  onSelect(client)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value?.client_id === client.client_id ? "opacity-100" : "opacity-0"
                  )}
                />
                {clients.getFullName(client)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 