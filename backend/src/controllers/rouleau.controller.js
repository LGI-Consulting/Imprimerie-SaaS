import pool from "../config/db.js";

// Créer un nouveau rouleau
export const createRouleau = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      materiau_id,
      largeur,
      longueur_initiale,
      numero_rouleau,
      fournisseur,
      prix_achat_total,
    } = req.body;

    await client.query("BEGIN");

    // Vérifier si le matériau existe
    const materiauCheck = await client.query(
      "SELECT * FROM materiaux WHERE materiau_id = $1",
      [materiau_id]
    );

    if (materiauCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matériau non trouvé",
      });
    }

    // Insérer le nouveau rouleau
    const insertRouleauQuery = `
      INSERT INTO rouleaux (
        materiau_id,
        largeur,
        longueur_initiale,
        longueur_restante,
        numero_rouleau,
        fournisseur,
        prix_achat_total
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const rouleauResult = await client.query(insertRouleauQuery, [
      materiau_id,
      largeur,
      longueur_initiale,
      longueur_initiale, // longueur_restante = longueur_initiale au début
      numero_rouleau,
      fournisseur,
      prix_achat_total,
    ]);

    // Mettre à jour le stock global
    const updateStockQuery = `
      INSERT INTO stocks_materiaux_largeur (
        materiau_id,
        largeur,
        longueur_totale,
        nombre_rouleaux
      )
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (materiau_id, largeur)
      DO UPDATE SET
        longueur_totale = stocks_materiaux_largeur.longueur_totale + $3,
        nombre_rouleaux = stocks_materiaux_largeur.nombre_rouleaux + 1,
        date_modification = CURRENT_TIMESTAMP
    `;

    await client.query(updateStockQuery, [
      materiau_id,
      largeur,
      longueur_initiale,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: rouleauResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating rouleau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du rouleau",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Obtenir tous les rouleaux
export const getAllRouleaux = async (req, res) => {
  try {
    const query = `
      SELECT r.*, m.type_materiau, m.nom as materiau_nom
      FROM rouleaux r
      JOIN materiaux m ON r.materiau_id = m.materiau_id
      WHERE r.est_actif = true
      ORDER BY r.date_creation DESC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting rouleaux:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rouleaux",
      error: error.message,
    });
  }
};

// Obtenir un rouleau par ID
export const getRouleauById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT r.*, m.type_materiau, m.nom as materiau_nom
      FROM rouleaux r
      JOIN materiaux m ON r.materiau_id = m.materiau_id
      WHERE r.rouleau_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rouleau non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting rouleau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du rouleau",
      error: error.message,
    });
  }
};

// Obtenir les rouleaux par matériau et largeur
export const getRouleauxByMateriauAndLargeur = async (req, res) => {
  try {
    const { materiau_id, largeur } = req.params;

    const query = `
      SELECT r.*, m.type_materiau, m.nom as materiau_nom
      FROM rouleaux r
      JOIN materiaux m ON r.materiau_id = m.materiau_id
      WHERE r.materiau_id = $1 
      AND r.largeur = $2
      AND r.est_actif = true
      ORDER BY r.longueur_restante DESC
    `;

    const result = await pool.query(query, [materiau_id, largeur]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting rouleaux:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rouleaux",
      error: error.message,
    });
  }
};

// Mettre à jour la longueur restante d'un rouleau
export const updateRouleauLongueur = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { longueur_restante, employe_id } = req.body;

    await client.query("BEGIN");

    // Vérifier si le rouleau existe
    const rouleauCheck = await client.query(
      "SELECT * FROM rouleaux WHERE rouleau_id = $1",
      [id]
    );

    if (rouleauCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rouleau non trouvé",
      });
    }

    const rouleau = rouleauCheck.rows[0];
    const difference = rouleau.longueur_restante - longueur_restante;

    // Mettre à jour le rouleau
    const updateRouleauQuery = `
      UPDATE rouleaux
      SET 
        longueur_restante = $1,
        est_actif = $2,
        date_modification = CURRENT_TIMESTAMP
      WHERE rouleau_id = $3
      RETURNING *
    `;

    const rouleauResult = await client.query(updateRouleauQuery, [
      longueur_restante,
      longueur_restante > 0,
      id,
    ]);

    // Mettre à jour le stock global
    const updateStockQuery = `
      UPDATE stocks_materiaux_largeur
      SET 
        longueur_totale = longueur_totale - $1,
        nombre_rouleaux = CASE 
          WHEN $2 = 0 THEN nombre_rouleaux - 1 
          ELSE nombre_rouleaux 
        END,
        date_modification = CURRENT_TIMESTAMP
      WHERE materiau_id = $3 AND largeur = $4
    `;

    await client.query(updateStockQuery, [
      difference,
      longueur_restante,
      rouleau.materiau_id,
      rouleau.largeur,
    ]);

    // Journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id)
       VALUES ($1, 'mise_a_jour_rouleau', $2, 'rouleaux', $3)`,
      [
        employe_id,
        JSON.stringify({
          rouleau_id: id,
          ancienne_longueur: rouleau.longueur_restante,
          nouvelle_longueur: longueur_restante,
        }),
        id,
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      data: rouleauResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating rouleau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du rouleau",
      error: error.message,
    });
  } finally {
    client.release();
  }
}; 