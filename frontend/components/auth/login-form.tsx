"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const type = searchParams?.get("type") || "user"
  const [showPassword, setShowPassword] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Simulate rate limit cooldown
  const startCooldown = () => {
    setRateLimited(true)
    setCooldownTime(15 * 60) // 15 minutes in seconds

    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setRateLimited(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatCooldownTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Simulate rate limiting for demo purposes
      // In a real app, this would be handled by your API
      const attemptCount = Number.parseInt(localStorage.getItem("loginAttempts") || "0")

      if (attemptCount >= 5) {
        startCooldown()
        return
      }

      await login(values.email, values.password, type)
      localStorage.setItem("loginAttempts", "0")
    } catch (error) {
      // Increment login attempts on failure
      const attemptCount = Number.parseInt(localStorage.getItem("loginAttempts") || "0") + 1
      localStorage.setItem("loginAttempts", attemptCount.toString())

      if (attemptCount >= 5) {
        startCooldown()
      }
    }
  }

  const getTitle = () => {
    switch (type) {
      case "super-admin":
        return "Super Admin Login"
      case "tenant-admin":
        return "Tenant Admin Login"
      default:
        return "Login to Your Account"
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{getTitle()}</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      {rateLimited && (
        <Alert variant="destructive">
          <AlertTitle>Too many login attempts</AlertTitle>
          <AlertDescription>Please try again in {formatCooldownTime(cooldownTime)}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} disabled={isLoading || rateLimited} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading || rateLimited}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || rateLimited}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || rateLimited}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>

      {type === "user" && (
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </div>
      )}
    </div>
  )
}
