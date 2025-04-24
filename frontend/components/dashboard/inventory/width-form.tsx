import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { materiaux } from '@/lib/api/materiaux';
import type { Materiau, StockMateriau } from '@/lib/api/types';

interface WidthFormProps {
  materiauId?: number;
  initialData?: StockMateriau;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  materiau_id: z.number().min(1, "Le matériau est requis"),
  largeur: z.number().positive("La largeur doit être positive"),
  quantite_en_stock: z.number().min(0, "La quantité ne peut pas être négative"),
  seuil_alerte: z.number().min(0, "Le seuil d'alerte ne peut pas être négatif"),
  unite_mesure: z.string().min(1, "L'unité de mesure est requise"),
});

type FormValues = z.infer<typeof formSchema>;

export function WidthForm({ materiauId, initialData, onSuccess, onCancel }: WidthFormProps) {
  const [loading, setLoading] = useState(false);
  const [materiauxList, setMateriauxList] = useState<Materiau[]>([]);
  const [selectedMateriau, setSelectedMateriau] = useState<Materiau | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materiau_id: materiauId || 0,
      largeur: initialData?.largeur || 0,
      quantite_en_stock: initialData?.quantite_en_stock || 0,
      seuil_alerte: initialData?.seuil_alerte || 0,
      unite_mesure: initialData?.unite_mesure || '',
    },
  });

  useEffect(() => {
    const fetchMateriaux = async () => {
      try {
        const data = await materiaux.getAll();
        setMateriauxList(data);
        
        if (materiauId) {
          const materiau = data.find((m: Materiau) => m.materiau_id === materiauId);
          if (materiau) {
            setSelectedMateriau(materiau);
            form.setValue('unite_mesure', materiau.unite_mesure);
          }
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast.error('Erreur lors du chargement des matériaux');
      }
    };

    fetchMateriaux();
  }, [materiauId, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      if (initialData) {
        // Mise à jour d'une largeur existante
        await materiaux.update(initialData.materiau_id, {
          stocks: [{
            stock_id: initialData.stock_id,
            largeur: values.largeur,
            quantite_en_stock: values.quantite_en_stock,
            seuil_alerte: values.seuil_alerte,
            unite_mesure: values.unite_mesure
          }]
        });
        toast.success('Largeur mise à jour avec succès');
      } else {
        // Création d'une nouvelle largeur
        await materiaux.update(values.materiau_id, {
          stocks: [{
            largeur: values.largeur,
            quantite_en_stock: values.quantite_en_stock,
            seuil_alerte: values.seuil_alerte,
            unite_mesure: values.unite_mesure
          }]
        });
        toast.success('Largeur ajoutée avec succès');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving width:', error);
      toast.error('Erreur lors de l\'enregistrement de la largeur');
    } finally {
      setLoading(false);
    }
  };

  const handleMateriauChange = (materiauId: number) => {
    const material = materiauxList.find((m: Materiau) => m.materiau_id === materiauId);
    if (material) {
      setSelectedMateriau(material);
      form.setValue('unite_mesure', material.unite_mesure);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Modifier la largeur' : 'Ajouter une largeur'}</CardTitle>
        <CardDescription>
          {initialData 
            ? 'Modifiez les informations de cette largeur de matériau' 
            : 'Ajoutez une nouvelle largeur pour un matériau'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="materiau_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matériau</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      handleMateriauChange(Number(value));
                    }} 
                    defaultValue={field.value ? String(field.value) : undefined}
                    disabled={!!materiauId || !!initialData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un matériau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materiauxList.map((materiau: Materiau) => (
                        <SelectItem key={materiau.materiau_id} value={String(materiau.materiau_id)}>
                          {materiau.nom || materiau.type_materiau}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="largeur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Largeur (m)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Largeur du matériau en mètres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantite_en_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité en stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Quantité initiale en stock
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="seuil_alerte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seuil d'alerte</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Seuil en dessous duquel une alerte sera déclenchée
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unite_mesure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unité de mesure</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!selectedMateriau} />
                  </FormControl>
                  <FormDescription>
                    Unité de mesure pour la quantité (m, m², etc.)
                  </FormDescription>
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
                {loading ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}