"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Users, Package } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Get user role from localStorage (in French from backend)
    const userRole = localStorage.getItem("userRole")?.toLowerCase() || "reception"
    
    // Map French roles to routes
    switch (userRole) {
      case "admin":
        router.push("/dashboard/admin")
        break
      case "accueil":
        router.push("/dashboard/reception")
        break
      case "caisse":
        router.push("/dashboard/cashier")
        break
      case "graphiste":
        router.push("/dashboard/designer")
        break
      default:
        // Default to reception if role is unknown
        router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Chargement du tableau de bord...</h1>
        <p className="text-muted-foreground">Redirection vers votre espace de travail</p>
      </div>
    </div>
  )
}
