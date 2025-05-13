export interface Rouleau {
  rouleau_id: number;
  materiau_id: number;
  largeur: number;
  longueur_initiale: number;
  longueur_restante: number;
  numero_rouleau: string;
  date_reception: string;
  fournisseur: string;
  prix_achat_total: number;
  est_actif: boolean;
  materiau_nom: string;
  type_materiau: string;
}

export interface Utilisation {
  utilisation_id: number;
  commande_id: number;
  rouleau_id: number;
  longueur_theorique: number;
  longueur_reelle: number;
  date_utilisation: string;
  commentaire: string;
  est_valide: boolean;
  numero_rouleau: string;
  materiau_nom: string;
  largeur: number;
}

export interface StockStats {
  materiau_id: number;
  materiau_nom: string;
  type_materiau: string;
  largeur: number;
  longueur_totale: number;
  nombre_rouleaux: number;
  seuil_alerte: number;
}

export interface UtilisationStats {
  date: string;
  longueur_theorique_totale: number;
  longueur_reelle_totale: number;
  nombre_utilisations: number;
  difference_moyenne: number;
  pourcentage_moyen: number;
}

export interface NewRouleau {
  materiau_id: number;
  largeur: number;
  longueur_initiale: number;
  numero_rouleau: string;
  fournisseur: string;
  prix_achat_total: number;
} 