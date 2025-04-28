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
import { Badge } from "@/components/ui/badge";
import { employes } from "@/lib/api/employes";
import type { Employe, Role } from "@/lib/api/types/employee.types";
import { MoreHorizontal, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { ViewEmployeeDialog } from "./view-employee-dialog";
import { EmployeeSearch } from "./employee-search";
import { EmployeeFilters } from "./employee-filters";

// Type pour les filtres combinés (issu des deux composants)
type CombinedFilters = {
  query?: string;
  role?: Role;
  est_actif?: boolean;
  date_embauche_debut?: string;
  date_embauche_fin?: string;
  tri?: string;
  departement?: string;
  performance_min?: number;
};

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<CombinedFilters>({});
  const { toast } = useToast();

  // Charger les employés
  const loadEmployees = async (filters?: CombinedFilters) => {
    try {
      setLoading(true);
      const data = await employes.getAll();
      setEmployees(data);
      console.log(data)
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
  }, []);

  // Gérer la recherche depuis EmployeeSearch
  const handleSearch = (searchFilters: any) => {
    const updatedFilters = { ...currentFilters, ...searchFilters };
    setCurrentFilters(updatedFilters);
    loadEmployees(updatedFilters);
  };

  // Gérer les filtres avancés depuis EmployeeFilters
  const handleFiltersChange = (advancedFilters: any) => {
    const updatedFilters = { ...currentFilters, ...advancedFilters };
    setCurrentFilters(updatedFilters);
    loadEmployees(updatedFilters);
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setCurrentFilters({});
    loadEmployees({});
  };

  // Gérer la suppression d'un employé
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;

    try {
      await employes.delete(id);
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès",
      });
      loadEmployees(currentFilters);
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
      loadEmployees(currentFilters);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <EmployeeSearch 
            onSearch={handleSearch} 
            onReset={handleResetFilters} 
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

      {/* Filtres avancés (optionnels) */}
      {isFiltersVisible && (
        <EmployeeFilters
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      )}

     
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
            ) : employees && employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              employees && employees.map((employee) => (
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
          loadEmployees(currentFilters);
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
              loadEmployees(currentFilters);
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