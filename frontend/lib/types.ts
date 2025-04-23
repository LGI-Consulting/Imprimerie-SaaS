// Common API Response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Error Response type
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: Record<string, string[]>;
}

// User type
export interface User {
  employe_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  est_actif: boolean;
  date_embauche: string;
  created_at?: string;
  updated_at?: string;
}

// Pagination type
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Common query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
  est_actif?: boolean;
} 