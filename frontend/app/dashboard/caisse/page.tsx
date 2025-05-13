"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Lock, Unlock } from "lucide-react"
import { CaisseBalance } from "@/components/dashboard/caisse/caisse-balance"
import { MouvementsList } from "@/components/dashboard/caisse/mouvements-list"
import { AddMouvementDialog } from "@/components/dashboard/caisse/add-mouvement-dialog"
import { useToast } from "@/components/ui/use-toast"
import { caisse } from "@/lib/api/caisse"
import { Caisse as CaisseType } from "@/lib/api/types"

export default function CaissePage() {
    const { user, hasRole } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [caisseId, setCaisseId] = useState<number | null>(null)
    const [caisseData, setCaisseData] = useState<CaisseType | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    // Vérifier les permissions et charger les données
    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }

        if (!hasRole(["admin", "caisse"])) {
            router.push("/dashboard")
            return
        }

        // Récupérer l'ID de la caisse de l'employé
        const fetchCaisseData = async () => {
            try {
                const response = await fetch(`/api/employes/${user.id}/caisse`)
                const data = await response.json()
                if (data.success && data.data.caisse_id) {
                    setCaisseId(data.data.caisse_id)
                    // Charger les détails de la caisse
                    const caisseDetails = await caisse.getSolde(data.data.caisse_id)
                    setCaisseData(caisseDetails)
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la caisse:", error)
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les données de la caisse",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchCaisseData()
    }, [user, hasRole, router, toast])

    const handleAddMouvement = async () => {
        if (!caisseId || !user?.id) return

        try {
            // Recharger les données de la caisse
            const updatedCaisse = await caisse.getSolde(caisseId)
            setCaisseData(updatedCaisse)
            setIsDialogOpen(false)
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la caisse:", error)
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour les données de la caisse",
                variant: "destructive",
            })
        }
    }

    const handleToggleCaisse = async () => {
        if (!caisseId || !user?.id) return

        try {
            if (caisseData?.statut === 'ouverte') {
                await caisse.fermer({ caisse_id: caisseId, employe_id: user.id })
                toast({
                    title: "Succès",
                    description: "La caisse a été fermée avec succès",
                })
            } else {
                await caisse.ouvrir({
                    numero_caisse: `CAISSE-${caisseId}`,
                    solde_initial: 0,
                    employe_id: user.id
                })
                toast({
                    title: "Succès",
                    description: "La caisse a été ouverte avec succès",
                })
            }
            // Recharger les données
            const updatedCaisse = await caisse.getSolde(caisseId)
            setCaisseData(updatedCaisse)
        } catch (error) {
            console.error("Erreur lors du changement d'état de la caisse:", error)
            toast({
                title: "Erreur",
                description: "Impossible de changer l'état de la caisse",
                variant: "destructive",
            })
        }
    }

    if (!user || !hasRole(["admin", "caisse"])) {
        return null
    }

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion de Caisse</h1>
                        <p className="text-muted-foreground">
                            Gérez les opérations de caisse et suivez les mouvements.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleToggleCaisse}
                            disabled={!caisseId}
                        >
                            {caisseData?.statut === 'ouverte' ? (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Fermer la Caisse
                                </>
                            ) : (
                                <>
                                    <Unlock className="mr-2 h-4 w-4" />
                                    Ouvrir la Caisse
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            disabled={!caisseId || caisseData?.statut !== 'ouverte'}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Mouvement
                        </Button>
                    </div>
                </div>

                {/* Affichage du solde de la caisse */}
                {caisseId && <CaisseBalance caisseId={caisseId} />}

                {/* Liste des mouvements */}
                {caisseId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des Mouvements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MouvementsList caisseId={caisseId} />
                        </CardContent>
                    </Card>
                )}

                {/* Dialogue pour ajouter un mouvement */}
                <AddMouvementDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    caisseId={caisseId}
                    onAddMouvement={handleAddMouvement}
                />
            </div>
        </div>
    )
} 