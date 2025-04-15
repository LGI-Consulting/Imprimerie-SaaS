// api.ts - Authentication Service

import axios from 'axios';

// Base API configuration
const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:5000/api';

// Configure axios instance with default settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If token is expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call the refresh token endpoint
        const response = await api.post('/auth/token/refresh');
        
        if (response.data.success) {
          // Update token in local storage
          localStorage.setItem('token', response.data.token);
          
          // Update the failed request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
  tenant_id: number;
}

export interface SadminLoginRequest {
  email: string;
  password: string;
}

export interface RegisterEmployeeRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  password: string;
  date_embauche: string;
}

export interface RegisterTenantRequest {
  nom: string;
  description: string;
  adresse: string;
  telephone: string;
  email: string;
  logoUrl: string;
}

export interface RegisterTenantAdminRequest {
  tenant_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  date_embauche: string;
}

export interface CreateSuperAdminRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  ancien_password: string;
  nouveau_password: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
  tenant_id?: number;
  tenant_nom?: string;
  type: 'employee' | 'sadmin';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

// Authentication service
const authService = {
  // Regular employee login
  login: async (credentials: LoginRequest): Promise<ApiResponse<User & { token: string }>> => {
    try {
      const response = await api.post<ApiResponse<User & { token: string }>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la connexion',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Super admin login
  sadminLogin: async (credentials: SadminLoginRequest): Promise<ApiResponse<User & { token: string }>> => {
    try {
      const response = await api.post<ApiResponse<User & { token: string }>>('/auth/super-admin/login', credentials);
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la connexion super admin',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Register new employee (tenant admin only)
  registerEmployee: async (employeeData: RegisterEmployeeRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/register', employeeData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'enregistrement',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Register new tenant (super admin only)
  registerTenant: async (tenantData: RegisterTenantRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/tenant/register', tenantData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création de l\'entreprise',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Register tenant admin (super admin only)
  registerTenantAdmin: async (adminData: RegisterTenantAdminRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/tenant/admin/register', adminData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création de l\'administrateur',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Create super admin (super admin only)
  createSuperAdmin: async (adminData: CreateSuperAdminRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/super-admin/create', adminData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du super admin',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post<ApiResponse<null>>('/auth/logout');
      
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error: any) {
      // Clear local storage even if the request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la déconnexion',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du profil',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post<ApiResponse<null>>('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du changement de mot de passe',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Manually refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>('/auth/token/refresh');
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du rafraîchissement du token',
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  // Helper method to check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  // Helper method to get current user
  getCurrentUser: (): User | null => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  },
  
  // Helper to check if current user is a super admin
  isSuperAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.type === 'sadmin';
  },
  
  // Helper to check if current user is a tenant admin
  isTenantAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.type === 'employee' && user?.role === 'admin';
  }
};

export default authService;