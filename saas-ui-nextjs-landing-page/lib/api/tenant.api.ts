import apiClient from './apiClient';
import { Tenant } from './types';

// Définir les types de réponse de l'API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const TenantApi = {
  getAll: async (): Promise<ApiResponse<Tenant[]>> => {
    return apiClient.get('/tenants');
  },
  getById: async (id: number): Promise<ApiResponse<Tenant>> => {
    return apiClient.get(`/tenants/${id}`);
  },
  getStats: async (id: number): Promise<ApiResponse<{
    tenant: Tenant;
    stats: {
      employees: number;
      clients: number;
      active_orders: number;
      completed_orders: number;
    }
  }>> => {
    return apiClient.get(`/tenants/${id}/stats`);
  },
  update: async (id: number, data: Partial<Tenant>): Promise<ApiResponse<Tenant>> => {
    return apiClient.put(`/tenants/${id}`, data);
  },
  patch: async (id: number): Promise<ApiResponse<{
    tenant_id: number;
    est_actif: boolean;
  }>> => {
    return apiClient.patch(`/tenants/${id}/toggle-status`);
  }
};