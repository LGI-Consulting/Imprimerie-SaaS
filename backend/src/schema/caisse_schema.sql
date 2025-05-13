-- Modifications pour le système de caisse
-- Ce fichier contient les tables et modifications nécessaires pour la gestion de caisse

-- Table Caisses
CREATE TABLE caisses (
    caisse_id SERIAL PRIMARY KEY,
    numero_caisse VARCHAR(50) NOT NULL UNIQUE,
    employe_id INTEGER REFERENCES employes(employe_id),
    solde_initial DECIMAL(10, 2) NOT NULL DEFAULT 0,
    solde_actuel DECIMAL(10, 2) NOT NULL DEFAULT 0,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('ouverte', 'fermée')),
    date_ouverture TIMESTAMP,
    date_fermeture TIMESTAMP,
    derniere_operation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Mouvements Caisse
CREATE TABLE mouvements_caisse (
    mouvement_id SERIAL PRIMARY KEY,
    caisse_id INTEGER NOT NULL REFERENCES caisses(caisse_id),
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entrée', 'sortie')),
    montant DECIMAL(10, 2) NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    description TEXT,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employe_id INTEGER REFERENCES employes(employe_id),
    reference_transaction VARCHAR(100),
    paiement_id INTEGER REFERENCES paiements(paiement_id),
    solde_avant DECIMAL(10, 2) NOT NULL,
    solde_apres DECIMAL(10, 2) NOT NULL
);

-- Table Compte Exploitant
CREATE TABLE compte_exploitant (
    compte_id SERIAL PRIMARY KEY,
    solde DECIMAL(10, 2) NOT NULL DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Mouvements Compte Exploitant
CREATE TABLE mouvements_compte_exploitant (
    mouvement_id SERIAL PRIMARY KEY,
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entrée', 'sortie')),
    montant DECIMAL(10, 2) NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    description TEXT,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employe_id INTEGER REFERENCES employes(employe_id),
    reference_transaction VARCHAR(100),
    solde_avant DECIMAL(10, 2) NOT NULL,
    solde_apres DECIMAL(10, 2) NOT NULL
);

-- Table Catégories Dépenses
CREATE TABLE categories_depenses (
    categorie_id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('caisse', 'exploitant')),
    est_active BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modifications des tables existantes

-- Ajout de la colonne caisse_id à la table employes
ALTER TABLE employes ADD COLUMN caisse_id INTEGER REFERENCES caisses(caisse_id);

-- Ajout de la colonne caisse_id à la table paiements
ALTER TABLE paiements ADD COLUMN caisse_id INTEGER REFERENCES caisses(caisse_id);

-- Insertion des catégories de dépenses par défaut
INSERT INTO categories_depenses (nom, description, type) VALUES
('Ventes', 'Entrées provenant des ventes', 'caisse'),
('Dépenses opérationnelles', 'Dépenses courantes de l''entreprise', 'caisse'),
('Salaires', 'Paiement des salaires', 'exploitant'),
('Fournitures', 'Achat de fournitures', 'caisse'),
('Maintenance', 'Coûts de maintenance', 'caisse'),
('Investissements', 'Investissements dans l''entreprise', 'exploitant'),
('Prélèvements', 'Prélèvements personnels', 'exploitant'),
('Autres entrées', 'Autres types d''entrées', 'caisse'),
('Autres sorties', 'Autres types de sorties', 'caisse');

-- Création d'un index pour optimiser les recherches sur les mouvements
CREATE INDEX idx_mouvements_caisse_date ON mouvements_caisse(date_mouvement);
CREATE INDEX idx_mouvements_compte_exploitant_date ON mouvements_compte_exploitant(date_mouvement);
CREATE INDEX idx_caisses_statut ON caisses(statut);

-- Ajout de contraintes pour la cohérence des données
ALTER TABLE mouvements_caisse ADD CONSTRAINT check_montant_positif 
CHECK (montant > 0);

ALTER TABLE mouvements_compte_exploitant ADD CONSTRAINT check_montant_positif_compte 
CHECK (montant > 0);

-- Commentaires sur les tables
COMMENT ON TABLE caisses IS 'Gestion des caisses physiques et leur état';
COMMENT ON TABLE mouvements_caisse IS 'Suivi des entrées et sorties d''argent par caisse';
COMMENT ON TABLE compte_exploitant IS 'Compte principal de l''exploitant';
COMMENT ON TABLE mouvements_compte_exploitant IS 'Suivi des mouvements sur le compte de l''exploitant';
COMMENT ON TABLE categories_depenses IS 'Catégorisation des dépenses et entrées'; 