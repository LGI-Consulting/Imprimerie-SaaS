import { Rouleau, Utilisation, StockStats, UtilisationStats, NewRouleau } from "@/types/inventory";
import api from "./config";

interface ApiResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export const inventoryApi = {
  // Rouleaux
  getRouleaux: async (): Promise<ApiResponse<Rouleau>> => {
    const response = await api.get("/rouleaux");
    return response.data;
  },

  getRouleauById: async (id: number): Promise<ApiResponse<Rouleau>> => {
    const response = await api.get(`/rouleaux/${id}`);
    return response.data;
  },

  getRouleauxByMateriauAndLargeur: async (materiauId: number, largeur: number): Promise<ApiResponse<Rouleau>> => {
    const response = await api.get(`/rouleaux/materiau/${materiauId}/largeur/${largeur}`);
    return response.data;
  },

  createRouleau: async (rouleau: NewRouleau): Promise<ApiResponse<Rouleau>> => {
    const response = await api.post("/rouleaux", rouleau);
    return response.data;
  },

  updateRouleauLongueur: async (id: number, longueur: number): Promise<ApiResponse<Rouleau>> => {
    const response = await api.patch(`/rouleaux/${id}/longueur`, { longueur });
    return response.data;
  },

  // Utilisations
  getUtilisationsByCommande: async (commandeId: number): Promise<Utilisation[]> => {
    const response = await api.get(`/utilisations/commande/${commandeId}`);
    return response.data;
  },

  createUtilisation: async (data: {
    rouleau_id: number;
    commande_id: number;
    longueur_theorique: number;
    longueur_reelle: number;
    commentaire?: string;
  }): Promise<Utilisation> => {
    const response = await api.post("/utilisations", data);
    return response.data;
  },

  // Statistiques
  getUtilisationsStats: async (materiauId: number, dateDebut?: string, dateFin?: string): Promise<UtilisationStats[]> => {
    const params = new URLSearchParams();
    if (dateDebut) params.append("date_debut", dateDebut);
    if (dateFin) params.append("date_fin", dateFin);
    
    const response = await api.get(`/utilisations/stocks/stats/${materiauId}?${params.toString()}`);
    return response.data;
  }
}; 