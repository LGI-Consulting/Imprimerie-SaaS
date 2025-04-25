"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PaymentsList } from "@/components/dashboard/payments/payments-list"
import { OrdersList } from "@/components/dashboard/orders/orders-list"

export default function CaissePage() {
    const { user, hasRole } = useAuth()
    const router = useRouter()

    // Vérifier les permissions
    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }

        if (!hasRole(["admin", "caisse"])) {
            router.push("/dashboard")
            return
        }
    }, [user, hasRole, router])

    if (!user || !hasRole(["admin", "caisse"])) {
        return null
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Caisse</h1>
                        <p className="text-muted-foreground">
                            Gérez les paiements et les commandes en attente.
                        </p>


                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Paiements récents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PaymentsList />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Commandes en attente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <OrdersList userRole="caisse" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 