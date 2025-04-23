import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Multi-Tenant Dashboard",
  description: "A responsive dashboard for multi-tenant applications",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
