import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { materiaux } from '@/lib/api/materiaux';
import type { Materiau, StockMateriau } from '@/lib/api/types';
import type { MateriauResponse } from '@/lib/api/materiaux';
import { WidthForm } from './width-form';

interface WidthListProps {
  materiauId?: number;
  onWidthAdded?: () => void;
  onWidthUpdated?: () => void;
  onWidthDeleted?: () => void;
}

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export function WidthList({ 
  materiauId, 
  onWidthAdded, 
  onWidthUpdated, 
  onWidthDeleted 
}: WidthListProps) {
  const [loading, setLoading] = useState(false);
  const [materiauxList, setMateriauxList] = useState<Materiau[]>([]);
  const [selectedMateriau, setSelectedMateriau] = useState<Materiau | null>(null);
  const [stocks, setStocks] = useState<StockMateriau[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<StockMateriau | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await materiaux.getAll();
        setMateriauxList(data);
        
        if (materiauId) {
          const materiau = data.find((m: Materiau) => m.materiau_id === materiauId);
          if (materiau) {
            setSelectedMateriau(materiau);
            // Récupérer les stocks associés au matériau
            const response = await materiaux.getById(materiauId) as unknown as MateriauResponse;
            if (response.success && response.data) {
              setStocks(response.data.stocks || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materiauId]);

  const handleMateriauChange = async (materiauId: number) => {
    try {
      setLoading(true);
      const materiau = materiauxList.find((m: Materiau) => m.materiau_id === materiauId);
      if (materiau) {
        setSelectedMateriau(materiau);
        // Récupérer les stocks associés au matériau
        const response = await materiaux.getById(materiauId) as unknown as MateriauResponse;
        if (response.success && response.data) {
          setStocks(response.data.stocks || []);
        }
      }
    } catch (error) {
      console.error('Error changing material:', error);
      toast.error('Erreur lors du changement de matériau');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWidth = () => {
    setEditingStock(null);
    setShowForm(true);
  };

  const handleEditWidth = (stock: StockMateriau) => {
    setEditingStock(stock);
    setShowForm(true);
  };

  const handleDeleteWidth = async (stock: StockMateriau) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette largeur ?')) {
      return;
    }

    try {
      setLoading(true);
      await materiaux.update(stock.materiau_id, {
        stocks: [{
          stock_id: stock.stock_id,
          largeur: stock.largeur,
          quantite_en_stock: 0,
          seuil_alerte: 0,
          unite_mesure: stock.unite_mesure
        }]
      });
      toast.success('Largeur supprimée avec succès');
      onWidthDeleted?.();
      
      // Rafraîchir les données
      const response = await materiaux.getById(stock.materiau_id) as unknown as MateriauResponse;
      if (response.success && response.data) {
        setStocks(response.data.stocks || []);
      }
    } catch (error) {
      console.error('Error deleting width:', error);
      toast.error('Erreur lors de la suppression de la largeur');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStock(null);
    
    // Rafraîchir les données
    const refreshData = async () => {
      try {
        setLoading(true);
        
        if (selectedMateriau) {
          const response = await materiaux.getById(selectedMateriau.materiau_id) as unknown as MateriauResponse;
          if (response.success && response.data) {
            setStocks(response.data.stocks || []);
          }
        }
        
        if (editingStock) {
          onWidthUpdated?.();
        } else {
          onWidthAdded?.();
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    refreshData();
  };

  const getStockStatus = (stock: StockMateriau): { label: string; variant: BadgeVariant } => {
    if (stock.quantite_en_stock <= 0) {
      return { label: 'Rupture', variant: 'destructive' };
    } else if (stock.quantite_en_stock <= stock.seuil_alerte) {
      return { label: 'Faible', variant: 'secondary' };
    } else {
      return { label: 'Normal', variant: 'default' };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Largeurs disponibles</CardTitle>
        <div className="flex items-center space-x-2">
          {!materiauId && (
            <select 
              className="px-3 py-2 border rounded-md"
              onChange={(e) => handleMateriauChange(Number(e.target.value))}
              value={selectedMateriau?.materiau_id || ''}
            >
              <option value="">Sélectionnez un matériau</option>
              {materiauxList.map((materiau: Materiau) => (
                <option key={materiau.materiau_id} value={materiau.materiau_id}>
                  {materiau.nom || materiau.type_materiau}
                </option>
              ))}
            </select>
          )}
          <Button onClick={handleAddWidth} disabled={!selectedMateriau || loading}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une largeur
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && selectedMateriau && (
          <div className="mb-6">
            <WidthForm 
              materiauId={selectedMateriau.materiau_id}
              initialData={editingStock || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingStock(null);
              }}
            />
          </div>
        )}
        
        {loading && !stocks.length ? (
          <div className="text-center py-4">Chargement...</div>
        ) : !selectedMateriau ? (
          <div className="text-center py-4">Sélectionnez un matériau pour voir ses largeurs</div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-4">
            Aucune largeur définie pour ce matériau
            <Button 
              variant="link" 
              onClick={handleAddWidth}
              className="ml-2"
            >
              Ajouter une largeur
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Largeur (m)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Seuil d'alerte</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock: StockMateriau) => {
                const status = getStockStatus(stock);
                return (
                  <TableRow key={stock.stock_id}>
                    <TableCell>{stock.largeur}</TableCell>
                    <TableCell>
                      {stock.quantite_en_stock} {stock.unite_mesure}
                    </TableCell>
                    <TableCell>
                      {stock.seuil_alerte} {stock.unite_mesure}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                        {status.variant === 'secondary' && (
                          <AlertTriangle className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditWidth(stock)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteWidth(stock)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 