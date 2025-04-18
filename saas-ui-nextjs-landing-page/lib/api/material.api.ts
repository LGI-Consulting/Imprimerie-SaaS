// api/material.api.ts
import apiClient from './apiClient';
import { Material } from './types';

export const MaterialApi = {
  getAll: async (): Promise<Material[]> => {
    return apiClient.get('/materiau');
  },
  getById: async (id: number): Promise<Material> => {
    return apiClient.get(`/materiau/${id}`);
  },
  search: async (query: string): Promise<Material[]> => {
    return apiClient.get('/materiau/search', { params: { q: query } });
  },
  getLowStock: async (): Promise<Material[]> => {
    return apiClient.get('/materiau/stock/low');
  },
  create: async (data: Omit<Material, 'materiau_id'>): Promise<Material> => {
    return apiClient.post('/materiau', data);
  },
  update: async (id: number, data: Partial<Material>): Promise<Material> => {
    return apiClient.put(`/materiau/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/materiau/${id}`);
  }
};