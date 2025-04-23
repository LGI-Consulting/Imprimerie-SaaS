import { api } from './api-config';

export interface Order {
  commande_id: string;
  client_id: string;
  date_creation: string;
  statut: string;
  priorite: number;
  commentaires: string | null;
  est_commande_speciale: boolean;
  numero_commande: string;
  employe_reception_id?: string;
  employe_caisse_id?: string;
  employe_graphiste_id?: string;
  client?: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse?: string;
  };
  employe_graphiste?: {
    nom: string;
    prenom: string;
  };
  details: OrderDetail[];
}

export interface OrderDetail {
  detail_id: string;
  materiau_id: string;
  travail_id?: string;
  quantite: number;
  dimensions: {
    largeur_demandee: number;
    longueur: number;
    largeur_materiau: number;
    largeur_calcul: number;
    surface_unitaire: number;
    nombre_exemplaires: number;
    surface_totale: number;
  };
  prix_unitaire: number;
  sous_total: number;
  materiau_nom?: string;
  commentaires?: {
    options: OrderOption[];
    commentaires: string | null;
    materiau_nom: string;
    materiau_largeur: number;
    prix_options_unitaire: number;
    prix_options_total: number;
    prix_base_unitaire: number;
    prix_base_total: number;
    nombre_exemplaires: number;
  };
}

export interface OrderOption {
  nom: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface OrderFilter {
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderData {
  clientInfo: {
    client_id?: string;
    nom: string;
    prenom: string;
    email?: string;
    telephone: string;
    adresse?: string;
  };
  materialType: string;
  width: number;
  length: number;
  quantity: number;
  options?: {
    comments?: string;
    designFiles?: Array<{
      name: string;
      size: string;
      type: string;
    }>;
  };
  est_commande_speciale?: boolean;
}

export const orderService = {
  // Get all orders with optional filtering
  async getAllOrders(filter?: OrderFilter): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);
    
    const response = await api.get<Order[]>(`/commandes?${params.toString()}`);
    return response.data;
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get<Order>(`/commandes/${orderId}`);
    return response.data;
  },

  // Get orders by client ID
  async getOrdersByClient(clientId: string): Promise<Order[]> {
    const response = await api.get<Order[]>(`/commandes/client/${clientId}`);
    return response.data;
  },

  // Get orders by status
  async getOrdersByStatus(status: string): Promise<Order[]> {
    const response = await api.get<Order[]>(`/commandes/status/${status}`);
    return response.data;
  },

  // Get orders by material type
  async getOrdersByMaterial(materialType: string): Promise<Order[]> {
    const response = await api.get<Order[]>(`/commandes/material/${materialType}`);
    return response.data;
  },

  // Create a new order
  async createOrder(orderData: CreateOrderData): Promise<{
    message: string;
    commande_id: string;
    numero_commande: string;
    details: any;
  }> {
    const response = await api.post('/commandes', orderData);
    return response.data;
  },

  // Update an existing order
  async updateOrder(orderId: string, updateData: Partial<Order>): Promise<Order> {
    const response = await api.put(`/commandes/${orderId}`, updateData);
    return response.data;
  },

  // Delete an order
  async deleteOrder(orderId: string): Promise<{ message: string }> {
    const response = await api.delete(`/commandes/${orderId}`);
    return response.data;
  }
}; 