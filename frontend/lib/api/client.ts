// lib/api/clients.ts
import api from './config';
import type { Client } from './types';

// Types pour les requêtes
export interface ClientCreate {
  nom: string;
  prenom: string;
  email?: string | null;
  telephone: string;
  adresse?: string | null;
}

export interface ClientUpdate extends Partial<ClientCreate> {}

// Types pour les réponses
export interface ClientResponse {
  success: boolean;
  message: string;
  data?: Client;
}

export interface ClientsResponse {
  success: boolean;
  message: string;
  data: Client[];
}

// Fonctions pour les clients
export const clients = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<ClientsResponse>('/clients');
    return response.data.data;
  },

  getById: async (id: number): Promise<Client> => {
    const response = await api.get<ClientResponse>(`/clients/${id}`);
    if (!response.data.data) {
      throw new Error('Client non trouvé');
    }
    return response.data.data;
  },

  search: async (query: string): Promise<Client[]> => {
    const response = await api.get<ClientsResponse>('/clients/search', {
      params: { query }
    });
    return response.data.data;
  },

  create: async (data: ClientCreate): Promise<Client> => {
    const response = await api.post<ClientResponse>('/clients', data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la création du client');
    }
    return response.data.data;
  },

  update: async (id: number, data: ClientUpdate): Promise<Client> => {
    const response = await api.put<ClientResponse>(`/clients/${id}`, data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour du client');
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  // Fonction utilitaire pour formater le nom complet
  getFullName: (client: Client): string => {
    return `${client.prenom} ${client.nom}`;
  },

  // Fonction utilitaire pour vérifier si un client a un email
  hasEmail: (client: Client): boolean => {
    return client.email !== null && client.email !== '';
  },

  // Fonction utilitaire pour vérifier si un client a une adresse
  hasAddress: (client: Client): boolean => {
    return client.adresse !== null && client.adresse !== '';
  }
};

export default clients;