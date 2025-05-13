export type TypeCategorie = 'caisse' | 'exploitant';

export interface CategorieDepense {
  categorie_id: number;
  nom: string;
  description: string;
  type: TypeCategorie;
  est_active: boolean;
  date_creation: string;
  date_modification: string;
}

export type TypeMouvement = 'entrée' | 'sortie';

export interface MouvementDepense {
  mouvement_id: number;
  caisse_id?: number;
  type_mouvement: TypeMouvement;
  montant: number;
  categorie: string;
  description: string;
  date_mouvement: string;
  employe_id: number;
  reference_transaction?: string;
  paiement_id?: number;
  solde_avant: number;
  solde_apres: number;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface StatistiquesCategorie {
  categorie_id: number;
  nom: string;
  type: TypeCategorie;
  nombre_mouvements: number;
  total_depenses: number;
  total_entrees: number;
}

export interface RapportDepense {
  date: string;
  categorie: string;
  type: TypeCategorie;
  depenses: number;
  entrees: number;
  nombre_operations: number;
  solde: number;
}

export interface RapportDepenseParEmploye {
  employe_id: number;
  nom: string;
  prenom: string;
  nombre_operations: number;
  total_depenses: number;
  total_entrees: number;
  categorie: string;
  nombre_depenses: number;
  nombre_entrees: number;
}

export interface RapportDepenseParCategorie {
  categorie_id: number;
  categorie: string;
  type: TypeCategorie;
  nombre_operations: number;
  total_depenses: number;
  total_entrees: number;
  moyenne_depenses: number;
  moyenne_entrees: number;
}

export interface TotauxRapport {
  total_depenses: number;
  total_entrees: number;
  total_operations: number;
}

// Types pour les requêtes
export interface CreateCategorieRequest {
  nom: string;
  description: string;
  type: TypeCategorie;
}

export interface UpdateCategorieRequest {
  nom: string;
  description: string;
  type: TypeCategorie;
  est_active: boolean;
}

export interface CreateMouvementRequest {
  caisse_id?: number;
  type_mouvement: TypeMouvement;
  montant: number;
  categorie: string;
  description: string;
  reference_transaction?: string;
  paiement_id?: number;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 