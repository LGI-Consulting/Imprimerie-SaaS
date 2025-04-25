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
  CreditCard,
} from "lucide-react"

interface CaisseLayoutProps {
  children: React.ReactNode
}

export default function CaisseLayout({ children }: CaisseLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !hasRole(["caisse"]))) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, user, hasRole, router])

  if (isLoading || !isAuthenticated || !user || !hasRole(["caisse"])) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const caisseNavigation = [
    {
      title: "Vue d'ensemble",
      href: ROUTES.CAISSE.BASE,
      icon: LayoutDashboard,
    },
    {
      title: "Commandes",
      href: ROUTES.CAISSE.ORDERS,
      icon: FileText,
    },
    {
      title: "Paiements",
      href: ROUTES.CAISSE.PAYMENTS,
      icon: CreditCard,
    },
  ]

  const userNotes = employes.getNotes(user as { notes?: string })
  const avatar = userNotes.photo_url || ""

  return (
    <RoleBasedLayout
      navigation={caisseNavigation}
      role="caisse"
      currentUser={{
        name: user.prenom + " " + user.nom,
        role: user.role,
        avatar,
      }}
      currentTenant={{
        name: "Print Store Management",
        logo: "/logo.png",
      }}
      permissions={ROLE_PERMISSIONS.caisse}
    >
      {children}
    </RoleBasedLayout>
  )
} 