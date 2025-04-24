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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Employe } from "@/lib/api/types/employee.types"

interface ViewEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employe | null
}

export function ViewEmployeeDialog({ open, onOpenChange, employee }: ViewEmployeeDialogProps) {
  // Fonction pour obtenir la couleur du badge en fonction du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "accueil":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "caisse":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "graphiste":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Fonction pour formater la date en format français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (!employee) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails de l'employé</DialogTitle>
          <DialogDescription>
            Informations détaillées sur {employee.prenom} {employee.nom}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2 pb-2">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {employee.prenom.charAt(0)}
              {employee.nom.charAt(0)}
            </div>
            <h3 className="text-xl font-semibold">
              {employee.prenom} {employee.nom}
            </h3>
            <Badge variant="outline" className={getRoleColor(employee.role)}>
              {employee.role === "admin"
                ? "Administrateur"
                : employee.role === "accueil"
                ? "Accueil"
                : employee.role === "caisse"
                ? "Caisse"
                : "Graphiste"}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p className="break-all">{employee.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Téléphone</h4>
              <p>{employee.telephone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Date d'embauche</h4>
              <p>{formatDate(employee.date_embauche)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">ID Employé</h4>
              <p>EMP-{employee.employe_id.toString().padStart(4, "0")}</p>
            </div>
          </div>

          {employee.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm">{employee.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
