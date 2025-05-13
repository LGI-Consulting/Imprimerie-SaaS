import api from './config';
import { Caisse, MouvementCaisse, CategorieDepense } from './types';

export interface CaisseResponse {
  success: boolean;
  data?: Caisse;
  message?: string;
}

export interface MouvementsResponse {
  success: boolean;
  data?: MouvementCaisse[];
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data?: CategorieDepense[];
  message?: string;
}

export const caisse = {
  // Opérations sur les caisses
  ouvrir: async (data: {
    numero_caisse: string;
    solde_initial: number;
    employe_id: number;
  }): Promise<Caisse> => {
    const response = await api.post<CaisseResponse>('/caisse/ouvrir', data);
    if (!response.data?.data) {
      throw new Error(response.data?.message || 'Erreur lors de l\'ouverture de la caisse');
    }
    return response.data.data;
  },

  fermer: async (data: {
    caisse_id: number;
    employe_id: number;
  }): Promise<Caisse> => {
    const response = await api.post<CaisseResponse>('/caisse/fermer', data);
    if (!response.data?.data) {
      throw new Error(response.data?.message || 'Erreur lors de la fermeture de la caisse');
    }
    return response.data.data;
  },

  getSolde: async (caisse_id: number): Promise<Caisse> => {
    const response = await api.get<CaisseResponse>(`/caisse/${caisse_id}/solde`);
    if (!response.data?.data) {
      throw new Error(response.data?.message || 'Erreur lors de la récupération du solde');
    }
    return response.data.data;
  },

  // Opérations sur les mouvements
  enregistrerMouvement: async (data: {
    caisse_id: number;
    type_mouvement: 'entrée' | 'sortie';
    montant: number;
    categorie: string;
    description?: string;
    employe_id: number;
    reference_transaction?: string;
    paiement_id?: number;
  }): Promise<{ mouvement: MouvementCaisse; nouveau_solde: number }> => {
    const response = await api.post<{ success: boolean; data: { mouvement: MouvementCaisse; nouveau_solde: number } }>(
      '/caisse/mouvement',
      data
    );
    if (!response.data?.success) {
      throw new Error('Erreur lors de l\'enregistrement du mouvement');
    }
    return response.data.data;
  },

  getHistorique: async (
    caisse_id: number,
    date_debut?: string,
    date_fin?: string
  ): Promise<MouvementCaisse[]> => {
    const params = new URLSearchParams();
    if (date_debut) params.append('date_debut', date_debut);
    if (date_fin) params.append('date_fin', date_fin);

    const response = await api.get<MouvementsResponse>(
      `/caisse/${caisse_id}/historique?${params.toString()}`
    );
    if (!response.data?.data) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
    return response.data.data;
  },

  // Opérations sur les catégories
  getCategories: async (): Promise<CategorieDepense[]> => {
    const response = await api.get<CategoriesResponse>('/categories-depenses');
    if (!response.data?.data) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    return response.data.data;
  },

  // Fonctions utilitaires
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  },
}; 