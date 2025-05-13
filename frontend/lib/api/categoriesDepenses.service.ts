import  api  from './config';
import {
  CategorieDepense,
  CreateCategorieRequest,
  UpdateCategorieRequest,
  StatistiquesCategorie,
  ApiResponse
} from '@/types/depenses';

export const categoriesDepensesService = {
  // Créer une nouvelle catégorie
  create: async (data: CreateCategorieRequest): Promise<ApiResponse<CategorieDepense>> => {
    const response = await api.post('/categories-depenses', data);
    return response.data;
  },

  // Obtenir toutes les catégories
  getAll: async (type?: string): Promise<ApiResponse<CategorieDepense[]>> => {
    const response = await api.get('/categories-depenses', {
      params: { type }
    });
    return response.data;
  },

  // Mettre à jour une catégorie
  update: async (id: number, data: UpdateCategorieRequest): Promise<ApiResponse<CategorieDepense>> => {
    const response = await api.put(`/categories-depenses/${id}`, data);
    return response.data;
  },

  // Supprimer une catégorie
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/categories-depenses/${id}`);
    return response.data;
  },

  // Obtenir les statistiques des catégories
  getStatistiques: async (date_debut?: string, date_fin?: string, type?: string): Promise<ApiResponse<StatistiquesCategorie[]>> => {
    const response = await api.get('/categories-depenses/statistiques', {
      params: { date_debut, date_fin, type }
    });
    return response.data;
  }
}; 