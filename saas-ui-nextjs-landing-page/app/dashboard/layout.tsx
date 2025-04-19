"use client"

import type React from "react"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false)

  // This would come from your auth system
  const currentUser = {
    name: "Jane Smith",
    role: "Reception",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // This would come from your tenant management system
  const currentTenant = {
    name: "Acme Corporation",
    logo: "/placeholder.svg?height=40&width=40",
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentUser={currentUser}
        currentTenant={currentTenant}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          currentUser={currentUser}
          currentTenant={currentTenant}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {showUnauthorizedAlert && <UnauthorizedAlert onDismiss={() => setShowUnauthorizedAlert(false)} />}
          {children}
        </main>
      </div>
    </div>
  )
}
