import api from './config';
import type { Remise } from './types';

// Types pour les requêtes
export interface RemiseCreate {
  type: 'pourcentage' | 'montant_fixe';
  valeur: number;
  date_debut: string;
  date_fin?: string | null;
  client_id?: number | null;
  commande_id?: number | null;
  code_remise?: string | null;
  est_active: boolean;
}

export interface RemiseUpdate extends Partial<RemiseCreate> {}

// Types pour les réponses
export interface RemiseResponse {
  success: boolean;
  message: string;
  data?: Remise;
}

export interface RemisesResponse {
  success: boolean;
  message: string;
  data: Remise[];
}

// Fonctions pour les remises
export const remises = {
  getAll: async (): Promise<Remise[]> => {
    const response = await api.get<RemisesResponse>('/remises');
    return response.data.data;
  },

  getById: async (id: number): Promise<RemiseResponse['data']> => {
    const response = await api.get<RemiseResponse>(`/remises/${id}`);
    if (!response.data.data) {
      throw new Error('Remise non trouvée');
    }
    return response.data.data;
  },

  getByCode: async (code: string): Promise<RemiseResponse['data']> => {
    const response = await api.get<RemiseResponse>(`/remises/code/${code}`);
    if (!response.data.data) {
      throw new Error('Code de remise non trouvé');
    }
    return response.data.data;
  },

  getByClient: async (clientId: number): Promise<Remise[]> => {
    const response = await api.get<RemisesResponse>(`/remises/client/${clientId}`);
    return response.data.data;
  },

  create: async (data: RemiseCreate): Promise<RemiseResponse['data']> => {
    const response = await api.post<RemiseResponse>('/remises', data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la création de la remise');
    }
    return response.data.data;
  },

  update: async (id: number, data: RemiseUpdate): Promise<RemiseResponse['data']> => {
    const response = await api.put<RemiseResponse>(`/remises/${id}`, data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour de la remise');
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/remises/${id}`);
  },

  // Fonctions utilitaires
  calculateDiscount: (montant: number, remise: Remise): number => {
    if (!remise.est_active) return 0;
    
    const now = new Date();
    const dateDebut = new Date(remise.date_debut);
    const dateFin = remise.date_fin ? new Date(remise.date_fin) : null;
    
    if (now < dateDebut || (dateFin && now > dateFin)) {
      return 0;
    }

    if (remise.type === 'pourcentage') {
      return (montant * remise.valeur) / 100;
    } else {
      return Math.min(montant, remise.valeur);
    }
  },

  formatDiscount: (remise: Remise): string => {
    if (remise.type === 'pourcentage') {
      return `${remise.valeur}%`;
    } else {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(remise.valeur);
    }
  },

  isValid: (remise: Remise): boolean => {
    if (!remise.est_active) return false;
    
    const now = new Date();
    const dateDebut = new Date(remise.date_debut);
    const dateFin = remise.date_fin ? new Date(remise.date_fin) : null;
    
    return now >= dateDebut && (!dateFin || now <= dateFin);
  }
};

export default remises; 