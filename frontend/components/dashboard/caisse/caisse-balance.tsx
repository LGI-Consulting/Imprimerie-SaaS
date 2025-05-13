import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CaisseBalanceProps {
  caisseId: number;
}

export function CaisseBalance({ caisseId }: CaisseBalanceProps) {
  const [solde, setSolde] = useState<number>(0);
  const [statut, setStatut] = useState<string>('ouverte');
  const [derniereOperation, setDerniereOperation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolde = async () => {
      try {
        const response = await fetch(`/api/caisse/${caisseId}/solde`);
        const data = await response.json();
        if (data.success) {
          setSolde(data.data.solde_actuel);
          setStatut(data.data.statut);
          setDerniereOperation(data.data.derniere_operation);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du solde:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolde();
    // Rafraîchir le solde toutes les 30 secondes
    const interval = setInterval(fetchSolde, 30000);
    return () => clearInterval(interval);
  }, [caisseId]);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' FCFA';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Solde de la Caisse
          </CardTitle>
          <Badge variant={statut === 'ouverte' ? 'default' : 'destructive'}>
            {statut === 'ouverte' ? 'Caisse Ouverte' : 'Caisse Fermée'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-4xl font-bold">
              {formatAmount(solde)}
            </div>
            <div className="text-sm text-muted-foreground">
              Dernière opération : {derniereOperation ? format(new Date(derniereOperation), "dd MMM yyyy HH:mm", { locale: fr }) : 'Aucune'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {solde > 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 