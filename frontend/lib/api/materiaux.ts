// lib/api/materiaux.ts
import api from "./config";
import type { Materiau, StockMateriauxLargeur } from "./types";

// Types pour les requêtes
export interface MaterialCreateData {
  type_materiau: string;
  description?: string;
  prix_unitaire: number;
  unite_mesure: string;
  options_disponibles?: Record<string, any>;
  largeurs: {
    largeur: number;
    longeur_en_stock: number;
    seuil_alerte: number;
  }[];
}

export interface MaterialUpdateData
  extends Partial<Omit<MaterialCreateData, "largeurs">> {
  largeurs?: {
    stock_id?: number;
    largeur: number;
    longeur_en_stock: number;
    seuil_alerte: number;
  }[];
}

export interface MaterialResponse {
  success: boolean;
  message?: string;
  data?: Materiau;
}

export interface MaterialListResponse {
  success: boolean;
  message?: string;
  data: Materiau[];
}

export interface StockMovementData {
  type_mouvement: "entrée" | "sortie" | "ajustement";
  longeur: number;
  commentaire?: string;
}

const materiaux = {
  async getAll(): Promise<Materiau[]> {
    const response = await api.get<MaterialListResponse>("/materiaux");
    return response.data.data;
  },

  async getById(id: number): Promise<Materiau> {
    const response = await api.get<MaterialResponse>(`/materiaux/${id}`);
    if (!response.data.data) {
      throw new Error("Matériau non trouvé");
    }
    return response.data.data;
  },

  async create(data: MaterialCreateData): Promise<Materiau> {
    const response = await api.post<MaterialResponse>("/materiaux", data);
    if (!response.data.data) {
      throw new Error("Erreur lors de la création du matériau");
    }
    return response.data.data;
  },

  async update(id: number, data: MaterialUpdateData): Promise<Materiau> {
    const response = await api.put<MaterialResponse>(`/materiaux/${id}`, data);
    if (!response.data.data) {
      throw new Error("Erreur lors de la mise à jour du matériau");
    }
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/materiaux/${id}`);
  },

  async search(query: string): Promise<Materiau[]> {
    const response = await api.get<MaterialListResponse>("/materiaux/search", {
      params: { q: query },
    });
    return response.data.data;
  },

  async addStockMovement(
    stockId: number,
    data: StockMovementData
  ): Promise<void> {
    await api.post(`/stocks/${stockId}/mouvements`, data);
  },

  async moveStock(materiauId: number, stockId: number, longeur: number) {
    return api.patch(`/materiaux/${materiauId}/stocks/${stockId}/move`, {
      longeur,
    });
  },

  async addStock(
    materiauId: number,
    data: {
      largeur: number;
      seuil_alerte: number;
      longeur_en_stock: number;
    }
  ) {
    return api.post(`/materiaux/${materiauId}/stocks`, data);
  },

  async updateStock(
    materiauId: number,
    stockId: number,
    data: { seuil_alerte?: number; longeur_en_stock?: number }
  ) {
    return api.patch(`/materiaux/${materiauId}/stocks/${stockId}`, data);
  },
};

export default materiaux;
