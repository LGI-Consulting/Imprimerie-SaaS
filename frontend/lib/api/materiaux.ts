// lib/api/materiaux.ts
import api from "./config";
import type { Materiau, StockMateriauxLargeur, StockOperation } from "./types";

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
  longueur: number;
  commentaire?: string;
}

const materiaux = {
  async getAll() {
    try {
      const response = await api.get('/materiaux');
      console.log('API materiaux.getAll - Réponse:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('API materiaux.getAll - Erreur:', error);
      throw error;
    }
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
      params: { term: query },
    });
    return response.data.data;
  },

  async addStockMovement(
    stockId: number,
    data: StockMovementData
  ): Promise<void> {
    await api.post(`/materiaux/stock/mouvement`, {
      stock_id: stockId,
      ...data
    });
  },

  async moveStock(materiauId: number, stockId: number, longueur: number, employeId?: number) {
    return api.patch(`/materiaux/${materiauId}/stocks/${stockId}/move`, {
      longueur,
      employeId,
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

  async getStockHistory(stockId: number) {
    const response = await api.get(`/materiaux/stock/${stockId}/mouvements`);
    return response.data.data;
  },

  async getLowStockMaterials() {
    const response = await api.get<MaterialListResponse>("/materiaux/stock/low");
    return response.data.data;
  },
};

export default materiaux;
