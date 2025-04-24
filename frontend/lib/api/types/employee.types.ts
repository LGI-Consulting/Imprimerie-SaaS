// Types de base
export type Role = 'admin' | 'accueil' | 'caisse' | 'graphiste';
export type StatutEmploye = 'actif' | 'inactif' | 'en_conge';

// Interface principale pour les employés (basée sur le schéma SQL)
export interface Employe {
  employe_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  password: string;
  date_embauche: string;
  est_actif: boolean;
  // Champs optionnels stockés dans le champ notes au format JSON
  notes?: string;
}

// Types pour les formulaires
export interface EmployeCreate {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  password: string;
  date_embauche: string;
  notes?: string;
}

export interface EmployeUpdate extends Partial<Omit<EmployeCreate, 'password'>> {
  password?: string;
  est_actif?: boolean;
}

// Types pour les permissions
export interface EmployePermissions {
  canManageOrders: boolean;
  canManageClients: boolean;
  canManageInventory: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  canManagePayments: boolean;
  canManageRemises: boolean;
  canManageSettings: boolean;
}

// Types pour les métriques et performances
export interface EmployePerformance {
  employe_id: number;
  commandes_traitees: number;
  commandes_en_cours: number;
  commandes_terminees: number;
  commandes_annulees: number;
  temps_moyen_traitement: number; // en minutes
  satisfaction_client: number; // pourcentage
  chiffre_affaires_genere: number;
  periode: string; // format: "YYYY-MM"
}

// Types pour les réponses API
export interface EmployeResponse {
  success: boolean;
  message: string;
  data?: Employe;
}

export interface EmployesResponse {
  success: boolean;
  message: string;
  data: Employe[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface EmployePerformanceResponse {
  success: boolean;
  message: string;
  data: EmployePerformance[];
}

// Types pour les filtres
export interface EmployeFilters {
  role?: Role;
  est_actif?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Types pour les graphiques et visualisations
export interface PerformanceChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Types pour les statistiques
export interface EmployeStats {
  total_employes: number;
  employes_par_role: Record<Role, number>;
  employes_actifs: number;
  employes_inactifs: number;
  nouveaux_employes_mois: number;
}

// Types pour les données JSON stockées dans le champ notes
export interface EmployeNotes {
  photo_url?: string;
  adresse?: string;
  contact_urgence?: string;
  permissions?: EmployePermissions;
  derniere_connexion?: string;
  autres_informations?: Record<string, any>;
}

// Fonctions utilitaires pour parser les notes JSON
export const parseEmployeNotes = (notes?: string): EmployeNotes => {
  if (!notes) return {};
  try {
    return JSON.parse(notes) as EmployeNotes;
  } catch (error) {
    console.error('Erreur lors du parsing des notes:', error);
    return {};
  }
};

export const stringifyEmployeNotes = (notes: EmployeNotes): string => {
  return JSON.stringify(notes);
}; 