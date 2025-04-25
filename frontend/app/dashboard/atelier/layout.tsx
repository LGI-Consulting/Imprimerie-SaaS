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
  Printer,
  FileText,
  Package,
} from "lucide-react"

interface AtelierLayoutProps {
  children: React.ReactNode
}

export default function AtelierLayout({ children }: AtelierLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !hasRole(["graphiste"]))) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, user, hasRole, router])

  if (isLoading || !isAuthenticated || !user || !hasRole(["graphiste"])) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const atelierNavigation = [
    {
      title: "Vue d'ensemble",
      href: ROUTES.ATELIER.BASE,
      icon: LayoutDashboard,
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
      navigation={atelierNavigation}
      role="graphiste"
      currentUser={{
        name: user.prenom + " " + user.nom,
        role: user.role,
        avatar,
      }}
      currentTenant={{
        name: "Print Store Management",
        logo: "/logo.png",
      }}
      permissions={ROLE_PERMISSIONS.graphiste}
    >
      {children}
    </RoleBasedLayout>
  )
} 