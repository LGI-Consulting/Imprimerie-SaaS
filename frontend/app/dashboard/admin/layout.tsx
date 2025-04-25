"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleBasedLayout } from "@/components/dashboard/role-based-layout"
import { useAuth } from "@/lib/context/auth-context"
import { ROUTES } from "@/constants/routes"
import { employes } from "@/lib/api/employes"
import { ROLE_PERMISSIONS } from "@/types/roles"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Package,
  CreditCard,
  Printer,
  BarChart2,
  Building2,
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !hasRole(["admin"]))) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, user, hasRole, router])

  if (isLoading || !isAuthenticated || !user || !hasRole(["admin"])) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const adminNavigation = [
    {
      title: "Vue d'ensemble",
      href: ROUTES.ADMIN.BASE,
      icon: LayoutDashboard,
    },
    {
      title: "Employés",
      href: ROUTES.ADMIN.EMPLOYEES,
      icon: Users,
    },
    {
      title: "Commandes",
      href: ROUTES.CAISSE.ORDERS,
      icon: FileText,
    },
    {
      title: "Impression",
      href: ROUTES.ATELIER.BASE,
      icon: Printer,
    },
    {
      title: "Clients",
      href: ROUTES.ACCUEIL.CLIENTS,
      icon: Building2,
    },
    {
      title: "Inventaire",
      href: ROUTES.STOCK.INVENTORY,
      icon: Package,
    },
    {
      title: "Paiements",
      href: ROUTES.CAISSE.PAYMENTS,
      icon: CreditCard,
    },
    {
      title: "Rapports",
      href: ROUTES.ADMIN.REPORTS,
      icon: BarChart2,
    },
    {
      title: "Paramètres",
      href: ROUTES.ADMIN.SETTINGS,
      icon: Settings,
    },
  ]

  const userNotes = employes.getNotes(user as { notes?: string })
  const avatar = userNotes.photo_url || ""

  return (
    <RoleBasedLayout
      navigation={adminNavigation}
      role="admin"
      currentUser={{
        name: user.prenom + " " + user.nom,
        role: user.role,
        avatar,
      }}
      currentTenant={{
        name: "Print Store Management",
        logo: "/logo.png",
      }}
      permissions={ROLE_PERMISSIONS.admin}
    >
      {children}
    </RoleBasedLayout>
  )
} 