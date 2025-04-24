// lib/api/materiaux.ts
import api from './config';
import type { 
  Materiau, 
  StockMateriau
} from './types';

// Types pour les requêtes
export interface MateriauCreate {
  type_materiau: string;
  nom?: string;
  description?: string;
  prix_unitaire: number;
  unite_mesure: string;
  options_disponibles?: Record<string, any>;
  stocks?: {
    largeur: number;
    quantite_en_stock?: number;
    seuil_alerte?: number;
    unite_mesure?: string;
  }[];
}

export interface MateriauUpdate extends Partial<Omit<MateriauCreate, 'stocks'>> {
  stocks?: {
    stock_id?: number;
    largeur: number;
    quantite_en_stock?: number;
    seuil_alerte?: number;
    unite_mesure?: string;
  }[];
}

// Types pour les réponses
export interface MateriauResponse {
  success: boolean;
  message?: string;
  data?: Materiau & {
    stocks: StockMateriau[];
  };
}

export interface MateriauxResponse {
  success: boolean;
  count: number;
  data: (Materiau & {
    stocks: StockMateriau[];
  })[];
}

// Types pour les filtres
export interface MateriauFilters {
  term?: string;
}

// Fonctions pour les matériaux
export const materiaux = {
  getAll: async (): Promise<Materiau[]> => {
    const response = await api.get<MateriauxResponse>('/materiau');
    return response.data.data;
  },

  getById: async (id: number): Promise<Materiau> => {
    const response = await api.get<MateriauResponse>(`/materiau/${id}`);
    if (!response.data.data) {
      throw new Error('Matériau non trouvé');
    }
    return response.data.data;
  },

  search: async (term: string): Promise<Materiau[]> => {
    const response = await api.get<MateriauxResponse>('/materiau/search', {
      params: { term }
    });
    return response.data.data;
  },

  getLowStock: async (): Promise<Materiau[]> => {
    const response = await api.get<MateriauxResponse>('/materiau/stock');
    return response.data.data;
  },

  create: async (data: MateriauCreate): Promise<Materiau> => {
    const response = await api.post<MateriauResponse>('/materiau', data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la création du matériau');
    }
    return response.data.data;
  },

  update: async (id: number, data: MateriauUpdate): Promise<Materiau> => {
    const response = await api.put<MateriauResponse>(`/materiau/${id}`, data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour du matériau');
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/materiau/${id}`);
  },

  // Fonctions utilitaires
  calculateSurfaceArea: (largeur: number, longueur: number): number => {
    return largeur * longueur;
  },

  calculatePrice: (surfaceArea: number, prixUnitaire: number): number => {
    return surfaceArea * prixUnitaire;
  },

  isLowStock: (quantite: number, seuilAlerte: number): boolean => {
    return quantite <= seuilAlerte;
  }
};

export default materiaux;