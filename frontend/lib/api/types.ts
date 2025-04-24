// lib/api/types.ts
export type Role = 'admin' | 'accueil' | 'caisse' | 'graphiste';
export type StatutCommande = 'reçue' | 'payée' | 'en_impression' | 'terminée' | 'livrée' | 'annulée';
export type MethodePaiement = 'espèces' | 'Flooz' | 'Mixx';
export type StatutPaiement = 'en_attente' | 'validé' | 'échoué';
export type TypeMouvement = 'entrée' | 'sortie' | 'ajustement';
export type TypeRemise = 'pourcentage' | 'montant_fixe';

export interface Employe {
  employe_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  password: string;
  date_embauche: string;
  est_actif: boolean;
}

export interface Client {
  client_id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string;
  adresse: string | null;
  date_creation: string;
  derniere_visite: string;
}

export interface Materiau {
  materiau_id: number;
  type_materiau: string;
  nom: string | null;
  description: string | null;
  prix_unitaire: number;
  unite_mesure: string;
  options_disponibles: Record<string, any>;
  date_creation: string;
  date_modification: string;
}

export interface StockMateriau {
  stock_id: number;
  materiau_id: number;
  largeur: number;
  quantite_en_stock: number;
  seuil_alerte: number;
  unite_mesure: string;
  date_creation: string;
  date_modification: string;
}

export interface Commande {
  commande_id: number;
  client_id: number;
  date_creation: string;
  numero_commande: string;
  statut: StatutCommande;
  priorite: number;
  commentaires: string | null;
  employe_reception_id: number | null;
  employe_caisse_id: number | null;
  employe_graphiste_id: number | null;
  est_commande_speciale: boolean;
  remise?: {
    type: TypeRemise;
    valeur: number;
    code?: string;
    montant_applique: number;
  };
}

export interface PrintFile {
  print_file_id: number;
  commande_id: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  uploaded_by: number | null;
  date_upload: string;
}

export interface DetailCommande {
  detail_id: number;
  commande_id: number;
  materiau_id: number | null;
  travail_id: number | null;
  quantite: number;
  dimensions: string | null;
  prix_unitaire: number;
  sous_total: number;
  commentaires: string | null;
}

export interface Paiement {
  paiement_id: number;
  commande_id: number;
  montant: number;
  methode: MethodePaiement;
  reference_transaction: string | null;
  date_paiement: string;
  statut: StatutPaiement;
  employe_id: number | null;
  montant_recu: number;
  monnaie_rendue: number;
}

export interface Facture {
  facture_id: number;
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

export interface MouvementStock {
  mouvement_id: number;
  stock_id: number | null;
  type_mouvement: TypeMouvement;
  quantite: number;
  date_mouvement: string;
  commande_id: number | null;
  employe_id: number | null;
  commentaire: string | null;
}

export interface Remise {
  remise_id: number;
  type: TypeRemise;
  valeur: number;
  date_debut: string;
  date_fin: string | null;
  client_id: number | null;
  commande_id: number | null;
  code_remise: string | null;
  est_active: boolean;
}

export interface SessionUtilisateur {
  session_id: number;
  employe_id: number | null;
  token_jwt: string;
  date_connexion: string;
  date_expiration: string;
  adresse_ip: string | null;
  appareil: string | null;
}

export interface JournalActivite {
  log_id: number;
  employe_id: number | null;
  action: string;
  date_action: string;
  details: string | null;
  entite_affectee: string | null;
  entite_id: number | null;
}

export interface PaiementsFilter {
  status?: StatutPaiement;
  method?: MethodePaiement;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}