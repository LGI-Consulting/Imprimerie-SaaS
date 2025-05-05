// lib/api/paiements.ts
import api from "./config";
import type {
  Paiement,
  Facture,
  MethodePaiement,
  StatutPaiement,
} from "./types";

// Types pour les requêtes
export interface PaiementCreate {
  montant: number;
  commande_id: number;
  methode: MethodePaiement;
  description?: string;
  montant_recu: number;
  monnaie_rendue: number;
  employe_id: number;
}

export interface PaiementUpdate {
  amount?: number;
  client_id?: number;
  payment_method?: MethodePaiement;
  description?: string;
  status?: StatutPaiement;
  montant_recu?: number;
  monnaie_rendue?: number;
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

export interface PaiementsFilter {
  status?: StatutPaiement;
  method?: MethodePaiement;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface PaiementsPaginatedResponse {
  success: boolean;
  data: {
    payments: Paiement[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CommandePaymentDetails {
  montant_total: string;
  montant_paye: string;
  reste_a_payer: string;
  situation_paiement: string;
}

// Fonctions pour les paiements
export const paiements = {
  getAll: async (): Promise<Paiement[]> => {
    const response = await api.get<PaiementsResponse>("/paiements");
    return response.data.data;
  },

  getById: async (
    id: number
  ): Promise<{ payment: Paiement; facture?: Facture }> => {
    const response = await api.get<PaiementResponse>(`/paiements/${id}`);
    if (!response.data?.data) {
      throw new Error("Paiement non trouvé");
    }
    return response.data.data;
  },

  getByCommandeId: async (commande_id: number): Promise<Paiement[]> => {
    try {
      // Cette fonction filtre les paiements par commande_id
      const allPayments = await paiements.getAll();
      return allPayments.filter(
        (payment) => payment.commande_id === commande_id
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements par commande:",
        error
      );
      return [];
    }
  },

  getCommandePaymentDetails: async (commande_id: number): Promise<CommandePaymentDetails> => {
    const response = await api.get<{ success: boolean; data: CommandePaymentDetails }>(
      `/paiements/commande/${commande_id}/details`
    );
    if (!response.data.success) {
      throw new Error("Impossible de récupérer les détails de paiement de la commande");
    }
    return response.data.data;
  },

  create: async (
    data: PaiementCreate
  ): Promise<{ payment: Paiement; facture?: Facture }> => {
    const response = await api.post<PaiementResponse>("/paiements", data);
    if (!response.data?.data) {
      throw new Error("Erreur lors de la création du paiement");
    }
    return response.data.data;
  },

  update: async (id: number, data: PaiementUpdate): Promise<Paiement> => {
    const response = await api.put<PaiementResponse>(`/paiements/${id}`, data);
    if (!response.data?.data?.payment) {
      throw new Error("Erreur lors de la mise à jour du paiement");
    }
    return response.data.data.payment;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/paiements/${id}`);
  },

  // Fonctions pour les factures
  getAllFactures: async (): Promise<Facture[]> => {
    const response = await api.get<FacturesResponse>("/paiements/facture");
    return response.data.data;
  },

  getFactureById: async (
    id: number
  ): Promise<{ facture: Facture; payment?: Paiement }> => {
    const response = await api.get<FactureResponse>(`/paiements/facture/${id}`);
    if (!response.data?.data) {
      throw new Error("Facture non trouvée");
    }
    return response.data.data;
  },

  updateFacture: async (id: number, data: FactureUpdate): Promise<Facture> => {
    const response = await api.put<FactureResponse>(
      `/paiements/facture/${id}`,
      data
    );
    if (!response.data?.data?.facture) {
      throw new Error("Erreur lors de la mise à jour de la facture");
    }
    return response.data.data.facture;
  },

  deleteFacture: async (id: number): Promise<void> => {
    await api.delete(`/paiements/facture/${id}`);
  },

  // Fonctions utilitaires
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  },

  calculateDueDate: (issueDate: string, days: number = 30): string => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  },

  isOverdue: (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  },

  getPaymentMethodLabel: (method: MethodePaiement): string => {
    const methodMap: Record<MethodePaiement, string> = {
      espèces: "Espèces",
      Flooz: "Mobile money Moov",
      Mixx: "Mobile money Yas",
    };
    return methodMap[method] || method;
  },

  getStatusLabel: (status: StatutPaiement): string => {
    const statusMap: Record<StatutPaiement, string> = {
      en_attente: "En attente",
      validé: "Payé",
      échoué: "Annulé",
    };
    return statusMap[status] || status;
  },

  getPaginated: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: PaiementsFilter
  ): Promise<{
    payments: Paiement[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    // Récupérer toutes les données
    const allPayments = await paiements.getAll();

    // Filtrer les données selon les critères
    let filteredPayments = [...allPayments];

    if (filters) {
      if (filters.status) {
        filteredPayments = filteredPayments.filter(
          (p) => p.statut === filters.status
        );
      }
      if (filters.method) {
        filteredPayments = filteredPayments.filter(
          (p) => p.methode === filters.method
        );
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredPayments = filteredPayments.filter(
          (p) => new Date(p.date_paiement) >= startDate
        );
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredPayments = filteredPayments.filter(
          (p) => new Date(p.date_paiement) <= endDate
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPayments = filteredPayments.filter(
          (p) =>
            p.commande_id.toString().includes(searchLower) ||
            p.paiement_id.toString().includes(searchLower)
        );
      }
    }

    // Calculer la pagination
    const total = filteredPayments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    return {
      payments: paginatedPayments,
      total,
      page,
      pageSize,
      totalPages,
    };
  },
};

export default paiements;
