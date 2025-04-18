// api/payment.api.ts
import apiClient from './apiClient';
import { Payment, Invoice } from './types';

export const PaymentApi = {
  // Payment endpoints
  createPayment: async (data: Omit<Payment, 'paiement_id'>): Promise<Payment> => {
    return apiClient.post('/paiement/pay', data);
  },
  getAllPayments: async (): Promise<Payment[]> => {
    return apiClient.get('/paiement/pay');
  },
  getPaymentById: async (id: number): Promise<Payment> => {
    return apiClient.get(`/paiement/pay/${id}`);
  },
  updatePayment: async (id: number, data: Partial<Payment>): Promise<Payment> => {
    return apiClient.put(`/paiement/pay/${id}`, data);
  },
  deletePayment: async (id: number): Promise<void> => {
    return apiClient.delete(`/paiement/getPay/${id}`);
  },

  // Invoice endpoints
  getAllInvoices: async (): Promise<Invoice[]> => {
    return apiClient.get('/paiement/invoice');
  },
  getInvoiceById: async (id: number): Promise<Invoice> => {
    return apiClient.get(`/paiement/invoice/${id}`);
  },
  updateInvoice: async (id: number, data: Partial<Invoice>): Promise<Invoice> => {
    return apiClient.put(`/paiement/invoice/${id}`, data);
  },
  deleteInvoice: async (id: number): Promise<void> => {
    return apiClient.delete(`/paiement/invoice/${id}`);
  }
};