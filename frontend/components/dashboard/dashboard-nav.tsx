"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Home, Settings, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ElementType
    roles?: string[]
  }[]
}

export function DashboardNav({ className, items, ...props }: DashboardNavProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const defaultItems = [
    {
      href: "/dashboard",
      title: "Dashboard",
      icon: Home,
    },
    {
      href: "/profile",
      title: "Profile",
      icon: Settings,
    },
  ]

  const superAdminItems = [
    {
      href: "/super-admin/dashboard",
      title: "Admin Dashboard",
      icon: Home,
      roles: ["super-admin"],
    },
    {
      href: "/super-admin/tenants",
      title: "Tenants",
      icon: Building2,
      roles: ["super-admin"],
    },
    {
      href: "/super-admin/admins",
      title: "Tenant Admins",
      icon: Users,
      roles: ["super-admin"],
    },
    {
      href: "/profile",
      title: "Profile",
      icon: Settings,
    },
  ]

  const tenantAdminItems = [
    {
      href: "/tenant-admin/dashboard",
      title: "Admin Dashboard",
      icon: Home,
      roles: ["tenant-admin"],
    },
    {
      href: "/tenant-admin/employees",
      title: "Employees",
      icon: Users,
      roles: ["tenant-admin"],
    },
    {
      href: "/profile",
      title: "Profile",
      icon: Settings,
    },
  ]

  let navItems = defaultItems

  if (user?.role === "super-admin") {
    navItems = superAdminItems
  } else if (user?.role === "tenant-admin") {
    navItems = tenantAdminItems
  }

  const filteredItems = items || navItems.filter((item) => !item.roles || item.roles.includes(user?.role || ""))

  return (
    <nav className={cn("flex gap-2", className)} {...props}>
      {filteredItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
