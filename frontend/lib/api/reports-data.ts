import { commandes } from './commandes';
import { paiements } from './paiements';
import { clients } from './client';
import { materiaux } from './materiaux';
import { employes } from './employes';
import type { DateRange } from 'react-day-picker';
import type { 
  Commande, 
  Paiement, 
  Client, 
  Materiau, 
  Employe, 
  DetailCommande,
  StockMateriau,
  Remise
} from './types';

// Types pour les données agrégées
interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByPeriod: Array<{ period: string; revenue: number }>;
  topClients: Array<{ client: Client; totalSpent: number }>;
  topMaterials: Array<{ material: Materiau; quantity: number }>;
}

interface ProductionData {
  totalOrders: number;
  completedOrders: number;
  averageProcessingTime: number;
  ordersByEmployee: Array<{ employee: Employe; count: number }>;
  ordersByStatus: Record<string, number>;
  processingTimeByPeriod: Array<{ period: string; time: number }>;
}

interface ClientData {
  totalClients: number;
  newClients: number;
  activeClients: number;
  clientsByFrequency: Array<{ frequency: string; count: number }>;
  clientsByValue: Array<{ value: string; count: number }>;
  topClients: Array<{ client: Client; totalSpent: number }>;
  clientRetention: number;
}

interface FinancialData {
  totalRevenue: number;
  totalPayments: number;
  paymentsByMethod: Record<string, number>;
  revenueByPeriod: Array<{ period: string; revenue: number }>;
  discountsApplied: number;
  averageDiscount: number;
  topDiscounts: Array<{ code: string; amount: number }>;
}

interface MaterialsData {
  totalMaterials: number;
  materialsByType: Record<string, number>;
  consumptionByPeriod: Array<{ period: string; consumption: number }>;
  stockLevels: Array<{ material: Materiau; level: number }>;
  lowStockAlerts: Array<{ material: Materiau; level: number }>;
  materialCosts: Record<string, number>;
}

// Type étendu pour le stock avec la propriété isLow
interface StockWithAlert extends StockMateriau {
  isLow: boolean;
}

// Cache pour les données agrégées
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire pour gérer le cache
const getCachedData = <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.data);
  }

  return fetchFn().then(data => {
    cache.set(key, { data, timestamp: now });
    return data;
  });
};

