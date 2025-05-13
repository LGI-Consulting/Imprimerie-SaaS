import pool from "../config/db.js";

/**
 * Ouvrir une nouvelle caisse
 */
export const ouvrirCaisse = async (req, res) => {
  const client = await pool.connect();
  try {
    const { numero_caisse, solde_initial, employe_id } = req.body;

    // Vérifier si la caisse existe déjà
    const caisseExistante = await client.query(
      'SELECT * FROM caisses WHERE numero_caisse = $1',
      [numero_caisse]
    );

    if (caisseExistante.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Une caisse avec ce numéro existe déjà"
      });
    }

    // Créer la nouvelle caisse
    const result = await client.query(
      `INSERT INTO caisses 
       (numero_caisse, employe_id, solde_initial, solde_actuel, statut, date_ouverture)
       VALUES ($1, $2, $3, $3, 'ouverte', NOW())
       RETURNING *`,
      [numero_caisse, employe_id, solde_initial]
    );

    // Mettre à jour l'employé avec la caisse assignée
    await client.query(
      'UPDATE employes SET caisse_id = $1 WHERE employe_id = $2',
      [result.rows[0].caisse_id, employe_id]
    );

    // Journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id)
       VALUES ($1, 'ouverture_caisse', $2, 'caisses', $3)`,
      [
        employe_id,
        JSON.stringify({
          numero_caisse,
          solde_initial
        }),
        result.rows[0].caisse_id
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Caisse ouverte avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de l'ouverture de la caisse:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ouverture de la caisse"
    });
  } finally {
    client.release();
  }
};

/**
 * Fermer une caisse
 */
export const fermerCaisse = async (req, res) => {
  const client = await pool.connect();
  try {
    const { caisse_id, employe_id } = req.body;

    // Vérifier si la caisse existe et est ouverte
    const caisse = await client.query(
      'SELECT * FROM caisses WHERE caisse_id = $1 AND statut = $2',
      [caisse_id, 'ouverte']
    );

    if (caisse.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Caisse non trouvée ou déjà fermée"
      });
    }

    // Fermer la caisse
    const result = await client.query(
      `UPDATE caisses 
       SET statut = 'fermée', date_fermeture = NOW()
       WHERE caisse_id = $1
       RETURNING *`,
      [caisse_id]
    );

    // Journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id)
       VALUES ($1, 'fermeture_caisse', $2, 'caisses', $3)`,
      [
        employe_id,
        JSON.stringify({
          solde_final: result.rows[0].solde_actuel
        }),
        caisse_id
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: "Caisse fermée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la fermeture de la caisse:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la fermeture de la caisse"
    });
  } finally {
    client.release();
  }
};

/**
 * Enregistrer un mouvement de caisse
 */
export const enregistrerMouvement = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      caisse_id,
      type_mouvement,
      montant,
      categorie,
      description,
      employe_id,
      reference_transaction,
      paiement_id
    } = req.body;

    await client.query('BEGIN');

    // Vérifier si la caisse existe et est ouverte
    const caisse = await client.query(
      'SELECT * FROM caisses WHERE caisse_id = $1 AND statut = $2',
      [caisse_id, 'ouverte']
    );

    if (caisse.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "Caisse non trouvée ou fermée"
      });
    }

    const solde_avant = caisse.rows[0].solde_actuel;
    const solde_apres = type_mouvement === 'entrée' 
      ? solde_avant + montant 
      : solde_avant - montant;

    // Vérifier si le solde est suffisant pour une sortie
    if (type_mouvement === 'sortie' && solde_apres < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: "Solde insuffisant pour effectuer cette opération"
      });
    }

    // Enregistrer le mouvement
    const mouvementResult = await client.query(
      `INSERT INTO mouvements_caisse 
       (caisse_id, type_mouvement, montant, categorie, description, 
        employe_id, reference_transaction, paiement_id, solde_avant, solde_apres)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        caisse_id, type_mouvement, montant, categorie, description,
        employe_id, reference_transaction, paiement_id, solde_avant, solde_apres
      ]
    );

    // Mettre à jour le solde de la caisse
    await client.query(
      `UPDATE caisses 
       SET solde_actuel = $1, derniere_operation = NOW()
       WHERE caisse_id = $2`,
      [solde_apres, caisse_id]
    );

    // Journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id)
       VALUES ($1, 'mouvement_caisse', $2, 'mouvements_caisse', $3)`,
      [
        employe_id,
        JSON.stringify({
          type_mouvement,
          montant,
          categorie,
          solde_avant,
          solde_apres
        }),
        mouvementResult.rows[0].mouvement_id
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        mouvement: mouvementResult.rows[0],
        nouveau_solde: solde_apres
      },
      message: "Mouvement enregistré avec succès"
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erreur lors de l'enregistrement du mouvement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du mouvement"
    });
  } finally {
    client.release();
  }
};

/**
 * Obtenir l'historique des mouvements d'une caisse
 */
export const getHistoriqueMouvements = async (req, res) => {
  const client = await pool.connect();
  try {
    const { caisse_id } = req.params;
    const { date_debut, date_fin } = req.query;

    let query = `
      SELECT m.*, e.nom as employe_nom, e.prenom as employe_prenom
      FROM mouvements_caisse m
      LEFT JOIN employes e ON m.employe_id = e.employe_id
      WHERE m.caisse_id = $1
    `;
    const params = [caisse_id];

    if (date_debut && date_fin) {
      query += ` AND m.date_mouvement BETWEEN $2 AND $3`;
      params.push(date_debut, date_fin);
    }

    query += ` ORDER BY m.date_mouvement DESC`;

    const result = await client.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'historique"
    });
  } finally {
    client.release();
  }
};

/**
 * Obtenir le solde actuel d'une caisse
 */
export const getSoldeCaisse = async (req, res) => {
  const client = await pool.connect();
  try {
    const { caisse_id } = req.params;

    const result = await client.query(
      'SELECT caisse_id, numero_caisse, solde_actuel, statut FROM caisses WHERE caisse_id = $1',
      [caisse_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Caisse non trouvée"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du solde:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du solde"
    });
  } finally {
    client.release();
  }
}; 