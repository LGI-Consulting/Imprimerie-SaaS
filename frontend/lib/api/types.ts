
// api/types.ts
export interface Employee {
    employe_id: number;
    tenant_id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: 'admin' | 'accueil' | 'caisse' | 'graphiste';
    date_embauche: string;
    est_actif: boolean;
  }
  
  export interface Client {
    client_id: number;
    tenant_id: number;
    nom: string;
    prenom: string;
    email: string | null;
    telephone: string;
    adresse: string | null;
    date_creation: string;
    derniere_visite: string;
  }

  export interface Tenant {
    tenant_id: number;
    nom: string;
    prenom: string;
    email: string | null;
    telephone: string;
    adresse: string | null;
    description: string;
    logo_url: string;
    date_creation: string;
    est_actif: boolean;
  }
  
  export interface Material {
    materiau_id: number;
    tenant_id: number;
    type_materiau: string;
    nom: string;
    description: string | null;
    prix_unitaire: number;
    unite_mesure: string;
    options_disponibles: Record<string, any>;
    date_creation: string;
    date_modification: string;
  }
  
  export interface Order {
    commande_id: number;
    tenant_id: number;
    client_id: number | null;
    date_creation: string;
    numero_commande: string;
    statut: 'reçue' | 'payée' | 'en_impression' | 'terminée' | 'livrée';
    priorite: number;
    commentaires: string | null;
    employe_reception_id: number | null;
    employe_caisse_id: number | null;
    employe_graphiste_id: number | null;
    est_commande_speciale: boolean;
    total?: number;
    // These fields will be populated when getting a single order with joined tables
    client?: Client;
    employe_graphiste?: {
      nom: string;
      prenom: string;
    };
    details?: OrderDetail[];
  }
  
  export interface Payment {
    paiement_id: number;
    tenant_id: number;
    commande_id: number;
    montant: number;
    methode: 'espèces' | 'Flooz' | 'Mixx';
    reference_transaction: string | null;
    date_paiement: string;
    statut: 'en_attente' | 'validé' | 'échoué';
    employe_id: number | null;
  }
  
  export interface Invoice {
    facture_id: number;
    tenant_id: number;
    commande_id: number;
    numero_facture: string;
    date_emission: string;
    montant_total: number;
    montant_taxe: number;
    remise: number;
    montant_final: number;
    chemin_pdf: string | null;
    date_paiement: string | null;
  }
  
  export interface OrderDetail {
    detail_id: number;
    commande_id: number;
    materiau_id: number | null;
    travail_id: number | null;
    quantite: number;
    dimensions: string | null;
    prix_unitaire: number;
    sous_total: number;
    commentaires: string | null;
    materiau_nom?: string; // Included when getting details with joined tables
  }
  
  export interface EmployeeActivity {
    log_id: number;
    tenant_id: number;
    employe_id: number;
    action: string;
    date_action: string;
    details: string | null;
    entite_affectee: string | null;
    entite_id: number | null;
  }