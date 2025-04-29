import pool from "../config/db.js";

// Récupérer tous les clients
export const getAllClients = async (req, res) => {
  try {
    const query = "SELECT * FROM clients";
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des clients.",
      error: error.message,
    });
  }
};

// Récupérer un client par son ID
export const getClientById = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const query = "SELECT * FROM clients WHERE client_id = $1";
    const { rows } = await pool.query(query, [clientId]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Client non trouvé." });
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du client.",
      error: error.message,
    });
  }
};

// Rechercher un client par nom, prénom, téléphone ou email
export const getClientBySearch = async (req, res) => {
  try {
    const { query } = req.query;
    const searchQuery = `
      SELECT * FROM clients
      WHERE nom ILIKE $1 OR prenom ILIKE $1 OR telephone ILIKE $1 OR email ILIKE $1
    `;
    const { rows } = await pool.query(searchQuery, [`%${query}%`]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la recherche de clients.",
      error: error.message,
    });
  }
};

// Créer un nouveau client
export const createClient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const employeId = req.body;

    const { nom, prenom, telephone, email, adresse, dette, depot } = req.body;

    const checkQuery =
      "SELECT * FROM clients WHERE telephone = $1 OR email = $2";
    const { rows } = await client.query(checkQuery, [telephone, email || ""]);

    if (rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Un client avec ce téléphone ou cet email existe déjà.",
      });
    }

    const insertQuery = `
      INSERT INTO clients (nom, prenom, email, telephone, adresse, dette, depot, date_creation, derniere_visite)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const values = [nom, prenom, email, telephone, adresse, dette, depot];
    const result = await client.query(insertQuery, values);

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'creation_client', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      nom: nom,
      prenom: prenom,
      telephone: telephone,
      email: email,
      adresse: adresse,
      dette: dette,
      depot: depot,
    });
    await client.query(logQuery, [
      employeId,
      detailsJson,
      result.rows[0].client_id,
      null,
    ]);

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors de la création du client.",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Mettre à jour un client
export const updateClient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id: clientId } = req.params;
    const employeId = req.body;
    const { nom, prenom, telephone, email, adresse, dette, depot } = req.body;

    const checkQuery = "SELECT * FROM clients WHERE client_id = $1";
    const { rows } = await client.query(checkQuery, [clientId]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const updateQuery = `
      UPDATE clients
      SET nom = $1, prenom = $2, telephone = $3, email = $4, adresse = $5, dette = $6, depot = $7, derniere_visite = CURRENT_TIMESTAMP
      WHERE client_id = $8
      RETURNING *
    `;
    const values = [
      nom,
      prenom,
      telephone,
      email,
      adresse,
      dette,
      depot,
      clientId,
    ];
    const result = await client.query(updateQuery, values);

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'mise_a_jour_client', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      nom: nom,
      prenom: prenom,
      telephone: telephone,
      email: email,
      adresse: adresse,
      dette: dette,
      depot: depot,
    });
    await client.query(logQuery, [employeId, detailsJson, clientId, null]);

    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors de la mise à jour du client.",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Supprimer un client
export const deleteClient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id: clientId } = req.params;
    const employeId = req.body;

    const checkQuery = "SELECT * FROM clients WHERE client_id = $1";
    const { rows } = await client.query(checkQuery, [clientId]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const deleteQuery = "DELETE FROM clients WHERE client_id = $1 RETURNING *";
    await client.query(deleteQuery, [clientId]);

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'suppression_client', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      nom: nom,
      prenom: prenom,
      telephone: telephone,
      email: email,
      adresse: adresse,
      dette: dette,
      depot: depot,
    });
    await client.query(logQuery, [employeId, detailsJson, clientId, null]);

    await client.query("COMMIT");
    res.status(200).json({ message: "Client supprimé avec succès." });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors de la suppression du client.",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Récupérer l'historique des commandes d'un client
export const getClientOrders = async (req, res) => {
  try {
    const { id: clientId } = req.params;

    const query = `
      SELECT c.*, f.numero_facture, f.montant_final
      FROM commandes c
      LEFT JOIN factures f ON c.commande_id = f.commande_id
      WHERE c.client_id = $1
      ORDER BY c.date_creation DESC
    `;
    const { rows } = await pool.query(query, [clientId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes du client.",
      error: error.message,
    });
  }
};

// Récupérer les statistiques d'achat d'un client
export const getClientStats = async (req, res) => {
  try {
    const { id: clientId } = req.params;

    const totalStatsQuery = `
      SELECT COUNT(c.commande_id) AS total_orders, SUM(f.montant_final) AS total_amount
      FROM commandes c
      JOIN factures f ON c.commande_id = f.commande_id
      WHERE c.client_id = $1
    `;
    const { rows: totalRows } = await pool.query(totalStatsQuery, [clientId]);
    const totalStats = totalRows[0];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const frequencyQuery = `
      SELECT COUNT(*) AS recent_orders
      FROM commandes
      WHERE client_id = $1 AND date_creation >= $2
    `;
    const { rows: freqRows } = await pool.query(frequencyQuery, [
      clientId,
      sixMonthsAgo,
    ]);

    const preferencesQuery = `
      SELECT m.nom, COUNT(dc.materiau_id) AS count
      FROM details_commande dc
      JOIN commandes c ON dc.commande_id = c.commande_id
      JOIN materiaux m ON dc.materiau_id = m.materiau_id
      WHERE c.client_id = $1
      GROUP BY m.nom
      ORDER BY count DESC
    `;
    const { rows: prefRows } = await pool.query(preferencesQuery, [clientId]);
    const materialPreferences = {};
    prefRows.forEach((row) => {
      materialPreferences[row.nom] = parseInt(row.count);
    });

    res.status(200).json({
      totalOrders: parseInt(totalStats.total_orders) || 0,
      totalAmount: parseFloat(totalStats.total_amount) || 0,
      frequency: {
        last6Months: parseInt(freqRows[0].recent_orders) || 0,
        monthly: ((parseInt(freqRows[0].recent_orders) || 0) / 6).toFixed(1),
      },
      materialPreferences,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du calcul des statistiques client.",
      error: error.message,
    });
  }
};

// Ajouter un dépôt pour un client
export const ajouterDepot = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id: clientId } = req.params;
    const { montant, commentaire, employeId } = req.body;

    // Vérifier que le client existe
    const checkClientQuery =
      "SELECT client_id, depot FROM clients WHERE client_id = $1";
    const { rows: clientRows } = await client.query(checkClientQuery, [
      clientId,
    ]);

    if (clientRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const soldeAvant = parseFloat(clientRows[0].depot);
    const soldeApres = soldeAvant + parseFloat(montant);

    // Mettre à jour le solde du dépôt du client
    const updateClientQuery =
      "UPDATE clients SET depot = $1 WHERE client_id = $2 RETURNING *";
    const { rows: updatedClientRows } = await client.query(updateClientQuery, [
      soldeApres,
      clientId,
    ]);

    // Enregistrer la transaction
    const insertTransactionQuery = `
      INSERT INTO transactions_clients 
      (client_id, type_transaction, montant, solde_avant, solde_apres, employe_id, commentaire)
      VALUES ($1, 'depot', $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const transactionValues = [
      clientId,
      montant,
      soldeAvant,
      soldeApres,
      employeId,
      commentaire,
    ];
    const { rows: transactionRows } = await client.query(
      insertTransactionQuery,
      transactionValues
    );

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'ajout_depot', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      montant: montant,
      solde_avant: soldeAvant,
      solde_apres: soldeApres,
    });
    await client.query(logQuery, [
      employeId,
      detailsJson,
      clientId,
      transactionRows[0].transaction_id,
    ]);

    await client.query("COMMIT");
    res.status(200).json({
      message: "Dépôt ajouté avec succès",
      transaction: transactionRows[0],
      client: updatedClientRows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors de l'ajout du dépôt",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Retirer du dépôt d'un client
export const retirerDepot = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id: clientId } = req.params;
    const { montant, commentaire, employeId } = req.body;

    // Vérifier que le client existe et a suffisamment de dépôt
    const checkClientQuery =
      "SELECT client_id, depot FROM clients WHERE client_id = $1";
    const { rows: clientRows } = await client.query(checkClientQuery, [
      clientId,
    ]);

    if (clientRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const soldeAvant = parseFloat(clientRows[0].depot);

    if (soldeAvant < parseFloat(montant)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Solde de dépôt insuffisant pour effectuer ce retrait.",
      });
    }

    const soldeApres = soldeAvant - parseFloat(montant);

    // Mettre à jour le solde du dépôt du client
    const updateClientQuery =
      "UPDATE clients SET depot = $1 WHERE client_id = $2 RETURNING *";
    const { rows: updatedClientRows } = await client.query(updateClientQuery, [
      soldeApres,
      clientId,
    ]);

    // Enregistrer la transaction
    const insertTransactionQuery = `
      INSERT INTO transactions_clients 
      (client_id, type_transaction, montant, solde_avant, solde_apres, employe_id, commentaire)
      VALUES ($1, 'retrait', $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const transactionValues = [
      clientId,
      montant,
      soldeAvant,
      soldeApres,
      employeId,
      commentaire,
    ];
    const { rows: transactionRows } = await client.query(
      insertTransactionQuery,
      transactionValues
    );

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'retrait_depot', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      montant: montant,
      solde_avant: soldeAvant,
      solde_apres: soldeApres,
    });
    await client.query(logQuery, [
      employeId,
      detailsJson,
      clientId,
      transactionRows[0].transaction_id,
    ]);

    await client.query("COMMIT");
    res.status(200).json({
      message: "Retrait effectué avec succès",
      transaction: transactionRows[0],
      client: updatedClientRows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors du retrait",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Imputer une dette à un client
export const imputerDette = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id: clientId } = req.params;
    const { montant, commentaire, employeId } = req.body;

    // Vérifier que le client existe
    const checkClientQuery =
      "SELECT client_id, dette FROM clients WHERE client_id = $1";
    const { rows: clientRows } = await client.query(checkClientQuery, [
      clientId,
    ]);

    if (clientRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const soldeAvant = parseFloat(clientRows[0].dette);
    const soldeApres = soldeAvant + parseFloat(montant);

    // Mettre à jour la dette du client
    const updateClientQuery =
      "UPDATE clients SET dette = $1 WHERE client_id = $2 RETURNING *";
    const { rows: updatedClientRows } = await client.query(updateClientQuery, [
      soldeApres,
      clientId,
    ]);

    // Enregistrer la transaction
    const insertTransactionQuery = `
      INSERT INTO transactions_clients 
      (client_id, type_transaction, montant, solde_avant, solde_apres, employe_id, commentaire)
      VALUES ($1, 'imputation_dette', $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const transactionValues = [
      clientId,
      montant,
      soldeAvant,
      soldeApres,
      employeId,
      commentaire,
    ];
    const { rows: transactionRows } = await client.query(
      insertTransactionQuery,
      transactionValues
    );

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'imputation_dette', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      montant: montant,
      solde_avant: soldeAvant,
      solde_apres: soldeApres,
    });
    await client.query(logQuery, [
      employeId,
      detailsJson,
      clientId,
      transactionRows[0].transaction_id,
    ]);

    await client.query("COMMIT");
    res.status(200).json({
      message: "Dette imputée avec succès",
      transaction: transactionRows[0],
      client: updatedClientRows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors de l'imputation de la dette",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Payer une dette
export const payerDette = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id: clientId } = req.params;
    const { montant, commentaire, employeId } = req.body;

    // Vérifier que le client existe et a une dette
    const checkClientQuery =
      "SELECT client_id, dette FROM clients WHERE client_id = $1";
    const { rows: clientRows } = await client.query(checkClientQuery, [
      clientId,
    ]);

    if (clientRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const soldeAvant = parseFloat(clientRows[0].dette);

    if (soldeAvant <= 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Ce client n'a pas de dette à payer." });
    }

    // Si le montant payé est supérieur à la dette, on limite au montant de la dette
    const montantEffectif = Math.min(parseFloat(montant), soldeAvant);
    const soldeApres = soldeAvant - montantEffectif;

    // Mettre à jour la dette du client
    const updateClientQuery =
      "UPDATE clients SET dette = $1 WHERE client_id = $2 RETURNING *";
    const { rows: updatedClientRows } = await client.query(updateClientQuery, [
      soldeApres,
      clientId,
    ]);

    // Enregistrer la transaction
    const insertTransactionQuery = `
      INSERT INTO transactions_clients 
      (client_id, type_transaction, montant, solde_avant, solde_apres, employe_id, commentaire)
      VALUES ($1, 'paiement_dette', $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const transactionValues = [
      clientId,
      montantEffectif,
      soldeAvant,
      soldeApres,
      employeId,
      commentaire,
    ];
    const { rows: transactionRows } = await client.query(
      insertTransactionQuery,
      transactionValues
    );

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'paiement_dette', $2, 'client', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      montant: montantEffectif,
      solde_avant: soldeAvant,
      solde_apres: soldeApres,
    });
    await client.query(logQuery, [
      employeId,
      detailsJson,
      clientId,
      transactionRows[0].transaction_id,
    ]);

    await client.query("COMMIT");
    res.status(200).json({
      message: "Paiement de dette effectué avec succès",
      transaction: transactionRows[0],
      client: updatedClientRows[0],
      montantEffectif: montantEffectif,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Erreur lors du paiement de la dette",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Obtenir l'historique des transactions d'un client
export const getTransactionsClient = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const { type, dateDebut, dateFin } = req.query;

    // Vérifier que le client existe
    const checkClientQuery =
      "SELECT client_id FROM clients WHERE client_id = $1";
    const { rows: clientRows } = await pool.query(checkClientQuery, [clientId]);

    if (clientRows.length === 0) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    // Construire la requête de base
    let query = `
      SELECT t.*, e.nom as employe_nom, e.prenom as employe_prenom
      FROM transactions_clients t
      LEFT JOIN employes e ON t.employe_id = e.employe_id
      WHERE t.client_id = $1
    `;

    const queryParams = [clientId];
    let paramCounter = 2;

    // Ajouter des filtres si nécessaire
    if (type) {
      query += ` AND t.type_transaction = $${paramCounter}`;
      queryParams.push(type);
      paramCounter++;
    }

    if (dateDebut) {
      query += ` AND t.date_transaction >= $${paramCounter}`;
      queryParams.push(dateDebut);
      paramCounter++;
    }

    if (dateFin) {
      query += ` AND t.date_transaction <= $${paramCounter}`;
      queryParams.push(dateFin);
      paramCounter++;
    }

    // Trier par date décroissante
    query += ` ORDER BY t.date_transaction DESC`;

    const { rows } = await pool.query(query, queryParams);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des transactions",
      error: error.message,
    });
  }
};
