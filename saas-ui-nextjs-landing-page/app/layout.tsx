import type React from "react"
import { Inter } from "next/font/google"
import { ColorModeScript, theme } from '@chakra-ui/react'
import { ThemeProvider } from "#components/shadcn/theme-provider"
import { Provider } from './provider'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Multi-Tenant Dashboard",
  description: "A responsive dashboard for multi-tenant applications",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const colorMode = theme.config.initialColorMode

  return (
    <html 
      lang="en" 
    >
      <head>
      <ColorModeScript initialColorMode={colorMode} />
      </head>
      <body>
        <ThemeProvider>
          <Provider>{children}</Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
