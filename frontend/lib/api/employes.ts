// lib/api/employes.ts
import api from './config';
import type { 
  Employe, 
  JournalActivite,
  SessionUtilisateur 
} from './types';

// Types pour les requêtes
export interface EmployeCreate {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'accueil' | 'caisse' | 'graphiste';
  password: string;
  date_embauche: string;
}

export interface EmployeUpdate extends Partial<Omit<EmployeCreate, 'password'>> {
  password?: string;
}

// Types pour les réponses
export interface EmployeResponse {
  success: boolean;
  message: string;
  data?: Employe;
}

export interface EmployesResponse {
  success: boolean;
  message: string;
  data: Employe[];
}

export interface JournalActiviteResponse {
  success: boolean;
  message: string;
  data: JournalActivite[];
}

// Types pour les filtres
export interface EmployeFilters {
  role?: string;
  est_actif?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Fonctions pour les employés
export const employes = {
  getAll: async (filters?: EmployeFilters): Promise<Employe[]> => {
    const response = await api.get<EmployesResponse>('/employe', { 
      params: filters 
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Employe> => {
    const response = await api.get<EmployeResponse>(`/employe/${id}`);
    if (!response.data.data) {
      throw new Error('Employé non trouvé');
    }
    return response.data.data;
  },

  search: async (query: string): Promise<Employe[]> => {
    const response = await api.get<EmployesResponse>('/employe/search', {
      params: { query }
    });
    return response.data.data;
  },

  create: async (data: EmployeCreate): Promise<Employe> => {
    const response = await api.post<EmployeResponse>('/employe', data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la création de l\'employé');
    }
    return response.data.data;
  },

  update: async (id: number, data: EmployeUpdate): Promise<Employe> => {
    const response = await api.put<EmployeResponse>(`/employe/${id}`, data);
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour de l\'employé');
    }
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employe/${id}`);
  },

  changeStatus: async (id: number, est_actif: boolean): Promise<Employe> => {
    const response = await api.put<EmployeResponse>(`/employe/${id}/status`, { est_actif });
    if (!response.data.data) {
      throw new Error('Erreur lors du changement de statut');
    }
    return response.data.data;
  },

  // Journal des activités
  getActivities: async (id: number): Promise<JournalActivite[]> => {
    const response = await api.get<JournalActiviteResponse>(`/employe/${id}/activities`);
    return response.data.data;
  },

  // Sessions
  getActiveSessions: async (id: number): Promise<SessionUtilisateur[]> => {
    const response = await api.get<{ data: SessionUtilisateur[] }>(`/employe/${id}/sessions`);
    return response.data.data;
  },

  terminateSession: async (sessionId: number): Promise<void> => {
    await api.delete(`/employe/sessions/${sessionId}`);
  },

  // Fonctions utilitaires
  getFullName: (employe: Employe): string => {
    return `${employe.prenom} ${employe.nom}`;
  },

  getRoleLabel: (role: string): string => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrateur',
      'accueil': 'Accueil',
      'caisse': 'Caisse',
      'graphiste': 'Graphiste'
    };
    return roleMap[role] || role;
  },

  isActive: (employe: Employe): boolean => {
    return employe.est_actif;
  },

  canManageUsers: (role: string): boolean => {
    return role === 'admin';
  },

  canManageOrders: (role: string): boolean => {
    return ['admin', 'accueil', 'caisse', 'graphiste'].includes(role);
  },

  canManagePayments: (role: string): boolean => {
    return ['admin', 'caisse'].includes(role);
  },

  canManageMaterials: (role: string): boolean => {
    return ['admin', 'accueil', 'graphiste'].includes(role);
  }
};

export default employes;