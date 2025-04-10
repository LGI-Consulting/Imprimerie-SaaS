"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { TokenExpiry } from "@/components/auth/token-expiry"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isAdmin = user?.role === "super-admin"
  const isTenantAdmin = user?.role === "tenant-admin"

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 py-4">
                <DashboardNav className="flex flex-col gap-1" />
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-primary">SaaS</span>
            <span>Dashboard</span>
          </Link>
          {user?.tenantName && (
            <span className="hidden text-sm text-muted-foreground md:inline-block">{user.tenantName}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <TokenExpiry />
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/super-admin/dashboard">Admin Dashboard</Link>
                </DropdownMenuItem>
              )}
              {isTenantAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/tenant-admin/dashboard">Admin Dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
