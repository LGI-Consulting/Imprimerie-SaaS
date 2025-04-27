"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { UserRole, ROLE_PERMISSIONS } from "@/types/roles"
import { ROUTES } from "@/constants/routes"
import { employes } from "@/lib/api/employes"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // S'assurer que l'utilisateur a un rôle valide
  const userRole = user.role as UserRole
  const userPermissions = ROLE_PERMISSIONS[userRole]

  if (!userPermissions) {
    router.push(ROUTES.LOGIN)
    return null
  }

 
  return (

              
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
  )
} 