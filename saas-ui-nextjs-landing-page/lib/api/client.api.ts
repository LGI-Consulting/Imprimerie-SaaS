// api/client.api.ts
import apiClient from './apiClient';
import { Client, Order } from './types';

export const ClientApi = {
  getAll: async (): Promise<Client[]> => {
    return apiClient.get('/clients');
  },
  getById: async (id: number): Promise<Client> => {
    return apiClient.get(`/clients/${id}`);
  },
  search: async (query: string): Promise<Client[]> => {
    return apiClient.get('/clients/search', { params: { q: query } });
  },
  getOrders: async (id: number): Promise<Order[]> => {
    return apiClient.get(`/clients/${id}/orders`);
  },
  getStats: async (id: number): Promise<any> => { // Replace 'any' with proper stats interface if needed
    return apiClient.get(`/clients/${id}/stats`);
  },
  create: async (data: Omit<Client, 'client_id'>): Promise<Client> => {
    return apiClient.post('/clients', data);
  },
  update: async (id: number, data: Partial<Client>): Promise<Client> => {
    return apiClient.put(`/clients/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/clients/${id}`);
  }
};