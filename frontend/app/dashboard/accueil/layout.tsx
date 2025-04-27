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
  FileText,
  Users,
  Package,
} from "lucide-react"

interface AccueilLayoutProps {
  children: React.ReactNode
}

export default function AccueilLayout({ children }: AccueilLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !hasRole(["accueil", "admin"]))) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, user, hasRole, router])

  if (isLoading || !isAuthenticated || !user || !hasRole(["accueil", "admin"])) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const accueilNavigation = [
    {
      title: "Vue d'ensemble",
      href: ROUTES.ACCUEIL.BASE,
      icon: LayoutDashboard,
    },
    {
      title: "Commandes",
      href: ROUTES.ACCUEIL.ORDERS,
      icon: FileText,
    },
    {
      title: "Clients",
      href: ROUTES.ACCUEIL.CLIENTS,
      icon: Users,
    },
    {
      title: "Inventaire",
      href: ROUTES.STOCK.INVENTORY,
      icon: Package,
    },
  ]

  const userNotes = employes.getNotes(user as { notes?: string })
  const avatar = userNotes.photo_url || ""

  return (
    <RoleBasedLayout
      navigation={accueilNavigation}
      role="accueil"
      currentUser={{
        name: user.prenom + " " + user.nom,
        role: user.role,
        avatar,
      }}
      currentTenant={{
        name: "Print Store Management",
        logo: "/logo.png",
      }}
      permissions={ROLE_PERMISSIONS.accueil}
    >
      {children}
    </RoleBasedLayout>
  )
} 