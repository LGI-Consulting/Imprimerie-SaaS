// api/order.api.ts
import apiClient from './apiClient';
import { Order, OrderDetail } from './types';

export const OrderApi = {
  getAll: async (): Promise<Order[]> => {
    return apiClient.get('/commandes');
  },
  getById: async (id: number): Promise<Order> => {
    return apiClient.get(`/commandes/${id}`);
  },
  getByClient: async (clientId: number): Promise<Order[]> => {
    return apiClient.get(`/commandes/client/${clientId}`);
  },
  getByStatus: async (status: string): Promise<Order[]> => {
    return apiClient.get(`/commandes/status/${status}`);
  },
  getByMaterial: async (materialType: string): Promise<Order[]> => {
    return apiClient.get(`/commandes/material/${materialType}`);
  },
  create: async (data: Omit<Order, 'commande_id'>): Promise<Order> => {
    return apiClient.post('/commandes', data);
  },
  update: async (id: number, data: Partial<Order>): Promise<Order> => {
    return apiClient.put(`/commandes/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/commandes/${id}`);
  }
};