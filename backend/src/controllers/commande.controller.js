import pool from "../config/db.js";

// Récupérer toutes les commandes
export const getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate, sortBy, sortOrder } = req.query;

    let query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.client_id
    `;

    const queryParams = [];
    let paramCounter = 1;

    // Filtrage par date si spécifié
    if (startDate && endDate) {
      query += ` WHERE c.date_creation BETWEEN $${paramCounter} AND $${
        paramCounter + 1
      }`;
      queryParams.push(new Date(startDate), new Date(endDate));
      paramCounter += 2;
    }

    // Tri
    if (sortBy) {
      query += ` ORDER BY c.${sortBy} ${sortOrder === "desc" ? "DESC" : "ASC"}`;
    } else {
      query += ` ORDER BY c.date_creation DESC`; // Par défaut, tri par date décroissante
    }

    const { rows } = await pool.query(query, queryParams);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
      error: error.message,
    });
  }
};

// Récupérer une commande par son ID
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const query = `
        SELECT c.*, 
               cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email, cl.adresse,
               e.nom as modifier_nom, e.prenom as modifier_prenom,
               dc.detail_id, dc.materiau_id, dc.travail_id, dc.quantite, dc.dimensions, dc.prix_unitaire, dc.sous_total,
               m.nom as materiau_nom
        FROM commandes c
        LEFT JOIN clients cl ON c.client_id = cl.client_id
        LEFT JOIN employes e ON c.employe_graphiste_id = e.employe_id
        LEFT JOIN details_commande dc ON c.commande_id = dc.commande_id
        LEFT JOIN materiaux m ON dc.materiau_id = m.materiau_id
        WHERE c.commande_id = $1
      `;

    const { rows } = await pool.query(query, [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const order = {
      commande_id: rows[0].commande_id,
      client_id: rows[0].client_id,
      date_creation: rows[0].date_creation,
      statut: rows[0].statut,
      priorite: rows[0].priorite,
      commentaires: rows[0].commentaires,
      est_commande_speciale: rows[0].est_commande_speciale,
      client: {
        nom: rows[0].client_nom,
        prenom: rows[0].client_prenom,
        telephone: rows[0].telephone,
        email: rows[0].email,
        adresse: rows[0].adresse,
      },
      details: [],
    };

    if (rows[0].employe_reception_id) {
      order.employe_reception_id = rows[0].employe_reception_id;
    }
    if (rows[0].employe_caisse_id) {
      order.employe_caisse_id = rows[0].employe_caisse_id;
    }
    if (rows[0].employe_graphiste_id) {
      order.employe_graphiste_id = rows[0].employe_graphiste_id;
      order.employe_graphiste = {
        nom: rows[0].modifier_nom,
        prenom: rows[0].modifier_prenom,
      };
    }

    const detailsMap = new Map();

    rows.forEach((row) => {
      if (row.detail_id && !detailsMap.has(row.detail_id)) {
        detailsMap.set(row.detail_id, {
          detail_id: row.detail_id,
          materiau_id: row.materiau_id,
          travail_id: row.travail_id,
          quantite: row.quantite,
          dimensions: row.dimensions,
          prix_unitaire: row.prix_unitaire,
          sous_total: row.sous_total,
          materiau_nom: row.materiau_nom,
        });
      }
    });

    order.details = Array.from(detailsMap.values());

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la commande",
      error: error.message,
    });
  }
};

// Récupérer les commandes d'un client
export const getOrdersByClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.client_id
      WHERE c.client_id = $1
      ORDER BY c.date_creation DESC
    `;

    const { rows } = await pool.query(query, [clientId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes du client",
      error: error.message,
    });
  }
};

