// lib/api/types.ts
export type Role = "admin" | "accueil" | "caisse" | "graphiste";
export type StatutCommande =
  | "reçue"
  | "payée"
  | "en_impression"
  | "terminée"
  | "livrée";
export type SituationPaiement = "credit" | "comptant";
export type MethodePaiement = "espèces" | "Flooz" | "Mixx";
export type StatutPaiement = "en_attente" | "validé" | "échoué";
export type TypeMouvement = "entrée" | "sortie" | "ajustement";
export type TypeRemise = "pourcentage" | "montant_fixe";
export type TypeTransaction =
  | "depot"
  | "retrait"
  | "imputation_dette"
  | "paiement_dette";

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
  dette: number;
  depot: number;
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

export interface StockMateriauxLargeur {
  stock_id: number;
  materiau_id: number;
  largeur: number;
  longeur_en_stock: number;
  seuil_alerte: number;
  unite_mesure: string;
  date_creation: string;
  date_modification: string;
}

export interface MouvementStock {
  mouvement_id: number;
  stock_id: number;
  type_mouvement: TypeMouvement;
  longueur: number;
  date_mouvement: string;
  commande_id: number | null;
  employe_id: number | null;
  commentaire: string | null;
}

export interface MateriauxFormData {
  type_materiau: string;
  nom?: string;
  description?: string;
  prix_unitaire: number;
  unite_mesure: string;
  options_disponibles?: Record<string, any>;
  stocks: {
    largeur: number;
    longeur_en_stock: number;
    seuil_alerte: number;
    unite_mesure: string;
  }[];
}

export interface MouvementStockFormData {
  stock_id: number;
  type_mouvement: TypeMouvement;
  longueur: number;
  commande_id?: number;
  commentaire?: string;
}

export interface Commande {
  commande_id: number;
  client_id: number | null;
  date_creation: string;
  numero_commande: string;
  statut: StatutCommande;
  situation_paiement: SituationPaiement;
  priorite: number;
  commentaires: string | null;
  employe_reception_id: number | null;
  employe_caisse_id: number | null;
  employe_graphiste_id: number | null;
  est_commande_speciale: boolean;
}

export interface PrintFile {
  print_file_id: number;
  commande_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  date_upload: string;
  description?: string;
}

export interface DetailCommande {
  detail_id: number;
  commande_id: number;
  materiau_id: number;
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
  montant_recu: number;
  monnaie_rendue: number;
  reste_a_payer: number;
  methode: MethodePaiement;
  reference_transaction: string | null;
  date_paiement: string;
  statut: StatutPaiement;
  employe_id: number | null;
  numero_commande?: string; // Ajout de cette propriété qui est renvoyée par le backend
}

export interface Facture {
  facture_id: number;
  paiement_id: number;
  numero_facture: string;
  date_emission: string;
  montant_total: number;
  montant_taxe: number;
  remise: number;
  montant_final: number;
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
  details: Record<string, any> | null;
  entite_affectee: string | null;
  entite_id: number | null;
  transaction_id: number | null;
}

export interface TransactionClient {
  transaction_id: number;
  client_id: number;
  type_transaction: TypeTransaction;
  montant: number;
  solde_avant: number;
  solde_apres: number;
  date_transaction: string;
  employe_id: number | null;
  commentaire: string | null;
  reference_transaction: string | null;
}

export interface PaiementsFilter {
  statut?: StatutPaiement;
  methode?: MethodePaiement;
  dateDebut?: string;
  dateFin?: string;
  montantMin?: number;
  montantMax?: number;
  termeRecherche?: string;
}

export interface MateriauxAvecStocks extends Materiau {
  stocks: StockMateriauxLargeur[];
}

export interface ClientStats {
  totalOrders: number;
  totalAmount: number;
  frequency: {
    last6Months: number;
    monthly: string;
  };
  materialPreferences: Record<string, number>;
}

export interface ClientOrder {
  commande_id: number;
  date_creation: string;
  statut: StatutCommande;
  numero_commande: string;
  situation_paiement: SituationPaiement;
  montant_final?: number;
}

export interface ClientDepotRequest {
  montant: number;
  commentaire?: string;
}

export interface ClientRetraitRequest {
  montant: number;
  commentaire?: string;
}

export interface ClientPayerDetteRequest {
  montant: number;
  commentaire?: string;
}

export interface ClientImputerDetteRequest {
  montant: number;
  commentaire?: string;
}

export interface StockOperation {
  materiauId: number;
  stockId: number;
  longueur: number;
  type_mouvement?: TypeMouvement;
  commentaire?: string;
}

export interface SurfaceCalculation {
  largeur: number;
  longueur: number;
  surfaceM2: number;
  valeur: number;
}

// Types pour la caisse
export interface Caisse {
  caisse_id: number;
  numero_caisse: string;
  employe_id: number;
  solde_initial: number;
  solde_actuel: number;
  statut: 'ouverte' | 'fermée';
  date_ouverture: string;
  date_fermeture?: string;
  derniere_operation: string;
}

export interface MouvementCaisse {
  mouvement_id: number;
  caisse_id: number;
  type_mouvement: 'entrée' | 'sortie';
  montant: number;
  categorie: string;
  description?: string;
  date_mouvement: string;
  employe_id: number;
  reference_transaction?: string;
  paiement_id?: number;
  solde_avant: number;
  solde_apres: number;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface CategorieDepense {
  categorie_id: number;
  nom: string;
  description?: string;
  type: 'caisse' | 'exploitant';
  est_active: boolean;
}

// Types pour le compte exploitant
export interface CompteExploitant {
  compte_id: number;
  solde: number;
  date_creation: string;
  date_modification: string;
}

export interface MouvementCompteExploitant {
  mouvement_id: number;
  type_mouvement: 'entrée' | 'sortie';
  montant: number;
  categorie: string;
  description?: string;
  date_mouvement: string;
  employe_id: number;
  reference_transaction?: string;
  solde_avant: number;
  solde_apres: number;
  employe_nom?: string;
  employe_prenom?: string;
}
