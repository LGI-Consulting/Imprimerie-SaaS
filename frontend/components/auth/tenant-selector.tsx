"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

// Mock tenant data
const tenants = [
  { id: "1", name: "PrintTech Main Branch", role: "Admin" },
  { id: "2", name: "PrintTech Downtown", role: "Manager" },
  { id: "3", name: "PrintTech East Side", role: "Cashier" },
  { id: "4", name: "PrintTech West Mall", role: "Designer" },
  { id: "5", name: "PrintTech North Office", role: "Reception" },
]

interface TenantSelectorProps {
  email: string
  onBack: () => void
}

export function TenantSelector({ email, onBack }: TenantSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableTenants, setAvailableTenants] = useState<typeof tenants>([])
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)

  useEffect(() => {
    // Simulate loading tenants
    const loadTenants = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAvailableTenants(tenants)
      setIsLoadingTenants(false)
    }

    loadTenants()
  }, [])

  const handleContinue = async () => {
    if (!selectedTenant) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find the selected tenant to determine the role
      const tenant = tenants.find((t) => t.id === selectedTenant)

      // Redirect based on role
      if (tenant) {
        switch (tenant.role.toLowerCase()) {
          case "admin":
            router.push("/dashboard")
            break
          case "reception":
            router.push("/dashboard/reception")
            break
          case "cashier":
            router.push("/dashboard/cashier")
            break
          case "designer":
            router.push("/dashboard/designer")
            break
          default:
            router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Error logging in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Tenant</CardTitle>
        <CardDescription>Choose which tenant you want to access as {email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingTenants ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                {selectedTenant
                  ? availableTenants.find((tenant) => tenant.id === selectedTenant)?.name
                  : "Select tenant..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search tenant..." />
                <CommandEmpty>No tenant found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {availableTenants.map((tenant) => (
                      <CommandItem
                        key={tenant.id}
                        value={tenant.id}
                        onSelect={(currentValue) => {
                          setSelectedTenant(currentValue === selectedTenant ? null : currentValue)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", selectedTenant === tenant.id ? "opacity-100" : "opacity-0")}
                        />
                        <div className="flex flex-col">
                          <span>{tenant.name}</span>
                          <span className="text-xs text-muted-foreground">{tenant.role}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedTenant || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
