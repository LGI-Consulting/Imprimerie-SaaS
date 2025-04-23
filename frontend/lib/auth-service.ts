import { api } from './api-config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  employe_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  est_actif: boolean;
  date_embauche: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data.data;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  },
}; 