"use client"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
  rememberMe: z.boolean().default(false),
})

export function LoginForm() {
  const router = useRouter()
  const { login, error: authError, isLoading, user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)

    try {
      await login({
        email: values.email,
        password: values.password,
      })
      
      // Get user role from the auth context
      const userRole = user?.role?.toLowerCase()
      
      // Redirect based on user role
      switch (userRole) {
        case 'admin':
          router.push('/dashboard')
          break
        case 'accueil':
          router.push('/dashboard/reception')
          break
        case 'caisse':
          router.push('/dashboard/cashier')
          break
        case 'graphiste':
          router.push('/dashboard/designer')
          break
        default:
          router.push('/dashboard')
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect. Veuillez réessayer.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {(error || authError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error || authError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nom@exemple.com" {...field} />
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
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Se souvenir de moi
                </FormLabel>
              </FormItem>
            )}
          />
          <Button variant="link" className="px-0 font-normal" type="button">
            Mot de passe oublié?
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>
    </Form>
  )
}