// Récupérer les commandes par statut
export const getOrdersByStatus = async (req, res) => {
  try {
    const status = req.params.status;

    const query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.client_id
      WHERE c.statut = $1
      ORDER BY c.date_creation DESC
    `;

    const { rows } = await pool.query(query, [status]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes par statut",
      error: error.message,
    });
  }
};

// Récupérer les commandes par situation de paiement
export const getOrderBySituationPaiement = async (req, res) => {
  try {
    const situationPaiement = req.params.situationPaiement;

    const query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.client_id
      WHERE c.situation_paiement = $1
      ORDER BY c.date_creation DESC
    `;

    const { rows } = await pool.query(query, [situationPaiement]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes par statut",
      error: error.message,
    });
  }
};
// Récupérer les commandes par type de matériel
export const getOrdersByMaterial = async (req, res) => {
  try {
    const materialType = req.params.materialType;

    const query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.client_id
      JOIN details_commande dc ON c.commande_id = dc.commande_id
      JOIN materiaux m ON dc.materiau_id = m.materiau_id
      WHERE m.nom = $1
      ORDER BY c.date_creation DESC
    `;

    const { rows } = await pool.query(query, [materialType]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes par matériel",
      error: error.message,
    });
  }
};

// Modifications à apporter à commande.controller.js

// Créer une nouvelle commande (version simplifiée)
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      clientInfo,
      materialType,
      width,
      length,
      quantity = 1,
      options,
      calculatedPrice, // Données précalculées du frontend
      orderNumber, // Numéro de commande généré par le frontend
      est_commande_speciale, // Utiliser la valeur de la case à cocher
    } = req.body;
    console.log(calculatedPrice)
    const employeId = req.user.employe_id;

    // Validation minimale des données
    if (!clientInfo || !materialType || !width || !length) {
      return res.status(400).json({ message: "Informations manquantes" });
    }

    // Gestion du client (création ou mise à jour)
    let clientId = clientInfo.client_id;
    if (!clientId) {
      const clientRes = await client.query(
        `INSERT INTO clients (nom, prenom, telephone, email, adresse) 
         VALUES ($1, $2, $3, $4, $5) RETURNING client_id`,
        [
          clientInfo.nom,
          clientInfo.prenom,
          clientInfo.telephone,
          clientInfo.email || null,
          clientInfo.adresse || null,
        ]
      );
      clientId = clientRes.rows[0].client_id;
    } else {
      await client.query(
        `UPDATE clients SET derniere_visite = NOW() WHERE client_id = $1`,
        [clientId]
      );
    }

    // La vérification du stock est maintenant entièrement gérée côté frontend
    // Nous faisons confiance aux données envoyées par le frontend

    // Création de la commande avec le numéro généré par le frontend
    const orderRes = await client.query(
      `INSERT INTO commandes (
    client_id, numero_commande, statut, situation_paiement,
    employe_reception_id, est_commande_speciale, commentaires
  ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING commande_id`,
      [
        clientId,
        orderNumber,
        "reçue",
        est_commande_speciale ? "comptant" : "credit",
        employeId,
        est_commande_speciale,
        options?.comments || null,
      ]
    );
    const commandeId = orderRes.rows[0].commande_id;

    // Création du détail de commande avec les prix précalculés
    await client.query(
      `INSERT INTO details_commande (
        commande_id, materiau_id, quantite, dimensions,
        prix_unitaire, sous_total, commentaires
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        commandeId,
        calculatedPrice.materiau_id,
        calculatedPrice.area,
        JSON.stringify({
          largeur_demandee: width,
          longueur: length,
          largeur_materiau: calculatedPrice.selectedWidth,
          largeur_calcul: calculatedPrice.selectedWidth - 5,
          surface_unitaire: calculatedPrice.area / quantity,
          nombre_exemplaires: quantity,
        }),
        calculatedPrice.totalPrice / quantity, // Prix unitaire
        calculatedPrice.totalPrice, // Prix total
        JSON.stringify({
          options: calculatedPrice.optionsDetails,
          commentaires: options?.comments,
        }),
      ]
    );

    // Gestion des fichiers (WhatsApp/USB)
    if (req.files?.length > 0) {
      for (const file of req.files) {
        await client.query(
          `INSERT INTO print_files (
            commande_id, file_name, file_path, file_size, mime_type, uploaded_by
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            commandeId,
            file.originalname,
            file.path,
            file.size,
            file.mimetype,
            employeId,
          ]
        );
      }
    }

    // Enregistrer dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites 
      (employe_id, action, details, entite_affectee, entite_id, transaction_id)
      VALUES ($1, 'creation_commande', $2, 'commandes', $3, $4)
    `;
    const detailsJson = JSON.stringify({
      numero_commande: commandeId,
      client_id: clientId,
      statut: orderRes.rows[0].statut,
      situation_paiement: orderRes.rows[0].situation_paiement,
      est_commande_speciale: orderRes.rows[0].est_commande_speciale,
      commentaires: options?.comments,
      priorite: options?.priorite,
    });
    await client.query(logQuery, [employeId, detailsJson, commandeId, null]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      commande_id: commandeId,
      numero_commande: orderNumber,
      prix_total: calculatedPrice.totalPrice,
      details: {
        materiau: materialType,
        dimensions: `${width}x${length}cm`,
        quantite: quantity,
        options: calculatedPrice.optionsDetails,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur création commande:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la commande",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

export const updateOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderId = req.params.id;
    const { statut, commentaires, priorite } = req.body;
    const employeId = req.user.employe_id;

    // 1. Vérifier l'existence de la commande
    const orderCheck = await client.query(
      `SELECT c.*, cl.nom as client_nom 
       FROM commandes c
       JOIN clients cl ON c.client_id = cl.client_id
       WHERE c.commande_id = $1`,
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const currentOrder = orderCheck.rows[0];

    // 2. Validation des permissions
    const allowedStatusTransitions = {
      reçue: ["payée", "annulée"],
      payée: ["en_impression", "annulée"],
      en_impression: ["terminée", "annulée"],
    };

    if (
      statut &&
      !allowedStatusTransitions[currentOrder.statut]?.includes(statut)
    ) {
      return res.status(400).json({
        message: `Transition de statut invalide: ${currentOrder.statut} → ${statut}`,
      });
    }

    // 3. Préparation de la mise à jour
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (statut) {
      updates.push(`statut = $${paramIndex}`);
      values.push(statut);
      paramIndex++;

      // Si la commande passe à "payée", enregistrer l'employé de caisse
      if (statut === "payée") {
        updates.push(`employe_caisse_id = $${paramIndex}`);
        values.push(employeId);
        paramIndex++;
      }
      // Si la commande passe à "en_impression", enregistrer l'employé graphiste
      else if (statut === "en_impression") {
        updates.push(`employe_graphiste_id = $${paramIndex}`);
        values.push(employeId);
        paramIndex++;
      }
    }

    if (commentaires !== undefined) {
      updates.push(`commentaires = $${paramIndex}`);
      values.push(commentaires);
      paramIndex++;
    }

    if (priorite !== undefined) {
      updates.push(`priorite = $${paramIndex}`);
      values.push(priorite);
      paramIndex++;
    }

    // 4. Exécution de la mise à jour
    if (updates.length > 0) {
      values.push(orderId);
      const updateQuery = `
        UPDATE commandes
        SET ${updates.join(", ")}
        WHERE commande_id = $${paramIndex}
        RETURNING *
      `;

      const updatedOrder = await client.query(updateQuery, values);

      // 5. Journalisation
      await client.query(
        `INSERT INTO journal_activites 
         (employe_id, action, entite_affectee, entite_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          employeId,
          "MISE_A_JOUR_COMMANDE",
          "commandes",
          orderId,
          JSON.stringify({
            ancien_statut: currentOrder.statut,
            nouveau_statut: statut,
            commentaires: commentaires,
          }),
        ]
      );
    }

    await client.query("COMMIT");

    // Récupérer la commande mise à jour avec ses relations
    const fullOrder = await client.query(
      `SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom,
              e.nom as employe_nom, e.prenom as employe_prenom
       FROM commandes c
       JOIN clients cl ON c.client_id = cl.client_id
       LEFT JOIN employes e ON c.employe_graphiste_id = e.employe_id OR c.employe_caisse_id = e.employe_id
       WHERE c.commande_id = $1`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...fullOrder.rows[0],
        client: {
          nom: fullOrder.rows[0].client_nom,
          prenom: fullOrder.rows[0].client_prenom,
        },
        employe: fullOrder.rows[0].employe_nom
          ? {
              nom: fullOrder.rows[0].employe_nom,
              prenom: fullOrder.rows[0].employe_prenom,
            }
          : null,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur mise à jour commande:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la commande",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

export const deleteOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderId = req.params.id;
    const employeId = req.user.employe_id;

    // 1. Vérifier l'existence et le statut de la commande
    const orderCheck = await client.query(
      `SELECT c.*, cl.nom as client_nom 
       FROM commandes c
       JOIN clients cl ON c.client_id = cl.client_id
       WHERE c.commande_id = $1`,
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const currentOrder = orderCheck.rows[0];

    // 2. Vérifier que la commande peut être supprimée
    if (!["reçue", "annulée"].includes(currentOrder.statut)) {
      return res.status(403).json({
        message:
          "Seules les commandes 'reçue' ou 'annulée' peuvent être supprimées",
      });
    }

    // 4. Supprimer les fichiers associés
    await client.query(`DELETE FROM print_files WHERE commande_id = $1`, [
      orderId,
    ]);

    // 5. Supprimer les détails de commande
    await client.query(`DELETE FROM details_commande WHERE commande_id = $1`, [
      orderId,
    ]);

    // 6. Supprimer la commande
    await client.query(`DELETE FROM commandes WHERE commande_id = $1`, [
      orderId,
    ]);

    // 7. Journalisation
    await client.query(
      `INSERT INTO journal_activites 
       (employe_id, action, entite_affectee, entite_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        employeId,
        "SUPPRESSION_COMMANDE",
        "commandes",
        orderId,
        JSON.stringify({
          numero_commande: currentOrder.numero_commande,
          client: currentOrder.client_nom,
        }),
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: `Commande ${currentOrder.numero_commande} supprimée avec succès`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur suppression commande:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la commande",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
