import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/nav"
import { useAuth } from "@/lib/context/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!isAuthenticated) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        </div>
        {children}
      </div>
    </div>
  )
} 