// Home.jsx
// This component renders the main homepage of the SaaS Dashboard application
// with proper centering applied across all device sizes

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    // Main container for the entire page with full min-height
    <div className="flex min-h-screen flex-col">
      {/* Header section - sticky positioning with border and background */}
      <header className="sticky top-0 z-40 border-b bg-background">
        {/* Header content container with horizontal centering using mx-auto */}
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          {/* Logo/brand section */}
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">SaaS</span>
            <span>Dashboard</span>
          </div>
          {/* Navigation controls - theme toggle and login button */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content area that takes up remaining vertical space */}
      <main className="flex-1">
        {/* Hero section with appropriate padding for different screen sizes */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          {/* Content container with maximum width, centered horizontally with mx-auto */}
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            {/* Main headline with responsive text sizing */}
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Multi-Tenant SaaS Dashboard
            </h1>
            {/* Descriptive text with maximum width and muted color */}
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Secure, scalable, and easy to use. Manage your organization with our powerful dashboard.
            </p>
            {/* Call-to-action buttons with flex layout and centering */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login?type=super-admin">
                <Button size="lg" variant="outline">
                  Super Admin
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}