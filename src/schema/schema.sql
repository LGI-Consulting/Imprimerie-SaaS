-- Table des tenants (entreprises)
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    adresse TEXT,
    telephone VARCHAR(30),
    email VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE
);

-- Table des super admin système
CREATE TABLE super_admin (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,  
    password VARCHAR(255) NOT NULL,      
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP,
    statut BOOLEAN DEFAULT TRUE  
);

-- Table Employés
CREATE TABLE employes (
    employe_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accueil', 'caisse', 'graphiste')),
    mot_de_passe VARCHAR(255) NOT NULL,
    date_embauche DATE NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE,
    UNIQUE (email, tenant_id)  -- Permet d'avoir le même email dans différents tenants
);

-- Table Clients
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
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
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(20) NOT NULL,
    quantite_en_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    seuil_alerte DECIMAL(10, 2) NOT NULL DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Travaux d'Impression
CREATE TABLE travaux (
    travail_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix_base DECIMAL(10, 2) NOT NULL,
    temps_estime INTEGER
);

-- Table Commandes
CREATE TABLE commandes (
    commande_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(client_id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('reçue', 'payée', 'en_impression', 'terminée', 'livrée')),
    priorite INTEGER DEFAULT 0,
    commentaires TEXT,
    employe_reception_id INTEGER REFERENCES employes(employe_id),
    employe_caisse_id INTEGER REFERENCES employes(employe_id),
    employe_graphiste_id INTEGER REFERENCES employes(employe_id),
    est_commande_speciale BOOLEAN DEFAULT FALSE
);

-- Table Détails de Commande
CREATE TABLE details_commande (
    detail_id SERIAL PRIMARY KEY,
    commande_id INTEGER NOT NULL REFERENCES commandes(commande_id) ON DELETE CASCADE,
    materiau_id INTEGER REFERENCES materiaux(materiau_id),
    travail_id INTEGER REFERENCES travaux(travail_id),
    quantite DECIMAL(10, 2) NOT NULL,
    dimensions VARCHAR(100),
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) NOT NULL,
    commentaires TEXT
);

-- Table Fichiers
CREATE TABLE fichiers (
    fichier_id SERIAL PRIMARY KEY,
    detail_id INTEGER REFERENCES details_commande(detail_id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_stockage VARCHAR(255) NOT NULL,
    type_fichier VARCHAR(50),
    taille BIGINT,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dimensions VARCHAR(100),
    resolution VARCHAR(50),
    statut_verification VARCHAR(20) DEFAULT 'en_attente'
);

-- Table Paiements
CREATE TABLE paiements (
    paiement_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    commande_id INTEGER NOT NULL REFERENCES commandes(commande_id) ON DELETE CASCADE,
    montant DECIMAL(10, 2) NOT NULL,
    methode VARCHAR(20) NOT NULL CHECK (methode IN ('espèces', 'Flooz', 'Mixx')),
    reference_transaction VARCHAR(100),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('en_attente', 'validé', 'échoué')),
    employe_id INTEGER REFERENCES employes(employe_id)
);

-- Table Factures
CREATE TABLE factures (
    facture_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    commande_id INTEGER NOT NULL REFERENCES commandes(commande_id) ON DELETE CASCADE,
    numero_facture VARCHAR(50) NOT NULL,
    date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10, 2) NOT NULL,
    montant_taxe DECIMAL(10, 2) NOT NULL DEFAULT 0,
    remise DECIMAL(10, 2) NOT NULL DEFAULT 0,
    montant_final DECIMAL(10, 2) NOT NULL,
    chemin_pdf VARCHAR(255),
    date_paiement TIMESTAMP,
    UNIQUE (numero_facture, tenant_id)  -- Permet d'avoir le même numéro dans différents tenants
);

-- Table Mouvements de Stock
CREATE TABLE mouvements_stock (
    mouvement_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    materiau_id INTEGER REFERENCES materiaux(materiau_id),
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entrée', 'sortie', 'ajustement')),
    quantite DECIMAL(10, 2) NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commande_id INTEGER REFERENCES commandes(commande_id),
    employe_id INTEGER REFERENCES employes(employe_id),
    commentaire TEXT
);

-- Table Remises
CREATE TABLE remises (
    remise_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pourcentage', 'montant_fixe')),
    valeur DECIMAL(10, 2) NOT NULL,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP,
    client_id INTEGER REFERENCES clients(client_id),
    commande_id INTEGER REFERENCES commandes(commande_id),
    code_remise VARCHAR(50),
    est_active BOOLEAN DEFAULT TRUE
);

-- Table Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    est_lue BOOLEAN DEFAULT FALSE,
    destinataire_id INTEGER REFERENCES employes(employe_id)
);

-- Table Sessions Utilisateurs
CREATE TABLE sessions_utilisateurs (
    session_id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    employe_id INTEGER REFERENCES employes(employe_id),
    super_admin_id INTEGER REFERENCES super_admin(admin_id),
    token_jwt TEXT NOT NULL,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    adresse_ip VARCHAR(45),
    appareil VARCHAR(255)
);

-- Table Journal des Activités
CREATE TABLE journal_activites (
    log_id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    employe_id INTEGER REFERENCES employes(employe_id),
    super_admin_id INTEGER REFERENCES super_admin(admin_id),
    action VARCHAR(100) NOT NULL,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    entite_affectee VARCHAR(50),
    entite_id INTEGER
);