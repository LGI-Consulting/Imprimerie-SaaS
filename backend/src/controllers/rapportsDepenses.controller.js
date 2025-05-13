import pool from "../config/db.js";

/**
 * Obtenir le rapport des dépenses par période
 */
export const getRapportDepenses = async (req, res) => {
  const client = await pool.connect();
  try {
    const { date_debut, date_fin, type } = req.query;
    
    let query = `
      WITH mouvements_agreges AS (
        SELECT 
          DATE_TRUNC('day', m.date_mouvement) as date,
          c.nom as categorie,
          c.type,
          SUM(CASE WHEN m.type_mouvement = 'sortie' THEN m.montant ELSE 0 END) as depenses,
          SUM(CASE WHEN m.type_mouvement = 'entrée' THEN m.montant ELSE 0 END) as entrees,
          COUNT(*) as nombre_operations
        FROM mouvements_caisse m
        JOIN categories_depenses c ON m.categorie = c.nom
        WHERE m.date_mouvement BETWEEN $1 AND $2
    `;
    
    const params = [date_debut, date_fin];
    let paramIndex = 3;

    if (type) {
      query += ` AND c.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += `
        GROUP BY DATE_TRUNC('day', m.date_mouvement), c.nom, c.type
      )
      SELECT 
        date,
        categorie,
        type,
        depenses,
        entrees,
        nombre_operations,
        depenses - entrees as solde
      FROM mouvements_agreges
      ORDER BY date DESC, categorie
    `;

    const result = await client.query(query, params);

    // Calculer les totaux
    const totaux = result.rows.reduce((acc, row) => {
      acc.total_depenses += parseFloat(row.depenses) || 0;
      acc.total_entrees += parseFloat(row.entrees) || 0;
      acc.total_operations += parseInt(row.nombre_operations) || 0;
      return acc;
    }, {
      total_depenses: 0,
      total_entrees: 0,
      total_operations: 0
    });

    res.json({
      success: true,
      data: {
        mouvements: result.rows,
        totaux
      }
    });
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du rapport"
    });
  } finally {
    client.release();
  }
};

/**
 * Obtenir le rapport des dépenses par employé
 */
export const getRapportDepensesParEmploye = async (req, res) => {
  const client = await pool.connect();
  try {
    const { date_debut, date_fin } = req.query;
    
    const query = `
      SELECT 
        e.employe_id,
        e.nom,
        e.prenom,
        COUNT(m.mouvement_id) as nombre_operations,
        SUM(CASE WHEN m.type_mouvement = 'sortie' THEN m.montant ELSE 0 END) as total_depenses,
        SUM(CASE WHEN m.type_mouvement = 'entrée' THEN m.montant ELSE 0 END) as total_entrees,
        c.nom as categorie,
        COUNT(*) FILTER (WHERE m.type_mouvement = 'sortie') as nombre_depenses,
        COUNT(*) FILTER (WHERE m.type_mouvement = 'entrée') as nombre_entrees
      FROM employes e
      LEFT JOIN mouvements_caisse m ON e.employe_id = m.employe_id
      LEFT JOIN categories_depenses c ON m.categorie = c.nom
      WHERE m.date_mouvement BETWEEN $1 AND $2
      GROUP BY e.employe_id, e.nom, e.prenom, c.nom
      ORDER BY e.nom, e.prenom, total_depenses DESC
    `;

    const result = await client.query(query, [date_debut, date_fin]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Erreur lors de la génération du rapport par employé:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du rapport par employé"
    });
  } finally {
    client.release();
  }
};

/**
 * Obtenir le rapport des dépenses par catégorie
 */
export const getRapportDepensesParCategorie = async (req, res) => {
  const client = await pool.connect();
  try {
    const { date_debut, date_fin, type } = req.query;
    
    let query = `
      SELECT 
        c.categorie_id,
        c.nom as categorie,
        c.type,
        COUNT(m.mouvement_id) as nombre_operations,
        SUM(CASE WHEN m.type_mouvement = 'sortie' THEN m.montant ELSE 0 END) as total_depenses,
        SUM(CASE WHEN m.type_mouvement = 'entrée' THEN m.montant ELSE 0 END) as total_entrees,
        AVG(CASE WHEN m.type_mouvement = 'sortie' THEN m.montant ELSE NULL END) as moyenne_depenses,
        AVG(CASE WHEN m.type_mouvement = 'entrée' THEN m.montant ELSE NULL END) as moyenne_entrees
      FROM categories_depenses c
      LEFT JOIN mouvements_caisse m ON c.nom = m.categorie
      WHERE m.date_mouvement BETWEEN $1 AND $2
    `;
    
    const params = [date_debut, date_fin];
    let paramIndex = 3;

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
    console.error("Erreur lors de la génération du rapport par catégorie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du rapport par catégorie"
    });
  } finally {
    client.release();
  }
}; 