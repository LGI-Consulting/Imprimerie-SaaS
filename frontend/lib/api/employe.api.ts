// api/employee.api.ts
import apiClient from './apiClient';
import { Employee, EmployeeActivity } from './types';

export const EmployeeApi = {
  getAll: async (): Promise<Employee[]> => {
    return apiClient.get('/employes');
  },
  getById: async (id: number): Promise<Employee> => {
    return apiClient.get(`/employes/${id}`);
  },
  search: async (query: string): Promise<Employee[]> => {
    return apiClient.get('/employes/search', { params: { q: query } });
  },
  getActivities: async (id: number): Promise<EmployeeActivity[]> => {
    return apiClient.get(`/employes/${id}/activities`);
  },
  create: async (data: Omit<Employee, 'employe_id'>): Promise<Employee> => {
    return apiClient.post('/employes', data);
  },
  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    return apiClient.put(`/employes/${id}`, data);
  },
  changeStatus: async (id: number, status: { est_actif: boolean }): Promise<Employee> => {
    return apiClient.put(`/employes/${id}/status`, status);
  },
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/employes/${id}`);
  }
};