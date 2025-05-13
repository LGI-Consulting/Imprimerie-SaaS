import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategorieDepense } from '@/types/depenses';

interface CategorieListProps {
  categories: CategorieDepense[];
  onEdit: (categorie: CategorieDepense) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function CategorieList({ categories, onEdit, onDelete, isLoading }: CategorieListProps) {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredCategories = selectedType === 'all'
    ? categories
    : categories.filter(cat => cat.type === selectedType);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
          >
            Tous
          </Button>
          <Button
            variant={selectedType === 'caisse' ? 'default' : 'outline'}
            onClick={() => setSelectedType('caisse')}
          >
            Caisse
          </Button>
          <Button
            variant={selectedType === 'exploitant' ? 'default' : 'outline'}
            onClick={() => setSelectedType('exploitant')}
          >
            Exploitant
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Aucune catégorie trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((categorie) => (
                <TableRow key={categorie.categorie_id}>
                  <TableCell>{categorie.nom}</TableCell>
                  <TableCell>{categorie.description}</TableCell>
                  <TableCell>
                    <Badge variant={categorie.type === 'caisse' ? 'default' : 'secondary'}>
                      {categorie.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant={categorie.est_active ? 'default' : 'secondary'}>
                      {categorie.est_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(categorie)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(categorie.categorie_id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 