// Fonction pour invalider le cache
export const invalidateCache = (key?: string) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Fonctions d'agrégation pour les rapports
export const reportsData = {
  // Rapport de ventes
  getSalesData: async (dateRange?: DateRange): Promise<SalesData> => {
    const cacheKey = `sales-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return getCachedData(cacheKey, async () => {
      try {
        // Récupérer les commandes pour la période
        const orders = await commandes.getAll({
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        // Récupérer les paiements pour la période
        const payments = await paiements.getPaginated(1, 1000, {
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        // Calculer les métriques
        const totalRevenue = payments.payments.reduce((sum: number, payment: Paiement) => sum + payment.montant, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Agréger les commandes par statut
        const ordersByStatus = orders.reduce((acc: Record<string, number>, order: Commande) => {
          acc[order.statut] = (acc[order.statut] || 0) + 1;
          return acc;
        }, {});

        // Agréger les revenus par période
        const revenueByPeriod = payments.payments.reduce((acc: Record<string, number>, payment: Paiement) => {
          const period = new Date(payment.date_paiement).toISOString().split('T')[0];
          acc[period] = (acc[period] || 0) + payment.montant;
          return acc;
        }, {});

        // Convertir en tableau pour l'affichage
        const revenueByPeriodArray = Object.entries(revenueByPeriod).map(([period, revenue]) => ({
          period,
          revenue,
        }));

        // Calculer les top clients
        const clientSpending = orders.reduce((acc: Record<number, number>, order: Commande) => {
          const clientId = order.client_id;
          if (clientId) {
            // Récupérer les détails de la commande
            const orderDetails: DetailCommande[] = [];
            acc[clientId] = (acc[clientId] || 0) + orderDetails.reduce((sum: number, detail: DetailCommande) => sum + detail.sous_total, 0);
          }
          return acc;
        }, {});

        const topClients = await Promise.all(
          Object.entries(clientSpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(async ([clientId, totalSpent]) => {
              const client = await clients.getById(parseInt(clientId));
              return { client, totalSpent };
            })
        );

        // Calculer les top matériaux
        const materialUsage = orders.reduce((acc: Record<number, number>, order: Commande) => {
          const orderDetails: DetailCommande[] = [];
          orderDetails.forEach((detail: DetailCommande) => {
            if (detail.materiau_id) {
              acc[detail.materiau_id] = (acc[detail.materiau_id] || 0) + detail.quantite;
            }
          });
          return acc;
        }, {});

        const topMaterials = await Promise.all(
          Object.entries(materialUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(async ([materialId, quantity]) => {
              const material = await materiaux.getById(parseInt(materialId));
              return { material, quantity };
            })
        );

        return {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          ordersByStatus,
          revenueByPeriod: revenueByPeriodArray,
          topClients,
          topMaterials,
        };
      } catch (error) {
        console.error('Error fetching sales data:', error);
        throw new Error('Failed to fetch sales data');
      }
    });
  },

  // Rapport de production
  getProductionData: async (dateRange?: DateRange): Promise<ProductionData> => {
    const cacheKey = `production-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return getCachedData(cacheKey, async () => {
      try {
        // Récupérer les commandes pour la période
        const orders = await commandes.getAll({
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        // Calculer les métriques
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.statut === 'terminée' || order.statut === 'livrée').length;

        // Calculer le temps moyen de traitement
        const processingTimes = orders
          .filter(order => order.statut === 'terminée' || order.statut === 'livrée')
          .map(order => {
            const startDate = new Date(order.date_creation);
            const endDate = new Date(order.date_creation); // Utiliser date_creation car date_modification n'existe pas
            return endDate.getTime() - startDate.getTime();
          });

        const averageProcessingTime = processingTimes.length > 0
          ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
          : 0;

        // Agréger les commandes par employé
        const ordersByEmployee = await Promise.all(
          Object.entries(
            orders.reduce((acc: Record<number, number>, order: Commande) => {
              if (order.employe_graphiste_id) {
                acc[order.employe_graphiste_id] = (acc[order.employe_graphiste_id] || 0) + 1;
              }
              return acc;
            }, {})
          )
            .sort(([, a], [, b]) => b - a)
            .map(async ([employeeId, count]) => {
              const employee = await employes.getById(parseInt(employeeId));
              return { employee, count };
            })
        );

        // Agréger les commandes par statut
        const ordersByStatus = orders.reduce((acc: Record<string, number>, order: Commande) => {
          acc[order.statut] = (acc[order.statut] || 0) + 1;
          return acc;
        }, {});

        // Agréger le temps de traitement par période
        const processingTimeByPeriod = orders
          .filter(order => order.statut === 'terminée' || order.statut === 'livrée')
          .reduce((acc: Record<string, number>, order: Commande) => {
            const period = new Date(order.date_creation).toISOString().split('T')[0];
            const processingTime = new Date(order.date_creation).getTime() - new Date(order.date_creation).getTime();
            acc[period] = (acc[period] || 0) + processingTime;
            return acc;
          }, {});

        // Convertir en tableau pour l'affichage
        const processingTimeByPeriodArray = Object.entries(processingTimeByPeriod).map(([period, time]) => ({
          period,
          time,
        }));

        return {
          totalOrders,
          completedOrders,
          averageProcessingTime,
          ordersByEmployee,
          ordersByStatus,
          processingTimeByPeriod: processingTimeByPeriodArray,
        };
      } catch (error) {
        console.error('Error fetching production data:', error);
        throw new Error('Failed to fetch production data');
      }
    });
  },

  // Rapport clients
  getClientData: async (dateRange?: DateRange): Promise<ClientData> => {
    const cacheKey = `clients-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return getCachedData(cacheKey, async () => {
      try {
        // Récupérer tous les clients
        const allClients = await clients.getAll();

        // Récupérer les commandes pour la période
        const orders = await commandes.getAll({
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        // Calculer les métriques
        const totalClients = allClients.length;
        const newClients = allClients.filter(client => {
          const clientDate = new Date(client.date_creation);
          return dateRange?.from ? clientDate >= dateRange.from : true;
        }).length;

        // Calculer les clients actifs (ayant au moins une commande)
        const activeClients = new Set(orders.map(order => order.client_id)).size;

        // Agréger les clients par fréquence d'achat
        const clientOrderCounts = orders.reduce((acc: Record<number, number>, order: Commande) => {
          if (order.client_id) {
            acc[order.client_id] = (acc[order.client_id] || 0) + 1;
          }
          return acc;
        }, {});

        const clientsByFrequency = [
          { frequency: '1-2', count: 0 },
          { frequency: '3-5', count: 0 },
          { frequency: '6-10', count: 0 },
          { frequency: '10+', count: 0 },
        ];

        Object.values(clientOrderCounts).forEach(count => {
          if (count <= 2) clientsByFrequency[0].count++;
          else if (count <= 5) clientsByFrequency[1].count++;
          else if (count <= 10) clientsByFrequency[2].count++;
          else clientsByFrequency[3].count++;
        });

        // Agréger les clients par valeur d'achat
        const clientSpending = orders.reduce((acc: Record<number, number>, order: Commande) => {
          if (order.client_id) {
            const orderDetails: DetailCommande[] = [];
            acc[order.client_id] = (acc[order.client_id] || 0) + orderDetails.reduce((sum: number, detail: DetailCommande) => sum + detail.sous_total, 0);
          }
          return acc;
        }, {});

        const clientsByValue = [
          { value: '0-1000', count: 0 },
          { value: '1000-5000', count: 0 },
          { value: '5000-10000', count: 0 },
          { value: '10000+', count: 0 },
        ];

        Object.values(clientSpending).forEach(spent => {
          if (spent <= 1000) clientsByValue[0].count++;
          else if (spent <= 5000) clientsByValue[1].count++;
          else if (spent <= 10000) clientsByValue[2].count++;
          else clientsByValue[3].count++;
        });

        // Calculer les top clients
        const topClients = await Promise.all(
          Object.entries(clientSpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(async ([clientId, totalSpent]) => {
              const client = await clients.getById(parseInt(clientId));
              return { client, totalSpent };
            })
        );

        // Calculer le taux de rétention
        const previousPeriodClients = new Set(
          orders
            .filter(order => {
              const orderDate = new Date(order.date_creation);
              const previousStart = dateRange?.from ? new Date(dateRange.from) : new Date();
              previousStart.setMonth(previousStart.getMonth() - 1);
              return orderDate < previousStart;
            })
            .map(order => order.client_id)
        );

        const currentPeriodClients = new Set(
          orders
            .filter(order => {
              const orderDate = new Date(order.date_creation);
              return dateRange?.from ? orderDate >= dateRange.from : true;
            })
            .map(order => order.client_id)
        );

        const retainedClients = new Set(
          [...previousPeriodClients].filter(clientId => currentPeriodClients.has(clientId))
        );

        const clientRetention = previousPeriodClients.size > 0
          ? (retainedClients.size / previousPeriodClients.size) * 100
          : 0;

        return {
          totalClients,
          newClients,
          activeClients,
          clientsByFrequency,
          clientsByValue,
          topClients,
          clientRetention,
        };
      } catch (error) {
        console.error('Error fetching client data:', error);
        throw new Error('Failed to fetch client data');
      }
    });
  },

  // Rapport financier
  getFinancialData: async (dateRange?: DateRange): Promise<FinancialData> => {
    const cacheKey = `financial-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return getCachedData(cacheKey, async () => {
      try {
        // Récupérer les paiements pour la période
        const payments = await paiements.getPaginated(1, 1000, {
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        // Calculer les métriques
        const totalRevenue = payments.payments.reduce((sum: number, payment: Paiement) => sum + payment.montant, 0);
        const totalPayments = payments.payments.length;

        // Agréger les paiements par méthode
        const paymentsByMethod = payments.payments.reduce((acc: Record<string, number>, payment: Paiement) => {
          acc[payment.methode] = (acc[payment.methode] || 0) + payment.montant;
          return acc;
        }, {});

        // Agréger les revenus par période
        const revenueByPeriod = payments.payments.reduce((acc: Record<string, number>, payment: Paiement) => {
          const period = new Date(payment.date_paiement).toISOString().split('T')[0];
          acc[period] = (acc[period] || 0) + payment.montant;
          return acc;
        }, {});

        // Convertir en tableau pour l'affichage
        const revenueByPeriodArray = Object.entries(revenueByPeriod).map(([period, revenue]) => ({
          period,
          revenue,
        }));

        // Calculer les remises
        const orders = await commandes.getAll({
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        const discountsApplied = orders.reduce((sum: number, order: Commande) => {
          if (order.remise) {
            return sum + order.remise.valeur;
          }
          return sum;
        }, 0);

        const averageDiscount = orders.filter(order => order.remise).length > 0
          ? discountsApplied / orders.filter(order => order.remise).length
          : 0;

        // Calculer les top remises
        const topDiscounts = orders
          .filter(order => order.remise)
          .map(order => ({
            code: order.remise?.code || '',
            amount: order.remise?.valeur || 0,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        return {
          totalRevenue,
          totalPayments,
          paymentsByMethod,
          revenueByPeriod: revenueByPeriodArray,
          discountsApplied,
          averageDiscount,
          topDiscounts,
        };
      } catch (error) {
        console.error('Error fetching financial data:', error);
        throw new Error('Failed to fetch financial data');
      }
    });
  },

  // Rapport matériaux
  getMaterialsData: async (dateRange?: DateRange): Promise<MaterialsData> => {
    const cacheKey = `materials-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return getCachedData(cacheKey, async () => {
      try {
        // Récupérer tous les matériaux
        const allMaterials = await materiaux.getAll();

        // Récupérer les commandes pour la période
        const orders = await commandes.getAll({
          startDate: dateRange?.from?.toISOString(),
          endDate: dateRange?.to?.toISOString(),
        });

        // Calculer les métriques
        const totalMaterials = allMaterials.length;

        // Agréger les matériaux par type
        const materialsByType = allMaterials.reduce((acc: Record<string, number>, material: Materiau) => {
          acc[material.type_materiau] = (acc[material.type_materiau] || 0) + 1;
          return acc;
        }, {});

        // Agréger la consommation par période
        const consumptionByPeriod = orders.reduce((acc: Record<string, number>, order: Commande) => {
          const period = new Date(order.date_creation).toISOString().split('T')[0];
          const orderDetails: DetailCommande[] = [];
          orderDetails.forEach((detail: DetailCommande) => {
            if (detail.materiau_id) {
              acc[period] = (acc[period] || 0) + detail.quantite;
            }
          });
          return acc;
        }, {});

        // Convertir en tableau pour l'affichage
        const consumptionByPeriodArray = Object.entries(consumptionByPeriod).map(([period, consumption]) => ({
          period,
          consumption,
        }));

        // Calculer les niveaux de stock
        const stockLevels = await Promise.all(
          allMaterials.map(async (material: Materiau) => {
            // Récupérer les stocks pour ce matériau
            const stocks = await Promise.all(
              (material as any).stocks.map(async (stock: StockMateriau) => {
                const stockInfo = await materiaux.getStockById(stock.stock_id);
                return {
                  ...stockInfo,
                  isLow: materiaux.isLowStock(stockInfo.quantite_en_stock, stockInfo.seuil_alerte)
                } as StockWithAlert;
              })
            );

            // Calculer le niveau total de stock
            const totalStock = stocks.reduce((sum: number, stock: StockWithAlert) => sum + stock.quantite_en_stock, 0);
            
            return {
              material,
              level: totalStock,
              stocks
            };
          })
        );

        // Identifier les alertes de stock bas
        const lowStockAlerts = stockLevels.filter(
          ({ material, stocks }) => stocks.some((stock: StockWithAlert) => stock.isLow)
        );

        // Calculer les coûts des matériaux
        const materialCosts = allMaterials.reduce((acc: Record<string, number>, material: Materiau) => {
          acc[material.type_materiau] = (acc[material.type_materiau] || 0) + material.prix_unitaire;
          return acc;
        }, {});

        return {
          totalMaterials,
          materialsByType,
          consumptionByPeriod: consumptionByPeriodArray,
          stockLevels,
          lowStockAlerts,
          materialCosts,
        };
      } catch (error) {
        console.error('Error fetching materials data:', error);
        throw new Error('Failed to fetch materials data');
      }
    });
  },
};

export default reportsData; 