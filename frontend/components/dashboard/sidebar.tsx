"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DynamicNav } from "./dynamic-nav"
import { UserRole, UserPermissions } from "@/types/roles"

interface SidebarProps {
  isOpen: boolean
  userRole: UserRole
  permissions: UserPermissions
  className?: string
}

export function DashboardSidebar({
  isOpen,
  userRole,
  permissions,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform md:relative md:translate-x-0",
        !isOpen && "-translate-x-full",
        className
      )}
    >
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-2">
          <DynamicNav userRole={userRole} permissions={permissions} />
        </div>
      </ScrollArea>
    </aside>
  )
}
