// lib/api/materiaux.ts
import api from "./config";
import type { Material, MaterialStock } from "./types";

// Types pour les requêtes
export interface MaterialCreateData {
  type_materiau: string;
  description?: string;
  prix_unitaire: number;
  unite_mesure: string;
  options_disponibles?: Record<string, any>;
  largeurs: {
    largeur: number;
    quantite_en_stock: number;
    seuil_alerte: number;
  }[];
}

export interface MaterialUpdateData
  extends Partial<Omit<MaterialCreateData, "largeurs">> {
  largeurs?: {
    stock_id?: number;
    largeur: number;
    quantite_en_stock: number;
    seuil_alerte: number;
  }[];
}

export interface MaterialResponse {
  success: boolean;
  message?: string;
  data?: Material;
}

export interface MaterialListResponse {
  success: boolean;
  message?: string;
  data: Material[];
}

export interface StockMovementData {
  type_mouvement: "entrée" | "sortie" | "ajustement";
  quantite: number;
  commentaire?: string;
}

const materiaux = {
  async getAll(): Promise<Material[]> {
    const response = await api.get<MaterialListResponse>("/materiaux");
    return response.data.data;
  },

  async getById(id: number): Promise<Material> {
    const response = await api.get<MaterialResponse>(`/materiaux/${id}`);
    if (!response.data.data) {
      throw new Error("Matériau non trouvé");
    }
    return response.data.data;
  },

  async create(data: MaterialCreateData): Promise<Material> {
    const response = await api.post<MaterialResponse>("/materiaux", data);
    if (!response.data.data) {
      throw new Error("Erreur lors de la création du matériau");
    }
    return response.data.data;
  },

  async update(id: number, data: MaterialUpdateData): Promise<Material> {
    const response = await api.put<MaterialResponse>(`/materiaux/${id}`, data);
    if (!response.data.data) {
      throw new Error("Erreur lors de la mise à jour du matériau");
    }
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/materiaux/${id}`);
  },

  async search(query: string): Promise<Material[]> {
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

  async moveStock(materiauId: number, stockId: number, quantite: number) {
    return api.patch(`/materiaux/${materiauId}/stocks/${stockId}/move`, {
      quantite,
    });
  },

  async addStock(
    materiauId: number,
    data: {
      largeur: number;
      seuil_alerte: number;
      quantite_en_stock: number;
      unite_mesure: string;
    }
  ) {
    return api.post(`/materiaux/${materiauId}/stocks`, data);
  },

  async updateStock(
    materiauId: number,
    stockId: number,
    data: { seuil_alerte?: number; quantite_en_stock?: number }
  ) {
    return api.patch(`/materiaux/${materiauId}/stocks/${stockId}`, data);
  },
};

export default materiaux;
