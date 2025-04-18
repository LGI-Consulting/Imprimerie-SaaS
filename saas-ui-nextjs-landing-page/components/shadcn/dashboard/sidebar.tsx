"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  UserRound,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "#components/lib/utils"
import { Button } from "#components/shadcn/ui/button"
import { ScrollArea } from "#components/shadcn/ui/scroll-area"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentUser: {
    name: string
    role: string
    avatar: string
  }
  currentTenant: {
    name: string
    logo: string
  }
}

export function DashboardSidebar({ isOpen, onToggle, currentUser, currentTenant }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      name: "Clients",
      href: "/dashboard/clients",
      icon: Users,
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
    },
    {
      name: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      name: "Employees",
      href: "/dashboard/employees",
      icon: UserRound,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div
      className={cn(
        "relative h-full border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn("flex items-center gap-2", !isOpen && "justify-center w-full")}>
          <img src={currentTenant.logo || "/placeholder.svg"} alt={currentTenant.name} className="h-8 w-8 rounded-md" />
          {isOpen && <span className="font-semibold truncate">{currentTenant.name}</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8", !isOpen && "absolute -right-4 top-7 z-10 bg-background border rounded-full")}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="py-4">
          <nav className="space-y-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === route.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-muted",
                  !isOpen && "justify-center px-0",
                )}
              >
                <route.icon className="h-5 w-5" />
                {isOpen && <span>{route.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </div>
  )
}
