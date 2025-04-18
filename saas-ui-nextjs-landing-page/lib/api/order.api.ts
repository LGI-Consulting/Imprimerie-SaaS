// api/order.api.ts
import apiClient from './apiClient';
import { Order, OrderDetail } from './types';

export const OrderApi = {
  getAll: async (): Promise<Order[]> => {
    return apiClient.get('/commande');
  },
  getById: async (id: number): Promise<Order> => {
    return apiClient.get(`/commande/${id}`);
  },
  getByClient: async (clientId: number): Promise<Order[]> => {
    return apiClient.get(`/commande/client/${clientId}`);
  },
  getByStatus: async (status: string): Promise<Order[]> => {
    return apiClient.get(`/commande/status/${status}`);
  },
  getByMaterial: async (materialType: string): Promise<Order[]> => {
    return apiClient.get(`/commande/material/${materialType}`);
  },
  create: async (data: Omit<Order, 'commande_id'>): Promise<Order> => {
    return apiClient.post('/commande', data);
  },
  update: async (id: number, data: Partial<Order>): Promise<Order> => {
    return apiClient.put(`/commande/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/commande/${id}`);
  }
};