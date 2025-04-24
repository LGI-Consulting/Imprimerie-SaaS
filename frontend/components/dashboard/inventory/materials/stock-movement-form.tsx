import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { materiaux } from '@/lib/api/materiaux';
import type { Materiau, StockMateriau } from '@/lib/api/types';

interface StockMovementFormProps {
  stockId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  type_mouvement: z.enum(['entrée', 'sortie', 'ajustement']),
  quantite: z.number().positive(),
  commentaire: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function StockMovementForm({ stockId, onSuccess, onCancel }: StockMovementFormProps) {
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState<StockMateriau | null>(null);
  const [materiau, setMateriau] = useState<Materiau | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type_mouvement: 'entrée',
      quantite: 0,
      commentaire: '',
    },
  });

  useEffect(() => {
    const fetchStockAndMateriau = async () => {
      try {
        const stockData = await materiaux.getStockById(stockId);
        setStock(stockData);
        const materiauData = await materiaux.getById(stockData.materiau_id);
        setMateriau(materiauData);
      } catch (error) {
        console.error('Error fetching stock and material data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    fetchStockAndMateriau();
  }, [stockId]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await materiaux.createMouvement({
        stock_id: stockId,
        ...values,
      });
      toast.success('Mouvement de stock enregistré avec succès');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating stock movement:', error);
      toast.error('Erreur lors de l\'enregistrement du mouvement');
    } finally {
      setLoading(false);
    }
  };

  if (!stock || !materiau) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau mouvement de stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-medium">Matériau: {materiau.nom}</p>
          <p className="text-sm text-muted-foreground">Stock actuel: {stock.quantite_en_stock} {stock.unite_mesure}</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type_mouvement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de mouvement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entrée">Entrée</SelectItem>
                      <SelectItem value="sortie">Sortie</SelectItem>
                      <SelectItem value="ajustement">Ajustement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commentaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaire</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 