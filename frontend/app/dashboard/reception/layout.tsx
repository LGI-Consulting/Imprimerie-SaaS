"use client"

import type { ReactNode } from "react"
import { UserPlus, Users, Package, FileText, Home } from "lucide-react"
import { RoleBasedLayout } from "@/components/dashboard/role-based-layout"

export default function ReceptionLayout({ children }: { children: ReactNode }) {
  // This would come from your auth system
  const currentUser = {
    name: "Jane Smith",
    role: "reception",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // This would come from your tenant management system
  const currentTenant = {
    name: "PrintMaster Shop",
    logo: "/placeholder.svg?height=40&width=40",
  }

  const navigation = [
    {
      title: "Dashboard",
      href: "/dashboard/reception",
      icon: Home,
    },
    {
      title: "New Order",
      href: "/dashboard/reception/new-order",
      icon: FileText,
    },
    {
      title: "Orders",
      href: "/dashboard/reception/orders",
      icon: FileText,
    },
    {
      title: "Clients",
      href: "/dashboard/reception/clients",
      icon: Users,
    },
    {
      title: "New Client",
      href: "/dashboard/reception/new-client",
      icon: UserPlus,
    },
    {
      title: "Inventory",
      href: "/dashboard/reception/inventory",
      icon: Package,
    },
  ]

  return (
    <RoleBasedLayout navigation={navigation} role="reception" currentUser={currentUser} currentTenant={currentTenant}>
      {children}
    </RoleBasedLayout>
  )
}
