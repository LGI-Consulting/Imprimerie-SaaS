"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { UserRole, UserPermissions } from "@/types/roles"
import { ROUTES } from "@/constants/routes"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Printer,
  Package,
  CreditCard,
  BarChart,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission: keyof UserPermissions
}

const navItems: Record<UserRole, NavItem[]> = {
  admin: [
    {
      title: "Vue d'ensemble",
      href: ROUTES.ADMIN.BASE,
      icon: LayoutDashboard,
      permission: "canViewDashboard",
    },
    {
      title: "Employés",
      href: ROUTES.ADMIN.EMPLOYEES,
      icon: Users,
      permission: "canManageUsers",
    },
    {
      title: "Paramètres",
      href: ROUTES.ADMIN.SETTINGS,
      icon: Settings,
      permission: "canManageSettings",
    },
    {
      title: "Rapports",
      href: ROUTES.ADMIN.REPORTS,
      icon: BarChart,
      permission: "canViewReports",
    },
  ],
  caisse: [
    {
      title: "Vue d'ensemble",
      href: ROUTES.CAISSE.BASE,
      icon: LayoutDashboard,
      permission: "canViewDashboard",
    },
    {
      title: "Paiements",
      href: ROUTES.CAISSE.PAYMENTS,
      icon: CreditCard,
      permission: "canManagePayments",
    },
    {
      title: "Commandes",
      href: ROUTES.CAISSE.ORDERS,
      icon: FileText,
      permission: "canManageOrders",
    },
  ],
  graphiste: [
    {
      title: "Vue d'ensemble",
      href: ROUTES.ATELIER.BASE,
      icon: LayoutDashboard,
      permission: "canViewDashboard",
    },
    {
      title: "File d'attente",
      href: ROUTES.ATELIER.QUEUE,
      icon: Printer,
      permission: "canManageOrders",
    },
    {
      title: "Fichiers",
      href: ROUTES.ATELIER.FILES,
      icon: FileText,
      permission: "canManageOrders",
    },
    {
      title: "Production",
      href: ROUTES.ATELIER.PRODUCTION,
      icon: Printer,
      permission: "canManageOrders",
    },
  ],
  accueil: [
    {
      title: "Vue d'ensemble",
      href: ROUTES.ACCUEIL.BASE,
      icon: LayoutDashboard,
      permission: "canViewDashboard",
    },
    {
      title: "Commandes",
      href: ROUTES.ACCUEIL.ORDERS,
      icon: FileText,
      permission: "canManageOrders",
    },
    {
      title: "Clients",
      href: ROUTES.ACCUEIL.CLIENTS,
      icon: Users,
      permission: "canManageOrders",
    },
  ],
  stock: [
    {
      title: "Vue d'ensemble",
      href: ROUTES.STOCK.BASE,
      icon: LayoutDashboard,
      permission: "canViewDashboard",
    },
    {
      title: "Inventaire",
      href: ROUTES.STOCK.INVENTORY,
      icon: Package,
      permission: "canManageInventory",
    },
    {
      title: "Alertes",
      href: ROUTES.STOCK.ALERTS,
      icon: BarChart,
      permission: "canViewReports",
    },
  ],
}

interface DynamicNavProps {
  userRole: UserRole
  permissions: UserPermissions
}

export function DynamicNav({ userRole, permissions }: DynamicNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const filteredNavItems = navItems[userRole].filter(
    (item) => permissions[item.permission]
  )

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive(item.href)
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="mr-2 h-4 w-4 inline" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 