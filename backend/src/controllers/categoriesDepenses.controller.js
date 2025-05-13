import pool from "../config/db.js";

/**
 * Créer une nouvelle catégorie de dépenses
 */
export const createCategorie = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nom, description, type } = req.body;

    const result = await client.query(
      `INSERT INTO categories_depenses (nom, description, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nom, description, type]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Catégorie créée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la catégorie"
    });
  } finally {
    client.release();
  }
};

/**
 * Obtenir toutes les catégories de dépenses
 */
export const getAllCategories = async (req, res) => {
  const client = await pool.connect();
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM categories_depenses WHERE est_active = true';
    const params = [];

    if (type) {
      query += ' AND type = $1';
      params.push(type);
    }

    query += ' ORDER BY nom';

    const result = await client.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des catégories"
    });
  } finally {
    client.release();
  }
};

/**
 * Mettre à jour une catégorie de dépenses
 */
export const updateCategorie = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nom, description, type, est_active } = req.body;

    const result = await client.query(
      `UPDATE categories_depenses 
       SET nom = $1, description = $2, type = $3, est_active = $4, date_modification = NOW()
       WHERE categorie_id = $5
       RETURNING *`,
      [nom, description, type, est_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée"
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: "Catégorie mise à jour avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la catégorie"
    });
  } finally {
    client.release();
  }
};

/**
 * Supprimer une catégorie de dépenses (soft delete)
 */
export const deleteCategorie = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const result = await client.query(
      `UPDATE categories_depenses 
       SET est_active = false, date_modification = NOW()
       WHERE categorie_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée"
      });
    }

    res.json({
      success: true,
      message: "Catégorie supprimée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la catégorie"
    });
  } finally {
    client.release();
  }
};

/**
 * Obtenir les statistiques des dépenses par catégorie
 */
export const getStatistiquesCategories = async (req, res) => {
  const client = await pool.connect();
  try {
    const { date_debut, date_fin, type } = req.query;
    
    let query = `
      SELECT 
        c.categorie_id,
        c.nom,
        c.type,
        COUNT(m.mouvement_id) as nombre_mouvements,
        SUM(CASE WHEN m.type_mouvement = 'sortie' THEN m.montant ELSE 0 END) as total_depenses,
        SUM(CASE WHEN m.type_mouvement = 'entrée' THEN m.montant ELSE 0 END) as total_entrees
      FROM categories_depenses c
      LEFT JOIN mouvements_caisse m ON c.nom = m.categorie
      WHERE c.est_active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (date_debut && date_fin) {
      query += ` AND m.date_mouvement BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(date_debut, date_fin);
      paramIndex += 2;
    }

    if (type) {
      query += ` AND c.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += `
      GROUP BY c.categorie_id, c.nom, c.type
      ORDER BY total_depenses DESC
    `;

    const result = await client.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques"
    });
  } finally {
    client.release();
  }
}; 