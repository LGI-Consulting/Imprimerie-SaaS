"use client"

import { Menu, Bell, LogOut, Settings, Sun, Moon } from "lucide-react"
import { Button } from "#components/shadcn/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/shadcn/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "#components/shadcn/ui/avatar"
import { useColorMode } from "@chakra-ui/react"
import { useState, useEffect } from "react"

interface HeaderProps {
  onMenuClick: () => void
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

export function DashboardHeader({ onMenuClick, currentUser, currentTenant }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const [mounted, setMounted] = useState(false)

  // To avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <span className="font-semibold">{currentTenant.name}</span>
      </div>

      <div className="hidden md:block">
        <h1 className="text-lg font-semibold">{currentTenant.name}</h1>
        <p className="text-sm text-muted-foreground">Role: {currentUser.role}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleColorMode} aria-label="Toggle color mode">
          {mounted ? (colorMode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />) : null}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
