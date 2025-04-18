// api/client.api.ts
import apiClient from './apiClient';
import { Tenant } from './types';

export const ClientApi = {
  getAll: async (): Promise<Tenant[]> => {
    return apiClient.get('/tenants');
  },
  getById: async (id: number): Promise<Tenant> => {
    return apiClient.get(`/tenants/${id}`);
  },
  getStats: async (id: number): Promise<any> => { // Replace 'any' with proper stats interface if needed
    return apiClient.get(`/tenants/${id}/stats`);
  },
  update: async (id: number, data: Partial<Tenant>): Promise<Tenant> => {
    return apiClient.put(`/clients/${id}`, data);
  },
  patch: async (id: number): Promise<void> => {
    return apiClient.patch(`/tenant/${id}/toggle-status`);
  }
};