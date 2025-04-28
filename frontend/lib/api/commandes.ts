// lib/api/commandes.ts
import api from './config';
import type { 
  Commande, 
  DetailCommande, 
  PrintFile, 
  Client, 
  Materiau,
  Remise 
} from './types';
import { remises } from './remises';

// Types pour les requêtes
export interface CommandeCreate {
  clientInfo: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  details: {
    materiau_id: number;
    quantite: number;
    dimensions: string;
    prix_unitaire: number;
    commentaires?: string;
  }[];
  priorite?: number;
  commentaires?: string;
  est_commande_speciale?: boolean;
  files?: File[];
  code_remise?: string;
}

export interface CommandeUpdate extends Partial<Omit<CommandeCreate, 'clientInfo'>> {
  statut?: string;
  employe_graphiste_id?: number;
}

// Types pour les réponses
export interface CommandeResponse {
  success: boolean;
  message: string;
  data?: Commande & {
    client: Client;
    details: (DetailCommande & {
      materiau: Materiau;
    })[];
    files: PrintFile[];
  };
}

export interface CommandesResponse {
  success: boolean;
  message: string;
  data: (Commande & {
    client: Client;
  })[];
}

// Types pour les filtres
export interface CommandeFilters {
  startDate?: string;
  endDate?: string;
  statut?: string;
  client_id?: number;
  materiau_id?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  code_remise?: string;
}

// Fonctions pour les commandes
export const commandes = {
  getAll: async (filters?: CommandeFilters): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>('/commandes', { 
      params: filters 
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<CommandeResponse['data']> => {
    const response = await api.get<CommandeResponse>(`/commandes/${id}`);
    if (!response.data.data) {
      throw new Error('Commande non trouvée');
    }
    return response.data.data;
  },

  getByClient: async (clientId: number): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(`/commandes/client/${clientId}`);
    return response.data.data;
  },

  getByStatus: async (status: string): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(`/commandes/status/${status}`);
    return response.data.data;
  },

  getByMaterial: async (materialType: string): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(`/commandes/material/${materialType}`);
    return response.data.data;
  },

  create: async (data: CommandeCreate): Promise<CommandeResponse['data']> => {
    const formData = new FormData();
    
    // Vérifier et appliquer la remise si un code est fourni
    let remiseInfo = null;
    if (data.code_remise) {
      try {
        const remise = await remises.getByCode(data.code_remise);
        if (remise && remises.isValid(remise)) {
          remiseInfo = {
            remise_id: remise.remise_id,
            code_remise: remise.code_remise,
            type: remise.type,
            valeur: remise.valeur
          };
        }
      } catch (error) {
        console.warn('Code de remise invalide:', error);
      }
    }

    // Ajouter les données de base
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'files') {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    // Ajouter les informations de remise
    if (remiseInfo) {
      formData.append('remise', JSON.stringify(remiseInfo));
    }

    // Ajouter les fichiers
    if (data.files) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<CommandeResponse>('/commandes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.data) {
      throw new Error('Erreur lors de la création de la commande');
    }
    return response.data.data;
  },

  update: async (id: number, data: CommandeUpdate): Promise<CommandeResponse['data']> => {
    const formData = new FormData();
    
    // Vérifier et appliquer la remise si un code est fourni
    let remiseInfo = null;
    if (data.code_remise) {
      try {
        const remise = await remises.getByCode(data.code_remise);
        if (remise && remises.isValid(remise)) {
          remiseInfo = {
            remise_id: remise.remise_id,
            code_remise: remise.code_remise,
            type: remise.type,
            valeur: remise.valeur
          };
        }
      } catch (error) {
        console.warn('Code de remise invalide:', error);
      }
    }

    // Ajouter les données de base
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'files' && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    // Ajouter les informations de remise
    if (remiseInfo) {
      formData.append('remise', JSON.stringify(remiseInfo));
    }

    // Ajouter les fichiers
    if (data.files) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.put<CommandeResponse>(`/commandes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour de la commande');
    }
    return response.data.data;
  },

  // Ajoutez cette fonction dans l'objet commandes
updateStatus: async (id: number, newStatus: string): Promise<CommandeResponse['data']> => {
  const response = await api.patch<CommandeResponse>(`/commandes/${id}/status`, {
    statut: newStatus
  });

  if (!response.data.data) {
    throw new Error(`Erreur lors de la mise à jour du statut de la commande vers "${newStatus}"`);
  }
  return response.data.data;
},

  delete: async (id: number): Promise<void> => {
    await api.delete(`/commandes/${id}`);
  },

  // Fonctions utilitaires
  calculateTotal: (details: DetailCommande[]): number => {
    return details.reduce((total, detail) => total + detail.sous_total, 0);
  },

  getStatusLabel: (status: string): string => {
    const statusMap: Record<string, string> = {
      'reçue': 'Reçue',
      'payée': 'Payée',
      'en_impression': 'En impression',
      'terminée': 'Terminée',
      'livrée': 'Livrée'
    };
    return statusMap[status] || status;
  },

  isCompleted: (commande: Commande): boolean => {
    return commande.statut === 'terminée' || commande.statut === 'livrée';
  },

  // Ajouter une fonction utilitaire pour calculer le total avec remise
  calculateTotalWithDiscount: (details: DetailCommande[], remise?: Remise): number => {
    const total = details.reduce((sum, detail) => sum + detail.sous_total, 0);
    
    if (!remise || !remises.isValid(remise)) {
      return total;
    }

    const discountAmount = remises.calculateDiscount(total, remise);
    return Math.max(0, total - discountAmount);
  }
};

export default commandes;