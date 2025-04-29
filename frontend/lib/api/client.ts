// lib/api/clients.ts
import api from "./config";
import type { Client } from "./types";

// Types pour les requêtes
export interface ClientCreate {
  nom: string;
  prenom: string;
  email?: string | null;
  telephone: string;
  adresse?: string | null;
  dette?: number;
  depot?: number;
}

export interface ClientUpdate extends Partial<ClientCreate> {}

// Types pour les transactions financières
export interface ClientDepotRequest {
  montant: number;
  commentaire?: string;
}

export interface ClientRetraitRequest {
  montant: number;
  commentaire?: string;
}

export interface ClientPayerDetteRequest {
  montant: number;
  commentaire?: string;
}

export interface ClientImputerDetteRequest {
  montant: number;
  commentaire?: string;
}

export interface Transaction {
  transaction_id: number;
  client_id: number;
  type_transaction: "depot" | "retrait" | "imputation_dette" | "paiement_dette";
  montant: number;
  solde_avant: number;
  solde_apres: number;
  date_transaction: string;
  employe_id: number;
  commentaire: string | null;
  reference_transaction: string | null;
}

// Types pour les réponses
export interface ClientResponse {
  success: boolean;
  message: string;
  data: Client;
}

export interface ClientsResponse {
  success: boolean;
  message: string;
  data: Client[];
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data: Transaction;
}

export interface TransactionsResponse {
  success: boolean;
  message: string;
  data: Transaction[];
}

// Types pour les statistiques et commandes
export interface ClientStats {
  totalOrders: number;
  totalAmount: number;
  frequency: {
    last6Months: number;
    monthly: string;
  };
  materialPreferences: Record<string, number>;
}

export interface ClientOrder {
  commande_id: number;
  date_creation: string;
  statut: string;
  numero_commande: string;
  situation_paiement: string;
  montant_final?: number;
  // Autres champs de la commande selon le schéma SQL
}

// Fonctions pour les clients
export const clients = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<ClientsResponse>("/clients");
    return response.data.data;
  },

  getById: async (id: number): Promise<Client> => {
    const response = await api.get<ClientResponse>(`/clients/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Client non trouvé");
    }
    return response.data.data;
  },

  search: async (query: string): Promise<Client[]> => {
    const response = await api.get<ClientsResponse>("/clients/search", {
      params: { q: query },
    });
    return response.data.data;
  },

  create: async (data: ClientCreate): Promise<Client> => {
    const response = await api.post<ClientResponse>("/clients", data);
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors de la création du client"
      );
    }
    return response.data.data;
  },

  update: async (id: number, data: ClientUpdate): Promise<Client> => {
    const response = await api.put<ClientResponse>(`/clients/${id}`, data);
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors de la mise à jour du client"
      );
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/clients/${id}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors de la suppression du client"
      );
    }
  },

  // Fonctions pour les commandes et statistiques
  getOrders: async (id: number): Promise<ClientOrder[]> => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: ClientOrder[];
    }>(`/clients/${id}/orders`);
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors de la récupération des commandes"
      );
    }
    return response.data.data;
  },

  getStats: async (id: number): Promise<ClientStats> => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: ClientStats;
    }>(`/clients/${id}/stats`);
    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Erreur lors de la récupération des statistiques"
      );
    }
    return response.data.data;
  },

  // Nouvelles fonctions pour la gestion des dépôts et dettes
  ajouterDepot: async (
    id: number,
    data: ClientDepotRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/depot`,
      data
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors de l'ajout du dépôt"
      );
    }
    return response.data.data;
  },

  retirerDepot: async (
    id: number,
    data: ClientRetraitRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/retrait`,
      data
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors du retrait du dépôt"
      );
    }
    return response.data.data;
  },

  payerDette: async (
    id: number,
    data: ClientPayerDetteRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/payer_dette`,
      data
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors du paiement de la dette"
      );
    }
    return response.data.data;
  },

  imputerDette: async (
    id: number,
    data: ClientImputerDetteRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/imputer_dette`,
      data
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Erreur lors de l'imputation de la dette"
      );
    }
    return response.data.data;
  },

  getTransactions: async (id: number): Promise<Transaction[]> => {
    const response = await api.get<TransactionsResponse>(
      `/clients/${id}/transactions`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Erreur lors de la récupération des transactions"
      );
    }
    return response.data.data;
  },

  // Fonctions utilitaires
  getFullName: (client: Client): string => {
    return `${client.prenom} ${client.nom}`;
  },

  hasEmail: (client: Client): boolean => {
    return client.email !== null && client.email !== "";
  },

  hasAddress: (client: Client): boolean => {
    return client.adresse !== null && client.adresse !== "";
  },

  // Nouvelles fonctions utilitaires pour les dépôts et dettes
  getAccountBalance: (client: Client): { depot: number; dette: number } => {
    return {
      depot: client.depot,
      dette: client.dette,
    };
  },

  hasDebt: (client: Client): boolean => {
    return client.dette > 0;
  },

  hasDeposit: (client: Client): boolean => {
    return client.depot > 0;
  },
};

export default clients;
