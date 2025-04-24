"use client"

import type React from "react"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { DashboardHeader } from "./header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type UserRole = "admin" | "accueil" | "caisse" | "graphiste"

interface RoleBasedLayoutProps {
  children: ReactNode
  navigation: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  role: UserRole
  currentUser: {
    name: string
    role: string
    avatar: string
  }
  currentTenant: {
    name: string
    logo: string
  }
}

export function RoleBasedLayout({ children, navigation, role, currentUser, currentTenant }: RoleBasedLayoutProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <div className="flex items-center gap-2">
              <img
                src={currentTenant.logo || "/placeholder.svg?height=30&width=30"}
                alt={currentTenant.name}
                className="h-7 w-7 rounded-md"
              />
              <span className="font-semibold">{currentTenant.name}</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                {role === "admin" && "Tableau de bord administrateur"}
                {role === "accueil" && "Tableau de bord accueil"}
                {role === "caisse" && "Tableau de bord caisse"}
                {role === "graphiste" && "Tableau de bord graphiste"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                        <a href={item.href} className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{currentUser.role}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader onMenuClick={() => {}} currentUser={currentUser} currentTenant={currentTenant} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
