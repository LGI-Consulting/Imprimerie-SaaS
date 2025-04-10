"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type UserRole = "super-admin" | "tenant-admin" | "employee"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId?: string
  tenantName?: string
  tokenExpiry?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, type?: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  registerTenant: (tenantData: any) => Promise<void>
  registerTenantAdmin: (adminData: any) => Promise<void>
  updateProfile: (userData: any) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  refreshToken: () => Promise<void>
  timeUntilExpiry: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you would check for a valid token in cookies/localStorage
        // and make an API call to validate the session
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Set token expiry timer if available
          if (parsedUser.tokenExpiry) {
            const expiryTime = new Date(parsedUser.tokenExpiry).getTime()
            const now = new Date().getTime()
            setTimeUntilExpiry(Math.max(0, expiryTime - now))
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Token expiry countdown
  useEffect(() => {
    if (!timeUntilExpiry) return

    const interval = setInterval(() => {
      setTimeUntilExpiry((prev) => {
        if (!prev || prev <= 1000) {
          clearInterval(interval)
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          logout()
          return null
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeUntilExpiry, toast])

  // Protected routes logic
  useEffect(() => {
    if (isLoading) return

    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"]
    const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

    if (!user && !isPublicRoute) {
      router.push("/login")
    }

    // Role-based route protection
    if (user) {
      if (pathname?.startsWith("/super-admin") && user.role !== "super-admin") {
        router.push("/dashboard")
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        })
      }

      if (pathname?.startsWith("/tenant-admin") && user.role !== "tenant-admin" && user.role !== "super-admin") {
        router.push("/dashboard")
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        })
      }
    }
  }, [user, isLoading, pathname, router, toast])

  const login = async (email: string, password: string, type = "user") => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your auth endpoint
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password, type }),
      // })

      // Mock successful login
      // This would normally come from your API response
      let mockUser: User

      if (type === "super-admin") {
        mockUser = {
          id: "sa-1",
          name: "Super Admin",
          email,
          role: "super-admin",
          tokenExpiry: new Date().getTime() + 3600000, // 1 hour from now
        }
        router.push("/super-admin/dashboard")
      } else if (type === "tenant-admin") {
        mockUser = {
          id: "ta-1",
          name: "Tenant Admin",
          email,
          role: "tenant-admin",
          tenantId: "tenant-1",
          tenantName: "Acme Corp",
          tokenExpiry: new Date().getTime() + 3600000,
        }
        router.push("/tenant-admin/dashboard")
      } else {
        mockUser = {
          id: "emp-1",
          name: "Employee User",
          email,
          role: "employee",
          tenantId: "tenant-1",
          tenantName: "Acme Corp",
          tokenExpiry: new Date().getTime() + 3600000,
        }
        router.push("/dashboard")
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))

      // Set token expiry timer
      setTimeUntilExpiry(3600000) // 1 hour

      toast({
        title: "Login Successful",
        description: `Welcome back, ${mockUser.name}!`,
      })
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    setTimeUntilExpiry(null)
    router.push("/login")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your register endpoint
      // const response = await fetch("/api/auth/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(userData),
      // })

      // Mock successful registration
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const registerTenant = async (tenantData: any) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your register tenant endpoint
      // const response = await fetch("/api/tenants", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(tenantData),
      // })

      // Mock successful tenant registration
      toast({
        title: "Tenant Created",
        description: `Tenant "${tenantData.name}" has been successfully created.`,
      })
      router.push("/super-admin/tenants")
    } catch (error) {
      console.error("Tenant registration failed:", error)
      toast({
        title: "Tenant Creation Failed",
        description: "There was an error creating the tenant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const registerTenantAdmin = async (adminData: any) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your register tenant admin endpoint
      // const response = await fetch("/api/tenants/admins", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(adminData),
      // })

      // Mock successful tenant admin registration
      toast({
        title: "Tenant Admin Created",
        description: `Admin account for "${adminData.email}" has been created.`,
      })
      router.push("/super-admin/tenants")
    } catch (error) {
      console.error("Tenant admin registration failed:", error)
      toast({
        title: "Admin Creation Failed",
        description: "There was an error creating the admin account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData: any) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your update profile endpoint
      // const response = await fetch("/api/auth/profile", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(userData),
      // })

      // Mock successful profile update
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Profile update failed:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your change password endpoint
      // const response = await fetch("/api/auth/change-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ oldPassword, newPassword }),
      // })

      // Mock successful password change
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      })
    } catch (error) {
      console.error("Password change failed:", error)
      toast({
        title: "Password Change Failed",
        description: "There was an error changing your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your password reset request endpoint
      // const response = await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // })

      // Mock successful password reset request
      toast({
        title: "Reset Link Sent",
        description: "If an account exists with that email, you will receive a password reset link.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Password reset request failed:", error)
      toast({
        title: "Request Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true)
    try {
      // In a real app, you would make an API call to your password reset endpoint
      // const response = await fetch("/api/auth/reset-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ token, newPassword }),
      // })

      // Mock successful password reset
      toast({
        title: "Password Reset",
        description: "Your password has been successfully reset. You can now log in with your new password.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Password reset failed:", error)
      toast({
        title: "Reset Failed",
        description: "There was an error resetting your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      // In a real app, you would make an API call to your refresh token endpoint
      // const response = await fetch("/api/auth/refresh", {
      //   method: "POST",
      // })

      // Mock successful token refresh
      if (user) {
        const updatedUser = {
          ...user,
          tokenExpiry: new Date().getTime() + 3600000, // 1 hour from now
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setTimeUntilExpiry(3600000) // 1 hour

        toast({
          title: "Session Extended",
          description: "Your session has been refreshed.",
        })
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      toast({
        title: "Session Refresh Failed",
        description: "There was an error refreshing your session. Please log in again.",
        variant: "destructive",
      })
      logout()
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    registerTenant,
    registerTenantAdmin,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshToken,
    timeUntilExpiry,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
