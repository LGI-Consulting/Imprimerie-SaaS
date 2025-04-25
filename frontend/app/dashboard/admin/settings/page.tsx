"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnauthorizedAlert } from "@/components/dashboard/unauthorized-alert"
import { 
  Settings, 
  Users, 
  Bell, 
  Mail, 
  Printer, 
  Shield,
  Save,
  AlertCircle
} from "lucide-react"

interface SettingsData {
  general: {
    companyName: string
    companyAddress: string
    companyPhone: string
    companyEmail: string
    defaultCurrency: string
    timezone: string
  }
  notifications: {
    emailNotifications: boolean
    lowStockAlerts: boolean
    orderStatusUpdates: boolean
    systemAlerts: boolean
  }
  security: {
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    sessionTimeout: number
    twoFactorAuth: boolean
  }
  printing: {
    defaultPrinter: string
    printFormat: string
    autoPrint: boolean
    printCopies: number
  }
}

export default function SettingsPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Vérifier les permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole(["admin"])) {
      router.push("/dashboard")
      return
    }
  }, [user, hasRole, router])

  // Charger les paramètres
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        // TODO: Remplacer par l'appel API réel
        const mockSettings: SettingsData = {
          general: {
            companyName: "Imprimerie XYZ",
            companyAddress: "123 Rue de l'Imprimerie, 75000 Paris",
            companyPhone: "+33 1 23 45 67 89",
            companyEmail: "contact@imprimerie-xyz.fr",
            defaultCurrency: "EUR",
            timezone: "Europe/Paris"
          },
          notifications: {
            emailNotifications: true,
            lowStockAlerts: true,
            orderStatusUpdates: true,
            systemAlerts: true
          },
          security: {
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: true
            },
            sessionTimeout: 30,
            twoFactorAuth: false
          },
          printing: {
            defaultPrinter: "HP LaserJet Pro",
            printFormat: "A4",
            autoPrint: true,
            printCopies: 1
          }
        }
        setSettings(mockSettings)
        setError(null)
      } catch (err) {
        console.error("Error loading settings:", err)
        setError("Impossible de charger les paramètres")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Implémenter la sauvegarde des paramètres
      console.log("Saving settings:", settings)
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Erreur lors de la sauvegarde des paramètres")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user || !hasRole(["admin"])) {
    return <UnauthorizedAlert onDismiss={() => router.push("/dashboard")} />
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres système</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de l'application
          </p>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="printing">
              <Printer className="h-4 w-4 mr-2" />
              Impression
            </TabsTrigger>
          </TabsList>

          {/* Paramètres généraux */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>
                  Configurez les informations de base de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={settings?.general.companyName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      general: { ...prev!.general, companyName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input
                    id="companyAddress"
                    value={settings?.general.companyAddress}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      general: { ...prev!.general, companyAddress: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <Input
                    id="companyPhone"
                    value={settings?.general.companyPhone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      general: { ...prev!.general, companyPhone: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings?.general.companyEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      general: { ...prev!.general, companyEmail: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise par défaut</Label>
                    <Select
                      value={settings?.general.defaultCurrency}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev!,
                        general: { ...prev!.general, defaultCurrency: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select
                      value={settings?.general.timezone}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev!,
                        general: { ...prev!.general, timezone: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres de notification */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Configurez comment vous souhaitez recevoir les notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications importantes par email
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      notifications: { ...prev!.notifications, emailNotifications: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de stock bas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes lorsque le stock est bas
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications.lowStockAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      notifications: { ...prev!.notifications, lowStockAlerts: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mises à jour de statut</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications sur les changements de statut des commandes
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications.orderStatusUpdates}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      notifications: { ...prev!.notifications, orderStatusUpdates: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes système</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes sur les problèmes système
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications.systemAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      notifications: { ...prev!.notifications, systemAlerts: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres de sécurité */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Politique de mot de passe</CardTitle>
                <CardDescription>
                  Configurez les exigences de sécurité pour les mots de passe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Longueur minimale</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settings?.security.passwordPolicy.minLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      security: {
                        ...prev!.security,
                        passwordPolicy: {
                          ...prev!.security.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Majuscules requises</Label>
                    <p className="text-sm text-muted-foreground">
                      Le mot de passe doit contenir au moins une majuscule
                    </p>
                  </div>
                  <Switch
                    checked={settings?.security.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      security: {
                        ...prev!.security,
                        passwordPolicy: {
                          ...prev!.security.passwordPolicy,
                          requireUppercase: checked
                        }
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chiffres requis</Label>
                    <p className="text-sm text-muted-foreground">
                      Le mot de passe doit contenir au moins un chiffre
                    </p>
                  </div>
                  <Switch
                    checked={settings?.security.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      security: {
                        ...prev!.security,
                        passwordPolicy: {
                          ...prev!.security.passwordPolicy,
                          requireNumbers: checked
                        }
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Caractères spéciaux requis</Label>
                    <p className="text-sm text-muted-foreground">
                      Le mot de passe doit contenir au moins un caractère spécial
                    </p>
                  </div>
                  <Switch
                    checked={settings?.security.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      security: {
                        ...prev!.security,
                        passwordPolicy: {
                          ...prev!.security.passwordPolicy,
                          requireSpecialChars: checked
                        }
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings?.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      security: {
                        ...prev!.security,
                        sessionTimeout: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger une authentification à deux facteurs pour tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={settings?.security.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      security: {
                        ...prev!.security,
                        twoFactorAuth: checked
                      }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres d'impression */}
          <TabsContent value="printing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de l'impression</CardTitle>
                <CardDescription>
                  Configurez les paramètres d'impression par défaut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultPrinter">Imprimante par défaut</Label>
                  <Select
                    value={settings?.printing.defaultPrinter}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev!,
                      printing: { ...prev!.printing, defaultPrinter: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une imprimante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HP LaserJet Pro">HP LaserJet Pro</SelectItem>
                      <SelectItem value="Epson EcoTank">Epson EcoTank</SelectItem>
                      <SelectItem value="Canon PIXMA">Canon PIXMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printFormat">Format d'impression</Label>
                  <Select
                    value={settings?.printing.printFormat}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev!,
                      printing: { ...prev!.printing, printFormat: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Impression automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement les documents générés
                    </p>
                  </div>
                  <Switch
                    checked={settings?.printing.autoPrint}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      printing: { ...prev!.printing, autoPrint: checked }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printCopies">Nombre de copies par défaut</Label>
                  <Input
                    id="printCopies"
                    type="number"
                    min="1"
                    value={settings?.printing.printCopies}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      printing: { ...prev!.printing, printCopies: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 