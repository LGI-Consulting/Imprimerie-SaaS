-- Table Employés
CREATE TABLE employes (
    employe_id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telephone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accueil', 'caisse', 'graphiste')),
    password VARCHAR(255) NOT NULL,
    date_embauche DATE NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);

-- Table Clients
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    dette DECIMAL(10, 2) NOT NULL DEFAULT 0,
    depot DECIMAL(10, 2) NOT NULL DEFAULT 0,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20) NOT NULL,
    adresse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_visite TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Matériaux
CREATE TABLE materiaux (
    materiau_id SERIAL PRIMARY KEY,
    type_materiau VARCHAR(100) NOT NULL,
    nom VARCHAR(100),
    description TEXT,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(20) NOT NULL,
    options_disponibles JSONB DEFAULT '{}',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Stocks par largeur
CREATE TABLE stocks_materiaux_largeur (
    stock_id SERIAL PRIMARY KEY,
    materiau_id INTEGER NOT NULL REFERENCES materiaux(materiau_id) ON DELETE CASCADE,
    largeur DECIMAL(10, 2) NOT NULL,
    longeur_en_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    seuil_alerte DECIMAL(10, 2) NOT NULL DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (materiau_id, largeur)
);

-- Table Commandes
CREATE TABLE commandes (
    commande_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(client_id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_commande VARCHAR(50) UNIQUE,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('reçue', 'payée', 'en_impression', 'terminée', 'livrée')),
    situation_paiement VARCHAR(20) NOT NULL CHECK (situation_paiement IN ('credit', 'comptant')),
    priorite INTEGER DEFAULT 0,
    commentaires TEXT,
    employe_reception_id INTEGER REFERENCES employes(employe_id) ON DELETE SET NULL,
    employe_caisse_id INTEGER REFERENCES employes(employe_id) ON DELETE SET NULL,
    employe_graphiste_id INTEGER REFERENCES employes(employe_id) ON DELETE SET NULL,
    est_commande_speciale BOOLEAN DEFAULT FALSE
);

-- Table Fichiers d'impression
CREATE TABLE print_files (
    print_file_id SERIAL PRIMARY KEY,
    commande_id INTEGER NOT NULL REFERENCES commandes(commande_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_by INTEGER REFERENCES employes(employe_id) ON DELETE SET NULL,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (commande_id, file_name)
);

-- Table Détails de commande
CREATE TABLE details_commande (
    detail_id SERIAL PRIMARY KEY,
    commande_id INTEGER NOT NULL REFERENCES commandes(commande_id) ON DELETE CASCADE,
    materiau_id INTEGER REFERENCES materiaux(materiau_id),
    quantite DECIMAL(10, 2) NOT NULL,
    dimensions VARCHAR(100),
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) NOT NULL,
    commentaires TEXT
);

-- Table Paiements
CREATE TABLE paiements (
    paiement_id SERIAL PRIMARY KEY,
    commande_id INTEGER NOT NULL REFERENCES commandes(commande_id) ON DELETE CASCADE,
    montant DECIMAL(10, 2) NOT NULL,
    monnaie_rendue DECIMAL(10, 2) NOT NULL,
    reste_a_payer DECIMAL(10, 2) NOT NULL,
    methode VARCHAR(20) NOT NULL CHECK (methode IN ('espèces', 'Flooz', 'Mixx')),
    reference_transaction VARCHAR(100),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('en_attente', 'validé', 'échoué')),
    employe_id INTEGER REFERENCES employes(employe_id) ON DELETE SET NULL
);

-- Table Factures
CREATE TABLE factures (
    facture_id SERIAL PRIMARY KEY,
    paiement_id INTEGER NOT NULL REFERENCES paiements(paiement_id) ON DELETE CASCADE,
    numero_facture VARCHAR(50) NOT NULL UNIQUE,
    date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10, 2) NOT NULL,
    montant_taxe DECIMAL(10, 2) NOT NULL DEFAULT 0,
    remise DECIMAL(10, 2) NOT NULL DEFAULT 0,
    montant_final DECIMAL(10, 2) NOT NULL
);

-- Table Mouvements de stock
CREATE TABLE mouvements_stock (
    mouvement_id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks_materiaux_largeur(stock_id),
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entrée', 'sortie', 'ajustement')),
    longueur DECIMAL(10, 2) NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commande_id INTEGER REFERENCES commandes(commande_id),
    employe_id INTEGER REFERENCES employes(employe_id),
    commentaire TEXT
);

-- Table Remises
CREATE TABLE remises (
    remise_id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pourcentage', 'montant_fixe')),
    valeur DECIMAL(10, 2) NOT NULL,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP,
    client_id INTEGER REFERENCES clients(client_id),
    commande_id INTEGER REFERENCES commandes(commande_id),
    code_remise VARCHAR(50),
    est_active BOOLEAN DEFAULT TRUE
);

-- Table Sessions Utilisateurs
CREATE TABLE sessions_utilisateurs (
    session_id SERIAL PRIMARY KEY,
    employe_id INTEGER REFERENCES employes(employe_id),
    token_jwt TEXT NOT NULL,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    adresse_ip VARCHAR(45),
    appareil VARCHAR(255)
);

-- Journal des activités
CREATE TABLE journal_activites (
    log_id SERIAL PRIMARY KEY,
    employe_id INTEGER REFERENCES employes(employe_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    entite_affectee VARCHAR(50),
    entite_id INTEGER,
    transaction_id INTEGER
);

-- Transactions financières clients
CREATE TABLE transactions_clients (
    transaction_id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(client_id),
    type_transaction VARCHAR(20) NOT NULL CHECK (type_transaction IN ('depot', 'retrait', 'imputation_dette', 'paiement_dette')),
    montant DECIMAL(10, 2) NOT NULL,
    solde_avant DECIMAL(10, 2) NOT NULL,
    solde_apres DECIMAL(10, 2) NOT NULL,
    date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employe_id INTEGER REFERENCES employes(employe_id),
    commentaire TEXT,
    reference_transaction VARCHAR(100)
);
