import api from './config';
import {
  MouvementDepense,
  CreateMouvementRequest,
  ApiResponse
} from '@/types/depenses';

export const mouvementsDepensesService = {
  // Créer un nouveau mouvement
  create: async (data: CreateMouvementRequest): Promise<ApiResponse<MouvementDepense>> => {
    const response = await api.post('/mouvements-caisse', data);
    return response.data;
  },

  // Obtenir tous les mouvements
  getAll: async (date_debut?: string, date_fin?: string, type?: string): Promise<ApiResponse<MouvementDepense[]>> => {
    const response = await api.get('/mouvements-caisse', {
      params: { date_debut, date_fin, type }
    });
    return response.data;
  },

  // Obtenir un mouvement par ID
  getById: async (id: number): Promise<ApiResponse<MouvementDepense>> => {
    const response = await api.get(`/mouvements-caisse/${id}`);
    return response.data;
  },

  // Supprimer un mouvement
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/mouvements-caisse/${id}`);
    return response.data;
  }
}; 