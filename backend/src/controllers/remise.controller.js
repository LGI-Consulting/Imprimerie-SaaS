import pool from "../config/db.js";

// Créer une nouvelle remise
export const createRemise = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      type,
      valeur,
      date_debut,
      date_fin,
      client_id,
      commande_id,
      code_remise
    } = req.body;

    // Vérifier si le code de remise existe déjà
    if (code_remise) {
      const checkCodeQuery = `
        SELECT * FROM remises 
        WHERE code_remise = $1 AND est_active = true
      `;
      const codeCheck = await client.query(checkCodeQuery, [code_remise]);
      
      if (codeCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: "Ce code de remise existe déjà" 
        });
      }
    }

    // Insérer la nouvelle remise
    const insertQuery = `
      INSERT INTO remises (
        type, valeur, date_debut, date_fin, 
        client_id, commande_id, code_remise
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      type,
      valeur,
      date_debut || new Date(),
      date_fin,
      client_id,
      commande_id,
      code_remise
    ];

    const result = await client.query(insertQuery, values);
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ 
      message: "Erreur lors de la création de la remise", 
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// Obtenir toutes les remises actives
export const getAllRemises = async (req, res) => {
  try {
    const query = `
      SELECT r.*, 
             c.nom as client_nom, 
             c.prenom as client_prenom,
             cmd.numero_commande
      FROM remises r
      LEFT JOIN clients c ON r.client_id = c.client_id
      LEFT JOIN commandes cmd ON r.commande_id = cmd.commande_id
      WHERE r.est_active = true
      ORDER BY r.date_debut DESC
    `;
    
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des remises", 
      error: error.message 
    });
  }
};

// Obtenir une remise par ID
export const getRemiseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT r.*, 
             c.nom as client_nom, 
             c.prenom as client_prenom,
             cmd.numero_commande
      FROM remises r
      LEFT JOIN clients c ON r.client_id = c.client_id
      LEFT JOIN commandes cmd ON r.commande_id = cmd.commande_id
      WHERE r.remise_id = $1 AND r.est_active = true
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Remise non trouvée" });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération de la remise", 
      error: error.message 
    });
  }
};

// Mettre à jour une remise
export const updateRemise = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      type,
      valeur,
      date_debut,
      date_fin,
      client_id,
      commande_id,
      code_remise,
      est_active
    } = req.body;

    // Vérifier si la remise existe
    const checkQuery = `
      SELECT * FROM remises WHERE remise_id = $1
    `;
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Remise non trouvée" });
    }

    // Vérifier si le nouveau code de remise existe déjà (si modifié)
    if (code_remise && code_remise !== checkResult.rows[0].code_remise) {
      const checkCodeQuery = `
        SELECT * FROM remises 
        WHERE code_remise = $1 AND remise_id != $2 AND est_active = true
      `;
      const codeCheck = await client.query(checkCodeQuery, [code_remise, id]);
      
      if (codeCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: "Ce code de remise existe déjà" 
        });
      }
    }

    // Mettre à jour la remise
    const updateQuery = `
      UPDATE remises
      SET type = COALESCE($1, type),
          valeur = COALESCE($2, valeur),
          date_debut = COALESCE($3, date_debut),
          date_fin = COALESCE($4, date_fin),
          client_id = COALESCE($5, client_id),
          commande_id = COALESCE($6, commande_id),
          code_remise = COALESCE($7, code_remise),
          est_active = COALESCE($8, est_active)
      WHERE remise_id = $9
      RETURNING *
    `;

    const values = [
      type,
      valeur,
      date_debut,
      date_fin,
      client_id,
      commande_id,
      code_remise,
      est_active,
      id
    ];

    const result = await client.query(updateQuery, values);
    
    await client.query('COMMIT');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour de la remise", 
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// Désactiver une remise
export const deleteRemise = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Vérifier si la remise existe
    const checkQuery = `
      SELECT * FROM remises WHERE remise_id = $1
    `;
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Remise non trouvée" });
    }

    // Désactiver la remise
    const updateQuery = `
      UPDATE remises
      SET est_active = false
      WHERE remise_id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [id]);
    
    await client.query('COMMIT');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ 
      message: "Erreur lors de la désactivation de la remise", 
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// Vérifier un code de remise
export const verifyRemiseCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const query = `
      SELECT r.*, 
             c.nom as client_nom, 
             c.prenom as client_prenom
      FROM remises r
      LEFT JOIN clients c ON r.client_id = c.client_id
      WHERE r.code_remise = $1 
      AND r.est_active = true
      AND (r.date_fin IS NULL OR r.date_fin > CURRENT_TIMESTAMP)
    `;
    
    const { rows } = await pool.query(query, [code]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "Code de remise invalide ou expiré" 
      });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la vérification du code de remise", 
      error: error.message 
    });
  }
};

// Obtenir les remises d'un client
export const getRemisesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const query = `
      SELECT r.*, cmd.numero_commande
      FROM remises r
      LEFT JOIN commandes cmd ON r.commande_id = cmd.commande_id
      WHERE r.client_id = $1 
      AND r.est_active = true
      ORDER BY r.date_debut DESC
    `;
    
    const { rows } = await pool.query(query, [clientId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des remises du client", 
      error: error.message 
    });
  }
}; 