'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CategorieForm } from '@/components/dashboard/admin/depenses/CategorieForm';
import { CategorieList } from '@/components/dashboard/admin/depenses/CategorieList';
import { categoriesDepensesService } from '@/lib/api/categoriesDepenses.service';
import { CategorieDepense } from '@/types/depenses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategorieDepense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieDepense | null>(null);
  const { toast } = useToast();

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesDepensesService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les catégories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCategorie) {
        const response = await categoriesDepensesService.update(
          selectedCategorie.categorie_id,
          { ...data, est_active: selectedCategorie.est_active }
        );
        if (response.success) {
          toast({
            title: 'Succès',
            description: 'Catégorie mise à jour avec succès',
          });
        }
      } else {
        const response = await categoriesDepensesService.create(data);
        if (response.success) {
          toast({
            title: 'Succès',
            description: 'Catégorie créée avec succès',
          });
        }
      }
      setIsDialogOpen(false);
      loadCategories();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        const response = await categoriesDepensesService.delete(id);
        if (response.success) {
          toast({
            title: 'Succès',
            description: 'Catégorie supprimée avec succès',
          });
          loadCategories();
        }
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la catégorie',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (categorie: CategorieDepense) => {
    setSelectedCategorie(categorie);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategorie(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des catégories de dépenses</h1>
        <Button onClick={handleAdd}>Ajouter une catégorie</Button>
      </div>

      <CategorieList
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          <CategorieForm
            onSubmit={handleSubmit}
            initialData={selectedCategorie || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 