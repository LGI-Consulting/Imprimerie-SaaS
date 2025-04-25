"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleBasedLayout } from "@/components/dashboard/role-based-layout"
import { useAuth } from "@/lib/context/auth-context"
import { ROUTES } from "@/constants/routes"
import { employes } from "@/lib/api/employes"
import { ROLE_PERMISSIONS } from "@/types/roles"
import {
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react"

interface StockLayoutProps {
  children: React.ReactNode
}

export default function StockLayout({ children }: StockLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !hasRole(["admin", "accueil", "graphiste"]))) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, user, hasRole, router])

  if (isLoading || !isAuthenticated || !user || !hasRole(["admin", "accueil", "graphiste"])) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const stockNavigation = [
    {
      title: "Inventaire",
      href: ROUTES.STOCK.INVENTORY,
      icon: Package,
    },
    {
      title: "Alertes",
      href: ROUTES.STOCK.ALERTS,
      icon: AlertTriangle,
    },
    {
      title: "Statistiques",
      href: ROUTES.STOCK.STATS,
      icon: BarChart3,
    },
  ]

  const userNotes = employes.getNotes(user as { notes?: string })
  const avatar = userNotes.photo_url || ""

  return (
    <RoleBasedLayout
      navigation={stockNavigation}
      role={user.role}
      currentUser={{
        name: user.prenom + " " + user.nom,
        role: user.role,
        avatar,
      }}
      currentTenant={{
        name: "Print Store Management",
        logo: "/logo.png",
      }}
      permissions=""
    >
      {children}
    </RoleBasedLayout>
  )
} 