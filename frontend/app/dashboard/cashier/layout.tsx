"use client"

import type { ReactNode } from "react"
import { CreditCard, Receipt, FileText, Home, DollarSign } from "lucide-react"
import { RoleBasedLayout } from "@/components/dashboard/role-based-layout"

export default function CashierLayout({ children }: { children: ReactNode }) {
  // This would come from your auth system
  const currentUser = {
    name: "Michael Johnson",
    role: "cashier",
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
      href: "/dashboard/cashier",
      icon: Home,
    },
    {
      title: "Unpaid Orders",
      href: "/dashboard/cashier/unpaid-orders",
      icon: FileText,
    },
    {
      title: "Process Payment",
      href: "/dashboard/cashier/process-payment",
      icon: CreditCard,
    },
    {
      title: "Invoices",
      href: "/dashboard/cashier/invoices",
      icon: Receipt,
    },
    {
      title: "Daily Reports",
      href: "/dashboard/cashier/daily-reports",
      icon: DollarSign,
    },
  ]

  return (
    <RoleBasedLayout navigation={navigation} role="cashier" currentUser={currentUser} currentTenant={currentTenant}>
      {children}
    </RoleBasedLayout>
  )
}
