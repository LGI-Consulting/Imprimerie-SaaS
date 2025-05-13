import  api  from './config';
import {
  RapportDepense,
  RapportDepenseParEmploye,
  RapportDepenseParCategorie,
  TotauxRapport,
  ApiResponse
} from '@/types/depenses';

export const rapportsDepensesService = {
  // Obtenir le rapport général des dépenses
  getRapportGeneral: async (date_debut: string, date_fin: string, type?: string): Promise<ApiResponse<{
    mouvements: RapportDepense[];
    totaux: TotauxRapport;
  }>> => {
    const response = await api.get('/rapports-depenses', {
      params: { date_debut, date_fin, type }
    });
    return response.data;
  },

  // Obtenir le rapport des dépenses par employé
  getRapportParEmploye: async (date_debut: string, date_fin: string): Promise<ApiResponse<RapportDepenseParEmploye[]>> => {
    const response = await api.get('/rapports-depenses/employes', {
      params: { date_debut, date_fin }
    });
    return response.data;
  },

  // Obtenir le rapport des dépenses par catégorie
  getRapportParCategorie: async (date_debut: string, date_fin: string, type?: string): Promise<ApiResponse<RapportDepenseParCategorie[]>> => {
    const response = await api.get('/rapports-depenses/categories', {
      params: { date_debut, date_fin, type }
    });
    return response.data;
  }
}; 