import pool from "../config/db.js";

// Récupérer tous les clients d'un tenant
export const getAllClients = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const query = 'SELECT * FROM clients WHERE tenant_id = $1';
    const { rows } = await pool.query(query, [tenantId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des clients.", error: error.message });
  }
};

// Récupérer un client par son ID
export const getClientById = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const tenantId = req.user.tenant_id;
    const query = 'SELECT * FROM clients WHERE client_id = $1 AND tenant_id = $2';
    const { rows } = await pool.query(query, [clientId, tenantId]);

    if (rows.length === 0) return res.status(404).json({ message: "Client non trouvé." });
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du client.", error: error.message });
  }
};

// Rechercher un client par nom, prénom, téléphone ou email
export const getClientBySearch = async (req, res) => {
  try {
    const { query } = req.query;
    const tenantId = req.user.tenant_id;
    const searchQuery = `
      SELECT * FROM clients
      WHERE tenant_id = $1 AND (
        nom ILIKE $2 OR prenom ILIKE $2 OR telephone ILIKE $2 OR email ILIKE $2
      )
    `;
    const { rows } = await pool.query(searchQuery, [tenantId, `%${query}%`]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la recherche de clients.", error: error.message });
  }
};

// Créer un nouveau client
export const createClient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { nom, prenom, telephone, email, adresse } = req.body;
    const tenantId = req.user.tenant_id;

    const checkQuery = 'SELECT * FROM clients WHERE tenant_id = $1 AND (telephone = $2 OR email = $3)';
    const { rows } = await client.query(checkQuery, [tenantId, telephone, email || '']);

    if (rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Un client avec ce téléphone ou cet email existe déjà." });
    }

    const insertQuery = `
      INSERT INTO clients (tenant_id, nom, prenom, email, telephone, adresse, date_creation, derniere_visite)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const values = [tenantId, nom, prenom, email, telephone, adresse];
    const result = await client.query(insertQuery, values);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la création du client.", error: error.message });
  } finally {
    client.release();
  }
};

// Mettre à jour un client
export const updateClient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id: clientId } = req.params;
    const tenantId = req.user.tenant_id;
    const { nom, prenom, telephone, email, adresse } = req.body;

    const checkQuery = 'SELECT * FROM clients WHERE client_id = $1 AND tenant_id = $2';
    const { rows } = await client.query(checkQuery, [clientId, tenantId]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const updateQuery = `
      UPDATE clients
      SET nom = $1, prenom = $2, telephone = $3, email = $4, adresse = $5, derniere_visite = CURRENT_TIMESTAMP
      WHERE client_id = $6 AND tenant_id = $7
      RETURNING *
    `;
    const values = [nom, prenom, telephone, email, adresse, clientId, tenantId];
    const result = await client.query(updateQuery, values);

    await client.query('COMMIT');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la mise à jour du client.", error: error.message });
  } finally {
    client.release();
  }
};

// Supprimer un client
export const deleteClient = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id: clientId } = req.params;
    const tenantId = req.user.tenant_id;

    const checkQuery = 'SELECT * FROM clients WHERE client_id = $1 AND tenant_id = $2';
    const { rows } = await client.query(checkQuery, [clientId, tenantId]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Client non trouvé." });
    }

    const deleteQuery = 'DELETE FROM clients WHERE client_id = $1 AND tenant_id = $2 RETURNING *';
    await client.query(deleteQuery, [clientId, tenantId]);

    await client.query('COMMIT');
    res.status(200).json({ message: "Client supprimé avec succès." });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la suppression du client.", error: error.message });
  } finally {
    client.release();
  }
};

// Récupérer l'historique des commandes d’un client
export const getClientOrders = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const tenantId = req.user.tenant_id;

    const query = `
      SELECT c.*, f.numero_facture, f.montant_final
      FROM commandes c
      LEFT JOIN factures f ON c.commande_id = f.commande_id
      WHERE c.client_id = $1 AND c.tenant_id = $2
      ORDER BY c.date_creation DESC
    `;
    const { rows } = await pool.query(query, [clientId, tenantId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commandes du client.", error: error.message });
  }
};

// Récupérer les statistiques d'achat d’un client
export const getClientStats = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const tenantId = req.user.tenant_id;

    const totalStatsQuery = `
      SELECT COUNT(c.commande_id) AS total_orders, SUM(f.montant_final) AS total_amount
      FROM commandes c
      JOIN factures f ON c.commande_id = f.commande_id
      WHERE c.client_id = $1 AND c.tenant_id = $2
    `;
    const { rows: totalRows } = await pool.query(totalStatsQuery, [clientId, tenantId]);
    const totalStats = totalRows[0];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const frequencyQuery = `
      SELECT COUNT(*) AS recent_orders
      FROM commandes
      WHERE client_id = $1 AND tenant_id = $2 AND date_creation >= $3
    `;
    const { rows: freqRows } = await pool.query(frequencyQuery, [clientId, tenantId, sixMonthsAgo]);

    const preferencesQuery = `
      SELECT m.nom, COUNT(dc.materiau_id) AS count
      FROM details_commande dc
      JOIN commandes c ON dc.commande_id = c.commande_id
      JOIN materiaux m ON dc.materiau_id = m.materiau_id
      WHERE c.client_id = $1 AND c.tenant_id = $2
      GROUP BY m.nom
      ORDER BY count DESC
    `;
    const { rows: prefRows } = await pool.query(preferencesQuery, [clientId, tenantId]);
    const materialPreferences = {};
    prefRows.forEach(row => {
      materialPreferences[row.nom] = parseInt(row.count);
    });

    res.status(200).json({
      totalOrders: parseInt(totalStats.total_orders) || 0,
      totalAmount: parseFloat(totalStats.total_amount) || 0,
      frequency: {
        last6Months: parseInt(freqRows[0].recent_orders) || 0,
        monthly: ((parseInt(freqRows[0].recent_orders) || 0) / 6).toFixed(1)
      },
      materialPreferences
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques client.", error: error.message });
  }
};
