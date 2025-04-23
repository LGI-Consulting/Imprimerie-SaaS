// api/order.api.ts
import apiClient from './apiClient';
import { Order, OrderDetail, Client, Employee } from './types';

interface OrderResponse {
  commande_id: number;
  client_id: number;
  date_creation: string;
  statut: string;
  priorite: string;
  commentaires: string | null;
  est_commande_speciale: boolean;
  employe_reception_id?: number;
  employe_caisse_id?: number;
  employe_graphiste_id?: number;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
  };
  employe_graphiste?: {
    nom: string;
    prenom: string;
  };
  details: Array<{
    detail_id: number;
    materiau_id: number;
    travail_id: number;
    quantite: number;
    dimensions: string;
    prix_unitaire: number;
    sous_total: number;
    materiau_nom: string;
  }>;
}

export const OrderApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get('/commandes');
    return response.data;
  },
  
  getById: async (id: number): Promise<OrderResponse> => {
    try {
      const response = await apiClient.get(`/commandes/${id}`);
      
      // Make sure we get a valid response
      if (!response.data) {
        throw new Error("La réponse ne contient pas de données");
      }
      
      // If the API returns a standard format with success/data, extract the actual order data
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // Otherwise just return the response data directly
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de la commande ${id}:`, error);
      throw new Error(error.response?.data?.message || "Impossible de récupérer les détails de la commande");
    }
  },
  
  getByClient: async (clientId: number): Promise<Order[]> => {
    const response = await apiClient.get(`/commandes/client/${clientId}`);
    return response.data;
  },
  
  getByStatus: async (status: string): Promise<Order[]> => {
    const response = await apiClient.get(`/commandes/status/${status}`);
    return response.data;
  },
  
  getByMaterial: async (materialType: string): Promise<Order[]> => {
    const response = await apiClient.get(`/commandes/material/${materialType}`);
    return response.data;
  },
  
  create: async (data: Omit<Order, 'commande_id'>): Promise<Order> => {
    const response = await apiClient.post('/commandes', data);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Order>): Promise<Order> => {
    const response = await apiClient.put(`/commandes/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/commandes/${id}`);
  },
  
  // Ajouter un détail à une commande existante
  addDetail: async (orderId: number, detail: Omit<OrderDetail, 'detail_id'>): Promise<OrderDetail> => {
    const response = await apiClient.post(`/commandes/${orderId}/details`, detail);
    return response.data;
  },
  
  // Mettre à jour un détail de commande
  updateDetail: async (orderId: number, detailId: number, detail: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await apiClient.put(`/commandes/${orderId}/details/${detailId}`, detail);
    return response.data;
  },
  
  // Supprimer un détail de commande
  deleteDetail: async (orderId: number, detailId: number): Promise<void> => {
    await apiClient.delete(`/commandes/${orderId}/details/${detailId}`);
  },
  
  // Changer le statut d'une commande
  updateStatus: async (orderId: number, status: string): Promise<Order> => {
    const response = await apiClient.patch(`/commandes/${orderId}/status`, { statut: status });
    return response.data;
  }
};