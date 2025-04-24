"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { employes } from "@/lib/api/employes";
import type { Employe, Role } from "@/lib/api/types/employee.types";
import { MoreHorizontal, Search, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { ViewEmployeeDialog } from "./view-employee-dialog";

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Charger les employés
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employes.getAll({
        search: searchQuery,
        role: roleFilter || undefined,
        est_actif: statusFilter === null ? undefined : statusFilter,
      });
      setEmployees(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les employés
  useEffect(() => {
    loadEmployees();
  }, [searchQuery, roleFilter, statusFilter]);

  // Gérer la suppression d'un employé
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;

    try {
      await employes.delete(id);
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès",
      });
      loadEmployees();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé",
        variant: "destructive",
      });
    }
  };

  // Gérer le changement de statut
  const handleStatusChange = async (id: number, currentStatus: boolean) => {
    try {
      await employes.changeStatus(id, !currentStatus);
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
      loadEmployees();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec recherche et filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | "")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les rôles</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="accueil">Accueil</SelectItem>
              <SelectItem value="caisse">Caisse</SelectItem>
              <SelectItem value="graphiste">Graphiste</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter === null ? "" : statusFilter.toString()}
            onValueChange={(value) => setStatusFilter(value === "" ? null : value === "true")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="true">Actif</SelectItem>
              <SelectItem value="false">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

      {/* Tableau des employés */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'embauche</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.employe_id}>
                  <TableCell>
                    {employes.getFullName(employee)}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.telephone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {employes.getRoleLabel(employee.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.est_actif ? "default" : "destructive"}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange(employee.employe_id, employee.est_actif)}
                    >
                      {employee.est_actif ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(employee.date_embauche).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(employee.employe_id)}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogues */}
      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          loadEmployees();
        }}
      />

      {selectedEmployee && (
        <>
          <EditEmployeeDialog
            employee={selectedEmployee}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              loadEmployees();
            }}
          />

          <ViewEmployeeDialog
            employee={selectedEmployee}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        </>
      )}
    </div>
  );
} 