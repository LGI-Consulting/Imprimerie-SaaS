import pool from "../config/db.js";

/**
 * Get payment details for a specific order
 */
export const getCommandePaymentDetails = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const result = await pool.query(
      "SELECT * FROM get_commande_payment_details($1)",
      [commandeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de paiement:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la récupération des détails de paiement",
    });
  }
};

/**
 * Create a payment and update the related order
 */
export const createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      montant, 
      commande_id, 
      methode, 
      reference_transaction, 
      employe_id,
      montant_recu 
    } = req.body;

    if (!montant || !commande_id || !methode) {
      return res.status(400).json({
        error: "Montant, commande ID, et méthode de paiement sont requis",
      });
    }

    await client.query("BEGIN");

    // Récupérer les détails de paiement de la commande
    const detailsResult = await client.query(
      "SELECT * FROM get_commande_payment_details($1)",
      [commande_id]
    );

    if (detailsResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
      });
    }

    const details = detailsResult.rows[0];
    const montantTotal = details.montant_total;
    const montantDejaPaye = details.montant_paye;
    const resteAPayer = details.reste_a_payer;
    const situationPaiement = details.situation_paiement;

    // Vérifier si le montant du paiement est valide
    if (montant > resteAPayer) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Le montant du paiement ne peut pas être supérieur au reste à payer",
      });
    }

    // Calculer la monnaie rendue pour les paiements en espèces
    let monnaieRendue = 0;
    if (methode === "espèces" && montant_recu) {
      if (montant_recu < montant) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Le montant reçu doit être supérieur ou égal au montant à payer",
        });
      }
      monnaieRendue = montant_recu - montant;
    }

    // Créer le paiement
    const paymentQuery = `
      INSERT INTO paiements(
        commande_id, 
        montant, 
        methode, 
        reference_transaction, 
        date_paiement, 
        statut, 
        employe_id,
        monnaie_rendue,
        reste_a_payer
      )
      VALUES ($1, $2, $3, $4, NOW(), 'validé', $5, $6, $7)
      RETURNING *
    `;
    const paymentResult = await client.query(paymentQuery, [
      commande_id,
      montant,
      methode,
      reference_transaction,
      employe_id,
      monnaieRendue,
      resteAPayer - montant
    ]);
    const payment = paymentResult.rows[0];

    // Mettre à jour le statut de la commande si le paiement est complet
    if (montantDejaPaye + montant >= montantTotal) {
      await client.query(
        "UPDATE commandes SET statut = $1, employe_caisse_id = $2 WHERE commande_id = $3",
        ["payée", employe_id, commande_id]
      );
    }

    // Générer un numéro de facture unique
    const currentDate = new Date();
    const numeroFacture = `FAC-${currentDate.getFullYear()}${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${payment.paiement_id}`;

    // Créer la facture
    const factureQuery = `
      INSERT INTO factures(
        paiement_id,
        numero_facture, 
        date_emission, 
        montant_total, 
        montant_taxe, 
        remise, 
        montant_final
      )
      VALUES ($1, $2, NOW(), $3, 0, 0, $3)
      RETURNING *
    `;
    const factureResult = await client.query(factureQuery, [
      payment.paiement_id,
      numeroFacture,
      montantTotal,
    ]);
    const facture = factureResult.rows[0];

    // Journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id, transaction_id)
       VALUES ($1, 'ajout_paiement', $2, 'paiements', $3, $4)`,
      [
        employe_id,
        JSON.stringify({
          montant: montant,
          methode: methode,
          monnaie_rendue: monnaieRendue,
          reste_a_payer: resteAPayer - montant,
        }),
        commande_id,
        payment.paiement_id,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: {
        payment,
        facture,
        details: {
          montant_total: montantTotal,
          montant_deja_paye: montantDejaPaye + montant,
          reste_a_payer: resteAPayer - montant,
          situation_paiement: situationPaiement
        }
      },
      message: "Paiement traité et facture générée avec succès",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de la création du paiement:", error);
    res.status(500).json({
      success: false,
      message: "Échec du traitement du paiement",
    });
  } finally {
    client.release();
  }
};

/**
 * Get all payments
 */
export const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.numero_commande 
      FROM paiements p
      JOIN commandes c ON p.commande_id = c.commande_id
      ORDER BY p.date_paiement DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la récupération des paiements",
    });
  }
};

/**
 * Get a payment by ID with its associated facture
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentResult = await pool.query(
      `
      SELECT p.*, c.numero_commande 
      FROM paiements p
      JOIN commandes c ON p.commande_id = c.commande_id
      WHERE p.paiement_id = $1
    `,
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paiement non trouvé",
      });
    }

    const factureResult = await pool.query(
      `
      SELECT * FROM factures WHERE commande_id = $1
    `,
      [paymentResult.rows[0].commande_id]
    );

    const facture = factureResult.rows[0] || null;

    res.status(200).json({
      success: true,
      data: {
        payment: paymentResult.rows[0],
        facture,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la récupération du paiement",
    });
  }
};

/**
 * Update a payment
 */
export const updatePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { montant, methode, reference_transaction, statut } = req.body;

    const checkResult = await client.query(
      "SELECT * FROM paiements WHERE paiement_id = $1",
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paiement non trouvé",
      });
    }

    await client.query("BEGIN");

    // Mise à jour du paiement
    const updateQuery = `
      UPDATE paiements
      SET montant = COALESCE($1, montant), 
          methode = COALESCE($2, methode), 
          reference_transaction = COALESCE($3, reference_transaction), 
          statut = COALESCE($4, statut)
      WHERE paiement_id = $5
      RETURNING *
    `;
    const result = await client.query(updateQuery, [
      montant,
      methode,
      reference_transaction,
      statut,
      id,
    ]);

    // Si le statut du paiement est mis à jour à "validé", mettre à jour le statut de la commande
    if (statut === "validé") {
      await client.query(
        "UPDATE commandes SET statut = $1 WHERE commande_id = $2",
        ["payée", result.rows[0].commande_id]
      );
    } else if (statut === "échoué") {
      await client.query(
        "UPDATE commandes SET statut = $1 WHERE commande_id = $2",
        ["reçue", result.rows[0].commande_id]
      );
    }

    // Si le montant est modifié, mettre à jour la facture
    if (montant) {
      await client.query(
        "UPDATE factures SET montant_total = $1, montant_final = $1 WHERE commande_id = $2",
        [montant, result.rows[0].commande_id]
      );
    }

    //journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id, transaction_id)
       VALUES ($1, 'mise_a_jour_paiement', $2, 'paiements', $3, $4)`,
      [
        employe_id,
        JSON.stringify({
          montant: montant,
          methode: methode,
          reference_transaction: reference_transaction,
          statut: statut,
        }),
        id,
        null,
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      data: {
        payment: result.rows[0],
      },
      message: "Paiement mis à jour avec succès",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de la mise à jour du paiement:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la mise à jour du paiement",
    });
  } finally {
    client.release();
  }
};

