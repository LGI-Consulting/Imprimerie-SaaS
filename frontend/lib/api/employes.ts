// lib/api/employes.ts
import api from './config';
import type { 
  Employe, 
  EmployeCreate,
  EmployeUpdate,
  EmployeFilters,
  EmployeNotes,
  Role,
  EmployePermissions
} from './types/employee.types';
import type { JournalActivite } from './types';
import { 
  parseEmployeNotes, 
  stringifyEmployeNotes 
} from './types/employee.types';

// Types pour les réponses API
interface EmployeResponse {
  success: boolean;
  message: string;
  data?: Employe;
}

interface EmployesResponse {
  success: boolean;
  message: string;
  data: Employe[];
  total?: number;
  page?: number;
  limit?: number;
}

interface JournalActiviteResponse {
  success: boolean;
  message: string;
  data: JournalActivite[];
}

// API client pour les employés
export const employes = {
  // Fonctions principales correspondant aux routes backend
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

  getActivities: async (id: number): Promise<JournalActivite[]> => {
    const response = await api.get<JournalActiviteResponse>(`/employe/${id}/activities`);
    return response.data.data;
  },

  // Fonctions utilitaires
  getFullName: (employe: Employe): string => {
    return `${employe.prenom} ${employe.nom}`;
  },

  getRoleLabel: (role: Role): string => {
    const roleMap: Record<Role, string> = {
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

  // Fonctions de permissions
  hasPermission: (role: Role, permission: keyof EmployePermissions): boolean => {
    const permissionsMap: Record<Role, EmployePermissions> = {
      admin: {
        canManageOrders: true,
        canManageClients: true,
        canManageInventory: true,
        canManageEmployees: true,
        canViewReports: true,
        canManagePayments: true,
        canManageRemises: true,
        canManageSettings: true
      },
      caisse: {
        canManageOrders: true,
        canManageClients: true,
        canManageInventory: false,
        canManageEmployees: false,
        canViewReports: true,
        canManagePayments: true,
        canManageRemises: true,
        canManageSettings: false
      },
      accueil: {
        canManageOrders: true,
        canManageClients: true,
        canManageInventory: true,
        canManageEmployees: false,
        canViewReports: false,
        canManagePayments: false,
        canManageRemises: false,
        canManageSettings: false
      },
      graphiste: {
        canManageOrders: true,
        canManageClients: false,
        canManageInventory: true,
        canManageEmployees: false,
        canViewReports: false,
        canManagePayments: false,
        canManageRemises: false,
        canManageSettings: false
      }
    };

    return permissionsMap[role][permission] || false;
  },

  // Fonctions pour gérer les notes JSON
  getNotes: (employe: Employe): EmployeNotes => {
    return parseEmployeNotes(employe.notes);
  },

  updateNotes: async (id: number, notes: EmployeNotes): Promise<Employe> => {
    return employes.update(id, {
      notes: stringifyEmployeNotes(notes)
    });
  }
};

export default employes;