"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"
import {
  LayoutDashboard,
  FileText,
  Printer,
  Users,
  Settings,
  LogOut,
  Package,
  CreditCard,
} from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const { user, logout, hasRole } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      title: "Vue d'ensemble",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "accueil", "caisse", "graphiste"],
    },
    {
      title: "Commandes",
      href: "/dashboard/commandes",
      icon: FileText,
      roles: ["admin", "accueil", "caisse", "graphiste"],
    },
    {
      title: "Impression",
      href: "/dashboard/impression",
      icon: Printer,
      roles: ["admin", "graphiste"],
    },
    {
      title: "Clients",
      href: "/dashboard/clients",
      icon: Users,
      roles: ["admin", "accueil", "caisse"],
    },
    {
      title: "Stocks",
      href: "/dashboard/stocks",
      icon: Package,
      roles: ["admin", "accueil", "graphiste"],
    },
    {
      title: "Paiements",
      href: "/dashboard/paiements",
      icon: CreditCard,
      roles: ["admin", "caisse"],
    },
    {
      title: "Paramètres",
      href: "/dashboard/parametres",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles))

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Print Store Management
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive(item.href) ? "text-foreground" : "text-foreground/60"
                )}
              >
                <item.icon className="mr-2 h-4 w-4 inline" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Ajouter un champ de recherche ici si nécessaire */}
          </div>
          <nav className="flex items-center">
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
} 