/**
 * Delete a payment and update the related order
 */
export const deletePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const checkResult = await client.query(
      "SELECT * FROM paiements WHERE paiement_id = $1",
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paiement non trouvé",
      });
    }

    const commande_id = checkResult.rows[0].commande_id;

    await client.query("BEGIN");

    // Supprimer la facture associée
    await client.query("DELETE FROM factures WHERE commande_id = $1", [
      commande_id,
    ]);

    // Supprimer le paiement
    await client.query("DELETE FROM paiements WHERE paiement_id = $1", [id]);

    // Mettre à jour le statut de la commande
    await client.query(
      "UPDATE commandes SET statut = $1 WHERE commande_id = $2",
      ["reçue", commande_id]
    );

    //journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id, transaction_id)
       VALUES ($1, 'suppression_paiement', $2, 'paiements', $3, $4)`,
      [
        employe_id,
        JSON.stringify({
          montant: montant,
          methode: methode,
          reference_transaction: reference_transaction,
          statut: statut,
        }),
        id,
        null,
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Paiement et facture associée supprimés avec succès",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de la suppression du paiement:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la suppression du paiement",
    });
  } finally {
    client.release();
  }
};

/**
 * Get all factures
 */
export const getAllFactures = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.numero_commande 
      FROM factures f
      JOIN commandes c ON f.commande_id = c.commande_id
      ORDER BY f.date_emission DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la récupération des factures",
    });
  }
};

/**
 * Get a facture by ID with its associated payment
 */
export const getFactureById = async (req, res) => {
  try {
    const { id } = req.params;

    const factureResult = await pool.query(
      `
      SELECT f.*, c.numero_commande 
      FROM factures f
      JOIN commandes c ON f.commande_id = c.commande_id
      WHERE f.facture_id = $1
    `,
      [id]
    );

    if (factureResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Facture non trouvée",
      });
    }

    const paymentResult = await pool.query(
      "SELECT * FROM paiements WHERE commande_id = $1",
      [factureResult.rows[0].commande_id]
    );

    const payment = paymentResult.rows[0] || null;

    res.status(200).json({
      success: true,
      data: {
        facture: factureResult.rows[0],
        payment,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la récupération de la facture",
    });
  }
};

/**
 * Update a facture
 */
export const updateFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const { montant_total, montant_taxe, remise, montant_final } = req.body;

    const checkResult = await pool.query(
      "SELECT * FROM factures WHERE facture_id = $1",
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Facture non trouvée",
      });
    }

    const result = await pool.query(
      `UPDATE factures 
       SET montant_total = COALESCE($1, montant_total), 
           montant_taxe = COALESCE($2, montant_taxe), 
           remise = COALESCE($3, remise), 
           montant_final = COALESCE($4, montant_final)
       WHERE facture_id = $5 
       RETURNING *`,
      [montant_total, montant_taxe, remise, montant_final, id]
    );

    //journalisation
    await pool.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id, transaction_id)
       VALUES ($1, 'mise_a_jour_facture', $2, 'factures', $3, $4)`,
      [
        employe_id,
        JSON.stringify({
          montant_total: montant_total,
          montant_taxe: montant_taxe,
          remise: remise,
          montant_final: montant_final,
        }),
        id,
        null,
      ]
    );

    res.status(200).json({
      success: true,
      data: {
        facture: result.rows[0],
      },
      message: "Facture mise à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la mise à jour de la facture",
    });
  }
};

/**
 * Delete a facture (only if not linked to a payment)
 */
export const deleteFacture = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query(
      "SELECT * FROM factures WHERE facture_id = $1",
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Facture non trouvée",
      });
    }

    const commande_id = checkResult.rows[0].commande_id;

    // Vérifier si un paiement est associé
    const paymentCheck = await pool.query(
      "SELECT * FROM paiements WHERE commande_id = $1",
      [commande_id]
    );
    if (paymentCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Impossible de supprimer une facture associée à un paiement. Supprimez d'abord le paiement.",
      });
    }

    await pool.query("DELETE FROM factures WHERE facture_id = $1", [id]);

    //journalisation
    await pool.query(
      `INSERT INTO journal_activites 
       (employe_id, action, details, entite_affectee, entite_id, transaction_id)
       VALUES ($1, 'suppression_facture', $2, 'factures', $3, $4)`,
      [
        employe_id,
        JSON.stringify({
          facture_id: id,
        }),
        id,
        null,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Facture supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la suppression de la facture",
    });
  }
};
