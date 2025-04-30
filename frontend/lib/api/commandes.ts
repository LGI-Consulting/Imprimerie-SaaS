// lib/api/commandes.ts
import api from "./config";
import type {
  Commande,
  DetailCommande,
  PrintFile,
  Client,
  Materiau,
  Remise,
  StatutCommande,
  SituationPaiement,
} from "./types";
import { remises } from "./remises";


// Types pour les requêtes
export interface CommandeCreate {
  clientInfo: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  materialType: string;
  width: number;
  length: number;
  quantity: number;
  options?: {
    comments?: string;
    priorite?: string;
  };
}

export interface CommandeUpdate {
  statut?: string;
  situation_paiement?: string;
  employe_graphiste_id?: number | null;
  employe_caisse_id?: number | null;
  commentaires?: string;
  priorite?: string;
  code_remise?: string;
  files?: File[];
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
  statut?: StatutCommande;
  situation_paiement?: SituationPaiement;
  client_id?: number;
  materiau_id?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  code_remise?: string;
  page?: number;
  limit?: number;
}

// Fonctions pour les commandes
export const commandes = {
  getAll: async (filters?: CommandeFilters): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>("/commandes", {
      params: filters,
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<CommandeResponse["data"]> => {
    const response = await api.get<CommandeResponse>(`/commandes/${id}`);
    if (!response.data.data) {
      throw new Error("Commande non trouvée");
    }
    return response.data.data;
  },

  getByClient: async (clientId: number): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(
      `/commandes/client/${clientId}`
    );
    return response.data.data;
  },

  getByStatus: async (status: StatutCommande): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(
      `/commandes/status/${status}`
    );
    return response.data.data;
  },

  getBySituationPaiement: async (
    situationPaiement: SituationPaiement
  ): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(
      `/commandes/situation_paiement/${situationPaiement}`
    );
    return response.data.data;
  },

  getByMaterial: async (materialType: string): Promise<Commande[]> => {
    const response = await api.get<CommandesResponse>(
      `/commandes/material/${materialType}`
    );
    return response.data.data;
  },

  create: async (data: CommandeCreate, files?: File[]) => {
    const formData = new FormData();
    
    // Ajouter les données de base
    formData.append('clientInfo', JSON.stringify(data.clientInfo));
    formData.append('materialType', data.materialType);
    formData.append('width', data.width.toString());
    formData.append('length', data.length.toString());
    formData.append('quantity', data.quantity.toString());
    
    if (data.options) {
      formData.append('options', JSON.stringify(data.options));
    }
    
    // Ajouter les fichiers s'ils existent
    if (files && files.length > 0) {
      files.forEach((file) => {
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

  update: async (
    id: number,
    data: CommandeUpdate
  ): Promise<CommandeResponse["data"]> => {
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
            valeur: remise.valeur,
          };
        }
      } catch (error) {
        console.warn("Code de remise invalide:", error);
      }
    }

    // Ajouter les données de base
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "files" && value !== undefined) {
        formData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : String(value)
        );
      }
    });

    // Ajouter les informations de remise
    if (remiseInfo) {
      formData.append("remise", JSON.stringify(remiseInfo));
    }

    // Ajouter les fichiers
    if (data.files) {
      data.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.put<CommandeResponse>(
      `/commandes/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.data) {
      throw new Error("Erreur lors de la mise à jour de la commande");
    }
    return response.data.data;
  },

  updateStatus: async (
    id: number,
    newStatus: StatutCommande
  ): Promise<CommandeResponse["data"]> => {
    const response = await api.patch<CommandeResponse>(
      `/commandes/${id}/status`,
      {
        statut: newStatus,
      }
    );

    if (!response.data.data) {
      throw new Error(
        `Erreur lors de la mise à jour du statut de la commande vers "${newStatus}"`
      );
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

  getStatusLabel: (status: StatutCommande): string => {
    const statusMap: Record<StatutCommande, string> = {
      reçue: "Reçue",
      payée: "Payée",
      en_impression: "En impression",
      terminée: "Terminée",
      livrée: "Livrée",
    };
    return statusMap[status] || status;
  },

  getSituationPaiementLabel: (situation: SituationPaiement): string => {
    const situationMap: Record<SituationPaiement, string> = {
      credit: "Crédit",
      comptant: "Comptant",
    };
    return situationMap[situation] || situation;
  },

  isCompleted: (commande: Commande): boolean => {
    return commande.statut === "terminée" || commande.statut === "livrée";
  },

  calculateTotalWithDiscount: (
    details: DetailCommande[],
    remise?: Remise
  ): number => {
    const total = details.reduce((sum, detail) => sum + detail.sous_total, 0);

    if (!remise || !remises.isValid(remise)) {
      return total;
    }

    const discountAmount = remises.calculateDiscount(total, remise);
    return Math.max(0, total - discountAmount);
  },
};

export default commandes;
