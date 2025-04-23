"use client"

import type { ReactNode } from "react"
import { Home, FileText, Printer, CheckSquare, Download } from "lucide-react"
import { RoleBasedLayout } from "@/components/dashboard/role-based-layout"

export default function DesignerLayout({ children }: { children: ReactNode }) {
  // This would come from your auth system
  const currentUser = {
    name: "Emily Williams",
    role: "designer",
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
      href: "/dashboard/designer",
      icon: Home,
    },
    {
      title: "Print Queue",
      href: "/dashboard/designer/print-queue",
      icon: Printer,
    },
    {
      title: "All Orders",
      href: "/dashboard/designer/orders",
      icon: FileText,
    },
    {
      title: "Completed Prints",
      href: "/dashboard/designer/completed",
      icon: CheckSquare,
    },
    {
      title: "Design Assets",
      href: "/dashboard/designer/design-assets",
      icon: Download,
    },
  ]

  return (
    <RoleBasedLayout navigation={navigation} role="designer" currentUser={currentUser} currentTenant={currentTenant}>
      {children}
    </RoleBasedLayout>
  )
}
