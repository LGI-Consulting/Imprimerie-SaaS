'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className={cn("sticky top-0 z-40 w-full transition-all", scrolled && "border-b bg-background/80 backdrop-blur")}>        
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-0">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold">
            <Image src="/LGI-logo.jpg" alt="LGI Logo" width={32} height={32} />
            <span className="text-primary">LOTUS</span>
            <span>Print Shop</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-2 md:flex">
            <ModeToggle />
            <Link href="/login">
              <Button>Connexion</Button>
            </Link>
            <Link href="/login?type=super-admin">
              <Button variant="outline">Admin LGI</Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <ModeToggle />
                  <Link href="/login">
                    <Button className="w-full">Connexion</Button>
                  </Link>
                  <Link href="/login?type=super-admin">
                    <Button variant="outline" className="w-full">Admin LGI</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center px-4">
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Bienvenue sur le système de gestion spécialisé pour votre business d'impression
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Sécurisé, évolutif et facile à utiliser. Gérez votre organisation grâce à notre puissant tableau de bord.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg">Commencer</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Responsive Image Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[700px] rounded-lg overflow-hidden">
            <Image
              src="/landing.png"
              alt="Impression entreprise"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={cn("border-t transition-all", scrolled && "bg-background/80 backdrop-blur")}>        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 font-bold">
                <span className="text-primary">LOTUS</span>
                <span>Print Shop</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Fournisseur de solutions d'entreprise depuis 2016.
              </p>
            </div>

            <div className="flex gap-6">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Terms
              </Link>
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t pt-6">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 LOTUS Print Shop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
