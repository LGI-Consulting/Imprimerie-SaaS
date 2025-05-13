import pool from "../config/db.js";
import { logger } from "../utils/logger.js";

/**
 * Crée une nouvelle utilisation de matériau
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const createUtilisation = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      rouleau_id,
      commande_id,
      longueur_theorique,
      longueur_reelle,
      commentaire
    } = req.body;

    // Vérifier si le rouleau existe et a assez de stock
    const rouleauQuery = `
      SELECT r.*, m.type_materiau, m.nom as materiau_nom
      FROM rouleaux r
      JOIN materiaux m ON r.materiau_id = m.materiau_id
      WHERE r.rouleau_id = $1 AND r.est_actif = true
    `;
    const rouleauResult = await client.query(rouleauQuery, [rouleau_id]);
    const rouleau = rouleauResult.rows[0];

    if (!rouleau) {
      return res.status(404).json({ message: "Rouleau non trouvé ou inactif" });
    }

    if (rouleau.longueur_restante < longueur_reelle) {
      return res.status(400).json({ 
        message: "Longueur insuffisante sur le rouleau",
        longueur_disponible: rouleau.longueur_restante
      });
    }

    await client.query("BEGIN");

    // Insérer l'utilisation
    const insertQuery = `
      INSERT INTO utilisations_materiaux (
        rouleau_id,
        commande_id,
        longueur_theorique,
        longueur_reelle,
        commentaire,
        date_utilisation,
        est_valide
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, true)
      RETURNING *
    `;

    const utilisationResult = await client.query(insertQuery, [
      rouleau_id,
      commande_id,
      longueur_theorique,
      longueur_reelle,
      commentaire
    ]);

    // Mettre à jour la longueur restante du rouleau
    const updateRouleauQuery = `
      UPDATE rouleaux
      SET 
        longueur_restante = longueur_restante - $1,
        date_modification = CURRENT_TIMESTAMP
      WHERE rouleau_id = $2
      RETURNING *
    `;

    await client.query(updateRouleauQuery, [longueur_reelle, rouleau_id]);

    // Mettre à jour le stock global
    const updateStockQuery = `
      UPDATE stocks_materiaux_largeur
      SET 
        longueur_totale = longueur_totale - $1,
        date_modification = CURRENT_TIMESTAMP
      WHERE materiau_id = $2 AND largeur = $3
    `;

    await client.query(updateStockQuery, [
      longueur_reelle,
      rouleau.materiau_id,
      rouleau.largeur
    ]);

    // Logger l'activité
    const logQuery = `
      INSERT INTO journal_activites (
        utilisateur_id,
        type_activite,
        description,
        date_activite
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `;

    await client.query(logQuery, [
      req.user.id,
      "UTILISATION_MATERIAU",
      `Utilisation de ${longueur_reelle}m de ${rouleau.materiau_nom} (${rouleau.largeur}cm) pour la commande ${commande_id}`
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Utilisation enregistrée avec succès",
      utilisation: utilisationResult.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Erreur lors de la création de l'utilisation:", error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisation" });
  } finally {
    client.release();
  }
};

/**
 * Récupère les utilisations pour une commande
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getUtilisationsByCommande = async (req, res) => {
  try {
    const { commande_id } = req.params;

    const query = `
      SELECT 
        u.*,
        r.numero_rouleau,
        r.largeur,
        m.nom as materiau_nom,
        m.type_materiau
      FROM utilisations_materiaux u
      JOIN rouleaux r ON u.rouleau_id = r.rouleau_id
      JOIN materiaux m ON r.materiau_id = m.materiau_id
      WHERE u.commande_id = $1
      ORDER BY u.date_utilisation DESC
    `;

    const result = await pool.query(query, [commande_id]);
    res.json(result.rows);

  } catch (error) {
    logger.error("Erreur lors de la récupération des utilisations:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des utilisations" });
  }
};

/**
 * Récupère les statistiques d'utilisation pour un matériau
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getUtilisationsStats = async (req, res) => {
  try {
    const { materiau_id } = req.params;
    const { date_debut, date_fin } = req.query;

    let query = `
      SELECT 
        DATE_TRUNC('day', u.date_utilisation) as date,
        SUM(u.longueur_theorique) as longueur_theorique_totale,
        SUM(u.longueur_reelle) as longueur_reelle_totale,
        COUNT(*) as nombre_utilisations,
        AVG(u.longueur_reelle - u.longueur_theorique) as difference_moyenne,
        AVG((u.longueur_reelle - u.longueur_theorique) / u.longueur_theorique * 100) as pourcentage_moyen
      FROM utilisations_materiaux u
      JOIN rouleaux r ON u.rouleau_id = r.rouleau_id
      WHERE r.materiau_id = $1
    `;

    const params = [materiau_id];

    if (date_debut && date_fin) {
      query += ` AND u.date_utilisation BETWEEN $2 AND $3`;
      params.push(date_debut, date_fin);
    }

    query += `
      GROUP BY DATE_TRUNC('day', u.date_utilisation)
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    logger.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
}; 