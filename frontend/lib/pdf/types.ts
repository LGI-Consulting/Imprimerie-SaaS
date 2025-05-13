import { MethodePaiement } from '../api/types';
import { Client } from '../api/types';

export interface ReceiptData {
  numero_facture: string;
  date_emission: string;
  date_paiement?: string;
  client: {
    nom: string;
    prenom: string;
    telephone?: string;
  };
  commande: {
    numero: string;
  };
  paiement: {
    methode: string;
    montant_recu: number;
    monnaie_rendue: number;
    reste_a_payer?: number;
    reference?: string;
  };
  montants: {
    total: number;
    taxe: number;
    final: number;
  };
}

export interface PDFStyles {
  page: {
    padding: number;
    fontFamily: string;
  };
  header: {
    marginBottom: number;
  };
  title: {
    fontSize: number;
    fontWeight: string;
    marginBottom: number;
  };
  invoiceNumber: {
    fontSize: number;
    marginBottom: number;
  };
  clientInfo: {
    marginBottom: number;
  };
  sectionTitle: {
    fontSize: number;
    fontWeight: string;
    marginBottom: number;
  };
  orderDetails: {
    marginBottom: number;
  };
  paymentDetails: {
    marginBottom: number;
  };
  amounts: {
    marginBottom: number;
  };
  total: {
    fontSize: number;
    fontWeight: string;
  };
  footer: {
    marginTop: number;
    textAlign: string;
  };
}

// Types pour les dimensions
export interface Dimensions {
  longueur?: number;
  largeur_materiau?: number;
  largeur_demandee?: number;
  largeur_calcul?: number;
  surface_unitaire?: number;
  nombre_exemplaires?: number;
}

// Type pour les options
export interface OptionData {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Type pour les détails de commande
export interface OrderDetailData {
  materiau_id: number;
  materiau?: {
    materiau_id: number;
    type_materiau: string;
    nom?: string | null;  // Permettre null ici
  };
  dimensions?: string;  // Dimensions est optionnel
  quantite: number;
  prix_unitaire: number;
  sous_total?: number;
  options?: OptionData[];
  commentaires?: string | null;  // Permettre null ici
}

// Type pour les données de facture
export interface OrderInvoiceData {
  numero_commande: string;
  date_creation: string;
  statut: string;
  client: Client;
  situation_paiement: string;
  details: OrderDetailData[];
  remise?: {
    type: string;
    valeur: number;
    montant_applique: number;
  };
  commentaires?: string;  // Pas de null ici, seulement string ou undefined
}
