"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { ROUTES } from "@/constants/routes"
import { UserRole } from "@/types/roles"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.role) return

    const redirectMap: Record<UserRole, string> = {
      admin: ROUTES.ADMIN.BASE,
      caisse: ROUTES.CAISSE.BASE,
      graphiste: ROUTES.ATELIER.BASE,
      accueil: ROUTES.ACCUEIL.BASE,
      stock: ROUTES.STOCK.BASE,
    }

    const redirectPath = redirectMap[user.role as UserRole]
    if (redirectPath) {
      router.push(redirectPath)
    }
  }, [user, router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
} 