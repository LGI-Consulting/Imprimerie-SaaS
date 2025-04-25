// lib/api/auth.ts
import api from './config';
import type { Employe } from './types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  password: string;
  date_embauche: string;
}

export interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

export const auth = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  getProfile: async (): Promise<UserData> => {
    const response = await api.get<{ data: UserData }>('/auth/profile');
    return response.data.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/token/refresh');
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },
};

export default auth;