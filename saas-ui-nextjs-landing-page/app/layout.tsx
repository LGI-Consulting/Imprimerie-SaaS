import type React from "react"
import { Inter } from "next/font/google"
import { ColorModeScript, theme } from '@chakra-ui/react'
import { ThemeProvider } from "#components/shadcn/theme-provider"
import { Provider } from './provider'

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
      data-theme={colorMode} 
      style={{ colorScheme: colorMode }}
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/static/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/static/favicons/manifest.json" />
      </head>
      <body className={`${inter.className} chakra-ui-${colorMode}`}>
        <ColorModeScript initialColorMode={colorMode} />
        <ThemeProvider attribute="class" defaultTheme="light">
          <Provider>{children}</Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}