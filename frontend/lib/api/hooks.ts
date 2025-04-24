import { useState, useEffect } from 'react';
import commandes from './commandes';
import paiements from './paiements';
import materiaux from './materiaux';
import type { Commande, StockMateriau, Paiement, Materiau } from './types';

// Hook pour les commandes
export const useOrders = (filters?: {
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [data, setData] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orders = await commandes.getAll(filters);
        setData(orders);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors de la récupération des commandes'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  return { data, loading, error };
};

// Hook pour les commandes récentes
export const useRecentOrders = (limit: number = 5) => {
  return useOrders({ limit });
};

// Hook pour les statistiques des commandes
export const useOrderStats = (period: 'day' | 'week' | 'month' = 'day') => {
  const [stats, setStats] = useState<{
    total: number;
    revenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const orders = await commandes.getAll();
        const stats = {
          total: orders.length,
          revenue: orders.reduce((sum, order) => {
            const details = (order as any).details || [];
            return sum + details.reduce((total: number, detail: any) => total + (detail.sous_total || 0), 0);
          }, 0),
          averageOrderValue: orders.length > 0 
            ? orders.reduce((sum, order) => {
                const details = (order as any).details || [];
                return sum + details.reduce((total: number, detail: any) => total + (detail.sous_total || 0), 0);
              }, 0) / orders.length 
            : 0,
          ordersByStatus: orders.reduce((acc, order) => {
            acc[order.statut] = (acc[order.statut] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        setStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors de la récupération des statistiques'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  return { data: stats, loading, error };
};

// Hook pour le stock
export const useStock = () => {
  const [data, setData] = useState<StockMateriau[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const stock = await materiaux.getLowStock();
        // On suppose que chaque matériau a une propriété stocks
        const stockItems = stock.reduce<StockMateriau[]>((acc, materiau) => {
          if ('stocks' in materiau) {
            return [...acc, ...(materiau.stocks as StockMateriau[])];
          }
          return acc;
        }, []);
        setData(stockItems);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors de la récupération du stock'));
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  return { data, loading, error };
};

// Hook pour les alertes de stock
export const useStockAlerts = () => {
  const { data, loading, error } = useStock();
  const alerts = data.filter(item => materiaux.isLowStock(item.quantite_en_stock, item.seuil_alerte));
  return { data: alerts, loading, error };
};

// Hook pour les paiements
export const usePayments = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [data, setData] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const payments = await paiements.getAll();
        const filteredPayments = filters?.status 
          ? payments.filter(payment => payment.statut === filters.status)
          : payments;
        setData(filteredPayments);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors de la récupération des paiements'));
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filters]);

  return { data, loading, error };
};

// Hook pour les paiements en attente
export const usePendingPayments = () => {
  return usePayments({ status: 'en_attente' });
}; 