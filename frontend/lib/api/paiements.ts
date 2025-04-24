// lib/api/paiements.ts
import api from './config';
import type { 
  Paiement, 
  Facture,
  MethodePaiement,
  StatutPaiement
} from './types';

// Types pour les requêtes
export interface PaiementCreate {
  amount: number;
  client_id: number;
  payment_method: MethodePaiement;
  description?: string;
}

export interface PaiementUpdate {
  amount?: number;
  client_id?: number;
  payment_method?: MethodePaiement;
  description?: string;
  status?: StatutPaiement;
}

export interface FactureUpdate {
  issue_date?: string;
  due_date?: string;
  status?: StatutPaiement;
}

// Types pour les réponses
export interface PaiementResponse {
  success: boolean;
  message?: string;
  data?: {
    payment: Paiement;
    facture?: Facture;
  };
}

export interface PaiementsResponse {
  success: boolean;
  data: Paiement[];
}

export interface FactureResponse {
  success: boolean;
  message?: string;
  data?: {
    facture: Facture;
    payment?: Paiement;
  };
}

export interface FacturesResponse {
  success: boolean;
  data: Facture[];
}

// Fonctions pour les paiements
export const paiements = {
  getAll: async (): Promise<Paiement[]> => {
    const response = await api.get<PaiementsResponse>('/paiement');
    return response.data.data;
  },

  getById: async (id: number): Promise<{ payment: Paiement; facture?: Facture }> => {
    const response = await api.get<PaiementResponse>(`/paiement/${id}`);
    if (!response.data.data) {
      throw new Error('Paiement non trouvé');
    }
    return response.data.data;
  },

  create: async (data: PaiementCreate): Promise<{ payment: Paiement; facture?: Facture | undefined }> => {
    const response = await api.post<PaiementResponse>('/paiement', data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la création du paiement');
    }
    return response.data.data;
  },

  update: async (id: number, data: PaiementUpdate): Promise<Paiement> => {
    const response = await api.put<PaiementResponse>(`/paiement/${id}`, data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour du paiement');
    }
    return response.data.data.payment;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/paiement/${id}`);
  },

  // Fonctions pour les factures
  getAllFactures: async (): Promise<Facture[]> => {
    const response = await api.get<FacturesResponse>('/facture');
    return response.data.data;
  },

  getFactureById: async (id: number): Promise<{ facture: Facture; payment?: Paiement }> => {
    const response = await api.get<FactureResponse>(`/facture/${id}`);
    if (!response.data.data) {
      throw new Error('Facture non trouvée');
    }
    return response.data.data;
  },

  updateFacture: async (id: number, data: FactureUpdate): Promise<Facture> => {
    const response = await api.put<FactureResponse>(`/facture/${id}`, data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour de la facture');
    }
    return response.data.data.facture;
  },

  deleteFacture: async (id: number): Promise<void> => {
    await api.delete(`/facture/${id}`);
  },

  // Fonctions utilitaires
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  calculateDueDate: (issueDate: string, days: number = 30): string => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },

  isOverdue: (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  },

  getPaymentMethodLabel: (method: MethodePaiement): string => {
    const methodMap: Record<MethodePaiement, string> = {
      'espèces': 'Espèces',
      'Flooz': 'Mobile money Moov',
      'Mixx': 'Mobile money Yas'
    };
    return methodMap[method] || method;
  },

  getStatusLabel: (status: StatutPaiement): string => {
    const statusMap: Record<StatutPaiement, string> = {
      'en_attente': 'En attente',
      'validé': 'Payé',
      'échoué': 'Annulé',
    };
    return statusMap[status] || status;
  }
};

export default paiements;