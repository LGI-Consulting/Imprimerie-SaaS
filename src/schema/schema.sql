-- Création des tables

-- Table Clients
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
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
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(20) NOT NULL,
    quantite_en_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    seuil_alerte DECIMAL(10, 2) NOT NULL DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Employés
CREATE TABLE employes (
    employe_id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE ,
    telephone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accueil', 'caisse', 'graphiste')),
    mot_de_passe VARCHAR(255) NOT NULL,
    date_embauche DATE NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);

-- Table Travaux d'Impression
CREATE TABLE travaux (
    travail_id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix_base DECIMAL(10, 2) NOT NULL,
    temps_estime INTEGER  -- en minutes
);

-- Table Commandes
CREATE TABLE commandes (
    commande_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(client_id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('reçue', 'payée', 'en_impression', 'terminée', 'livrée')),
    priorite INTEGER DEFAULT 0,
    commentaires TEXT,
    employe_reception_id INTEGER REFERENCES employes(employe_id),
    employe_caisse_id INTEGER REFERENCES employes(employe_id),
    employe_graphiste_id INTEGER REFERENCES employes(employe_id),
    est_commande_speciale BOOLEAN DEFAULT FALSE,
);

-- Table Détails de Commande
CREATE TABLE details_commande (
    detail_id SERIAL PRIMARY KEY,
    commande_id INTEGER REFERENCES commandes(commande_id) ON DELETE CASCADE,
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
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_stockage VARCHAR(255) NOT NULL,
    type_fichier VARCHAR(50),
    taille BIGINT,  -- en octets
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dimensions VARCHAR(100),
    resolution VARCHAR(50),
    statut_verification VARCHAR(20) DEFAULT 'en_attente'
);

-- Table Paiements
CREATE TABLE paiements (
    paiement_id SERIAL PRIMARY KEY,
    commande_id INTEGER REFERENCES commandes(commande_id) ON DELETE CASCADE,
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
    commande_id INTEGER REFERENCES commandes(commande_id) ON DELETE CASCADE,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10, 2) NOT NULL,
    montant_taxe DECIMAL(10, 2) NOT NULL DEFAULT 0,
    remise DECIMAL(10, 2) NOT NULL DEFAULT 0,
    montant_final DECIMAL(10, 2) NOT NULL,
    chemin_pdf VARCHAR(255),
    date_paiement TIMESTAMP
);

-- Table Mouvements de Stock
CREATE TABLE mouvements_stock (
    mouvement_id SERIAL PRIMARY KEY,
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
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    est_lue BOOLEAN DEFAULT FALSE,
    destinataire_id INTEGER REFERENCES employes(employe_id)
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

-- Table Journal des Activités
CREATE TABLE journal_activites (
    log_id SERIAL PRIMARY KEY,
    employe_id INTEGER REFERENCES employes(employe_id),
    action VARCHAR(100) NOT NULL,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    entite_affectee VARCHAR(50),
    entite_id INTEGER
);

-- Index pour améliorer les performances
CREATE INDEX idx_client_telephone ON clients(telephone);
CREATE INDEX idx_client_email ON clients(email);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_commandes_date ON commandes(date_creation);
CREATE INDEX idx_paiements_date ON paiements(date_paiement);
CREATE INDEX idx_materiaux_stock ON materiaux(quantite_en_stock);
CREATE INDEX idx_mouvements_materiau ON mouvements_stock(materiau_id);
CREATE INDEX idx_journal_date ON journal_activites(date_action);
CREATE INDEX idx_details_commande ON details_commande(commande_id);
CREATE INDEX idx_fichiers_detail ON fichiers(detail_id);

-- Trigger pour mettre à jour la date de dernière visite du client
CREATE OR REPLACE FUNCTION update_client_derniere_visite()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE clients
    SET derniere_visite = CURRENT_TIMESTAMP
    WHERE client_id = NEW.client_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_client_visite
AFTER INSERT ON commandes
FOR EACH ROW
EXECUTE FUNCTION update_client_derniere_visite();

-- Trigger pour mettre à jour le stock après un mouvement
CREATE OR REPLACE FUNCTION update_stock_after_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type_mouvement = 'entrée' THEN
        UPDATE materiaux
        SET quantite_en_stock = quantite_en_stock + NEW.quantite,
            date_modification = CURRENT_TIMESTAMP
        WHERE materiau_id = NEW.materiau_id;
    ELSIF NEW.type_mouvement = 'sortie' THEN
        UPDATE materiaux
        SET quantite_en_stock = quantite_en_stock - NEW.quantite,
            date_modification = CURRENT_TIMESTAMP
        WHERE materiau_id = NEW.materiau_id;
    ELSIF NEW.type_mouvement = 'ajustement' THEN
        UPDATE materiaux
        SET quantite_en_stock = NEW.quantite,
            date_modification = CURRENT_TIMESTAMP
        WHERE materiau_id = NEW.materiau_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_stock
AFTER INSERT ON mouvements_stock
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_movement();

-- Trigger pour créer une notification lorsque le stock descend en dessous du seuil d'alerte
CREATE OR REPLACE FUNCTION create_low_stock_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantite_en_stock <= NEW.seuil_alerte THEN
        INSERT INTO notifications (type, message, destinataire_id)
        SELECT 'alerte_stock', 'Le stock de ' || NEW.nom || ' est bas (' || NEW.quantite_en_stock || ' ' || NEW.unite_mesure || ' restants)', employe_id
        FROM employes
        WHERE role = 'admin';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_low_stock_notification
AFTER UPDATE ON materiaux
FOR EACH ROW
WHEN (NEW.quantite_en_stock <= NEW.seuil_alerte)
EXECUTE FUNCTION create_low_stock_notification();