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
  dette?: string;
  depot?: string;
  notes?: string;
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
  montant: string | number;
  solde_avant: string | number;
  solde_apres: string | number;
  date_transaction: string;
  employe_id: number;
  commentaire: string | null;
  reference_transaction: string | null;
  employe_nom?: string;
  employe_prenom?: string;
}

// Types pour les réponses d'erreur
export interface ErrorResponse {
  message: string;
  error?: string;
}

// Types pour les réponses de transaction
export interface TransactionResponse {
  message: string;
  transaction: Transaction;
  client: Client;
  montantEffectif?: number; // Présent uniquement pour payerDette
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
    const response = await api.get<Client[]>("/clients");
    return response.data;
  },

  getById: async (id: number): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<Client[]> => {
    const response = await api.get<Client[]>("/clients/search", {
      params: { q: query },
    });
    return response.data;
  },

  create: async (data: ClientCreate): Promise<Client> => {
    const response = await api.post<Client>("/clients", data);
    return response.data;
  },

  update: async (id: number, data: ClientUpdate): Promise<Client> => {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  // Fonctions pour les commandes et statistiques
  getOrders: async (id: number): Promise<ClientOrder[]> => {
    const response = await api.get<ClientOrder[]>(`/clients/${id}/orders`);
    return response.data;
  },

  getStats: async (id: number): Promise<ClientStats> => {
    const response = await api.get<ClientStats>(`/clients/${id}/stats`);
    return response.data;
  },

  // Fonctions pour la gestion des dépôts et dettes
  ajouterDepot: async (
    id: number,
    data: ClientDepotRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/depot`,
      data
    );
    return response.data.transaction;
  },

  retirerDepot: async (
    id: number,
    data: ClientRetraitRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/retrait`,
      data
    );
    return response.data.transaction;
  },

  payerDette: async (
    id: number,
    data: ClientPayerDetteRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/payer_dette`,
      data
    );
    return response.data.transaction;
  },

  imputerDette: async (
    id: number,
    data: ClientImputerDetteRequest
  ): Promise<Transaction> => {
    const response = await api.post<TransactionResponse>(
      `/clients/${id}/imputer_dette`,
      data
    );
    return response.data.transaction;
  },

  getTransactions: async (id: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(
      `/clients/${id}/transactions`
    );
    return response.data;
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

  // Fonctions utilitaires pour les dépôts et dettes
  getAccountBalance: (client: Client): { depot: string; dette: string } => {
    return {
      depot: client.depot.toString(),
      dette: client.dette.toString(),
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
