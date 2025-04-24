"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, Phone, MapPin, User, FileText, Clock, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ViewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    client_id: number
    nom: string
    prenom: string
    email?: string | null
    telephone: string
    adresse?: string | null
    date_creation?: string
    derniere_visite?: string
    notes?: string
  }
}

export function ViewClientDialog({ open, onOpenChange, client }: ViewClientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails du client
          </DialogTitle>
          <DialogDescription>Informations détaillées sur {client.prenom} {client.nom}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="informations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="informations">Informations principales</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="informations">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2 pb-2">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                  {client.prenom[0]}{client.nom[0]}
                </div>
                <h3 className="text-xl font-semibold">{client.prenom} {client.nom}</h3>
                <Badge variant="outline">CLT-{client.client_id.toString().padStart(4, "0")}</Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Contact</CardTitle>
                    <CardDescription>Informations de contact</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.email || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.telephone}</span>
                    </div>
                    {client.adresse && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{client.adresse}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Dates</CardTitle>
                    <CardDescription>Informations temporelles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {client.date_creation && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Inscription: {format(new Date(client.date_creation), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    )}
                    {client.derniere_visite && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Dernière visite: {format(new Date(client.derniere_visite), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {client.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Notes</CardTitle>
                    <CardDescription>Informations complémentaires</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm whitespace-pre-line">{client.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="historique">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historique des commandes</CardTitle>
                  <CardDescription>Liste des commandes passées par ce client</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>Aucune commande trouvée</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historique des paiements</CardTitle>
                  <CardDescription>Liste des paiements effectués par ce client</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>Aucun paiement trouvé</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
