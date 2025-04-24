import { MethodePaiement } from '../api/types';

export interface ReceiptData {
  numero_facture: string;
  date_emission: string;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  commande: {
    numero: string;
    details: Array<{
      description: string;
      dimensions?: string;
      quantite: number;
      prix_unitaire: number;
      sous_total: number;
    }>;
  };
  paiement: {
    methode: MethodePaiement;
    montant_recu: number;
    monnaie_rendue: number;
    reference?: string;
  };
  montants: {
    sous_total: number;
    remise: number;
    total: number;
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