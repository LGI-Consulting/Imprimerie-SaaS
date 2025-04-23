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
      query += ` WHERE c.date_creation BETWEEN $${paramCounter} AND $${paramCounter + 1}`;
      queryParams.push(new Date(startDate), new Date(endDate));
      paramCounter += 2;
    }
    
    // Tri
    if (sortBy) {
      query += ` ORDER BY c.${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ` ORDER BY c.date_creation DESC`; // Par défaut, tri par date décroissante
    }
    
    const { rows } = await pool.query(query, queryParams);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commandes", error: error.message });
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
          adresse: rows[0].adresse
        },
        details: []
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
          prenom: rows[0].modifier_prenom
        };
      }
  
      const detailsMap = new Map();
  
      rows.forEach(row => {
        if (row.detail_id && !detailsMap.has(row.detail_id)) {
          detailsMap.set(row.detail_id, {
            detail_id: row.detail_id,
            materiau_id: row.materiau_id,
            travail_id: row.travail_id,
            quantite: row.quantite,
            dimensions: row.dimensions,
            prix_unitaire: row.prix_unitaire,
            sous_total: row.sous_total,
            materiau_nom: row.materiau_nom
          });
        }
      });
  
      order.details = Array.from(detailsMap.values());
  
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de la commande", error: error.message });
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
    res.status(500).json({ message: "Erreur lors de la récupération des commandes du client", error: error.message });
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
    res.status(500).json({ message: "Erreur lors de la récupération des commandes par statut", error: error.message });
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
    res.status(500).json({ message: "Erreur lors de la récupération des commandes par matériel", error: error.message });
  }
};

// Créer une nouvelle commande
export const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      clientInfo,
      materialType,
      width,
      length,
      quantity = 1, // Valeur par défaut de 1 si non spécifiée
      options
    } = req.body;

    const employeId = req.user.employe_id;

    // Gérer les informations client
    let clientId;

    if (clientInfo.client_id) {
      clientId = clientInfo.client_id;
      await client.query(
        'UPDATE clients SET derniere_visite = CURRENT_TIMESTAMP WHERE client_id = $1',
        [clientId]
      );
    } else {
      const insertClientQuery = `
        INSERT INTO clients (nom, prenom, email, telephone, adresse, date_creation, derniere_visite)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING client_id
      `;

      const clientResult = await client.query(insertClientQuery, [
        clientInfo.nom,
        clientInfo.prenom,
        clientInfo.email || null,
        clientInfo.telephone,
        clientInfo.adresse || null
      ]);

      clientId = clientResult.rows[0].client_id;
    }

    const requestedWidth = parseFloat(width);
    const requestedLength = parseFloat(length);
    const widthWithMargin = requestedWidth + 5;
    const numExemplaires = parseInt(quantity, 10) || 1;

    // Vérifier que la quantité est valide
    if (numExemplaires <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `La quantité doit être supérieure à zéro`
      });
    }

    // Étape 1: récupérer infos matériau
    const materialInfoQuery = `
      SELECT m.materiau_id, m.type_materiau, m.prix_unitaire, m.options_disponibles
      FROM materiaux m
      WHERE m.type_materiau = $1
      LIMIT 1
    `;

    const materialInfoResult = await client.query(materialInfoQuery, [materialType]);

    if (materialInfoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Aucun matériau de type ${materialType} disponible`
      });
    }

    const materialInfo = materialInfoResult.rows[0];

    // Étape 2: trouver les largeurs disponibles avec stock suffisant
    const availableWidthsQuery = `
      SELECT sml.largeur, sml.stock_id, sml.quantite_en_stock, sml.unite_mesure
      FROM stocks_materiaux_largeur sml
      WHERE sml.materiau_id = $1 AND sml.quantite_en_stock > 0
      ORDER BY sml.largeur ASC
    `;

    const availableWidthsResult = await client.query(availableWidthsQuery, [materialInfo.materiau_id]);

    if (availableWidthsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Aucune largeur en stock pour le matériau ${materialType}`
      });
    }

    const availableWidths = availableWidthsResult.rows.map(row => row.largeur);

    // Étape 3: choisir largeur appropriée
    let selectedWidth = availableWidths.find(w => w >= widthWithMargin) || Math.max(...availableWidths);
    
    // Obtenir le stock_id et les informations de stock pour la largeur sélectionnée
    const selectedStock = availableWidthsResult.rows.find(row => row.largeur === selectedWidth);
    
    if (!selectedStock) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Stock non disponible pour la largeur ${selectedWidth} cm de matériau ${materialType}`
      });
    }

    // Étape 4: calculer la surface et le prix de base
    const calculationWidth = selectedWidth - 5;
    const areaSqM = (calculationWidth * requestedLength) / 10000;
    const basePrice = areaSqM * materialInfo.prix_unitaire;
    
    // Quantité totale de matériau nécessaire pour tous les exemplaires
    const totalAreaSqM = areaSqM * numExemplaires;

    // Étape 5: appliquer les options
    let additionalCosts = 0;
    let optionsDetails = [];

    if (options) {
      const materialOptions = materialInfo.options_disponibles || {};
      
      Object.keys(options).forEach(optionKey => {
        if (optionKey === 'comments') return;

        if (materialOptions[optionKey]) {
          const opt = materialOptions[optionKey];
          let cost = 0;

          if (opt.type === 'fixed') {
            cost = opt.price || 0;
          } else if (opt.type === 'per_sqm') {
            cost = areaSqM * (opt.price || 0);
          } else if (opt.type === 'per_unit' && options[optionKey].quantity) {
            cost = options[optionKey].quantity * (opt.price || 0);
          }

          if (opt.is_free) cost = 0;

          // Multiplier le coût par le nombre d'exemplaires
          const totalOptionCost = cost * numExemplaires;
          additionalCosts += totalOptionCost;

          optionsDetails.push({
            nom: opt.label || optionKey,
            quantite: options[optionKey].quantity || 1,
            prix_unitaire: cost,
            prix_total: totalOptionCost
          });
        }
      });
    }

    // Prix unitaire par exemplaire et prix total pour tous les exemplaires
    const unitPrice = basePrice + (additionalCosts / numExemplaires);
    const totalPrice = basePrice * numExemplaires + additionalCosts;

    // Générer un numéro de commande
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumberValue = `CMD-${datePart}-${randomPart}`;

    const createOrderQuery = `
      INSERT INTO commandes (
        client_id, date_creation, statut, priorite, 
        commentaires, employe_reception_id, est_commande_speciale,
        numero_commande
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING commande_id
    `;

    const orderResult = await client.query(createOrderQuery, [
      clientId,
      new Date(), // Utilisez la date actuelle comme date de création
      "reçue", // Définir le statut par défaut à "reçue"
      1, // Priorité par défaut à 1
      options?.comments || null, // Commentaires, ou null si non spécifié
      employeId,
      false, // est_commande_speciale par défaut à false
      clientId,
      "reçue",
      1,
      options?.comments || null,
      employeId,
      false,
      orderNumberValue
    ]);

    const commandeId = orderResult.rows[0].commande_id;

    const dimensionsJson = JSON.stringify({
      largeur_demandee: requestedWidth,
      longueur: requestedLength,
      largeur_materiau: selectedWidth,
      largeur_calcul: calculationWidth,
      surface_unitaire: areaSqM,
      nombre_exemplaires: numExemplaires,
      surface_totale: totalAreaSqM
    });

    const optionsJson = JSON.stringify(optionsDetails);

    // Calculer les besoins en matériau pour tous les exemplaires
    const materialLengthUsed = (requestedLength / 100) * numExemplaires; // Conversion en mètres

    // Vérifier si le stock est suffisant pour tous les exemplaires
    if (materialLengthUsed > selectedStock.quantite_en_stock) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Stock insuffisant pour ${numExemplaires} exemplaires. Stock disponible: ${selectedStock.quantite_en_stock} ${selectedStock.unite_mesure}`
      });
    }

    // Insérer dans details_commande selon le schéma
    const createDetailQuery = `
      INSERT INTO details_commande (
        commande_id, materiau_id, quantite, dimensions, prix_unitaire, sous_total,
        commentaires
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING detail_id
    `;

    const detailResult = await client.query(createDetailQuery, [
      commandeId,
      materialInfo.materiau_id,
      totalAreaSqM, // Quantité totale (surface * nombre d'exemplaires)
      dimensionsJson,
      unitPrice, // Prix unitaire par exemplaire
      totalPrice, // Prix total pour tous les exemplaires
      JSON.stringify({
        options: optionsDetails,
        commentaires: options?.comments || null,
        materiau_nom: materialType,
        materiau_largeur: selectedWidth,
        prix_options_unitaire: additionalCosts / numExemplaires,
        prix_options_total: additionalCosts,
        prix_base_unitaire: basePrice,
        prix_base_total: basePrice * numExemplaires,
        nombre_exemplaires: numExemplaires
      })
    ]);
    
    // Mettre à jour le stock pour tous les exemplaires
    await client.query(
      `UPDATE stocks_materiaux_largeur SET quantite_en_stock = quantite_en_stock - $1 
       WHERE stock_id = $2`,
      [materialLengthUsed, selectedStock.stock_id]
    );

    // Enregistrer le mouvement de stock
    const stockMouvementQuery = `
      INSERT INTO mouvements_stock (
        stock_id, type_mouvement, quantite, commande_id, employe_id, commentaire
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await client.query(stockMouvementQuery, [
      selectedStock.stock_id,
      'sortie',
      materialLengthUsed,
      commandeId,
      employeId,
      `Commande ${orderNumberValue}: ${numExemplaires} exemplaires de ${materialType} ${requestedWidth}x${requestedLength}cm`
    ]);

        // Insérer les fichiers d'impression
        if (req.body.files && req.body.files.length > 0) {
          for (const file of req.body.files) {
              const { file_name, file_path } = file;
              if (file_name && file_path) {
                  const insertPrintFileQuery = `
                      INSERT INTO print_files (commande_id, file_name, file_path)
                      VALUES ($1, $2, $3)
                  `;
                  await client.query(insertPrintFileQuery, [
                      commandeId,
                      file_name,
                      file_path
                  ]);
              }
          }
      }


    await client.query('COMMIT');

    res.status(201).json({
      message: "Commande créée avec succès",
      commande_id: commandeId,
      numero_commande: orderNumberValue,
      details: {
        client: clientId,
        materiau: {
          type: materialType,
          largeur_selectionnee: selectedWidth
        },
        dimensions: {
          largeur: requestedWidth,
          longueur: requestedLength,
          surface_unitaire: areaSqM,
          surface_totale: totalAreaSqM
        },
        exemplaires: numExemplaires,
        prix: {
          base_unitaire: basePrice,
          base_total: basePrice * numExemplaires,
          options_unitaire: additionalCosts / numExemplaires,
          options_total: additionalCosts,
          unitaire: unitPrice,
          total: totalPrice
        },
        options: optionsDetails
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erreur:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la commande",
      error: error.message
    });
  } finally {
    client.release();
  }
};

// Mise à jour d'une commande
export const updateOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const orderId = req.params.id;
    const updateData = req.body;
    const employeId = req.user.employe_id;
    
    // Vérifier si la commande existe
    const checkOrderQuery = `
      SELECT * FROM commandes 
      WHERE commande_id = $1
    `;
    
    const orderCheck = await client.query(checkOrderQuery, [orderId]);
    
    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    const currentOrder = orderCheck.rows[0];
    
    // Vérifier si la commande peut être modifiée (uniquement si elle est en attente)
    if (currentOrder.statut !== "reçue" && !req.user.is_admin) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        message: "Impossible de modifier une commande qui n'est pas en attente" 
      });
    }
    
    // Préparer les champs à mettre à jour
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;
    
    for (const [key, value] of Object.entries(updateData)) {
      if (
        key !== 'commande_id' && 
        key !== 'date_creation' &&
        key in currentOrder
      ) {
        updateFields.push(`${key} = $${paramCounter}`);
        updateValues.push(value);
        paramCounter++;
      }
    }
    
    if (updateFields.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Aucun champ valide à mettre à jour" });
    }
    
    // Ajouter l'employe_graphiste_id à la mise à jour
    updateFields.push(`employe_graphiste_id = $${paramCounter}`);
    updateValues.push(employeId);
    paramCounter++;
    
    // Ajouter commande_id à la fin des valeurs
    updateValues.push(orderId);
    
    // Construire la requête de mise à jour
    const updateOrderQuery = `
      UPDATE commandes
      SET ${updateFields.join(', ')}
      WHERE commande_id = $${paramCounter}
      RETURNING *
    `;
    
    const updateResult = await client.query(updateOrderQuery, updateValues);
    
    // Journaliser l'action
    const logQuery = `
      INSERT INTO journal_activites (
        employe_id, action, date_action, 
        details, entite_affectee, entite_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await client.query(logQuery, [
      employeId,
      'MODIFICATION',
      'Mise à jour d\'une commande',
      'commandes',
      orderId
    ]);
    
    await client.query('COMMIT');
    
    // Récupérer la commande mise à jour avec ses relations
    const getUpdatedOrderQuery = `
      SELECT c.*, 
             cl.nom as client_nom, cl.prenom as client_prenom, cl.telephone, cl.email,
             e.nom as modifier_nom, e.prenom as modifier_prenom
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.client_id
      LEFT JOIN employes e ON c.employe_graphiste_id = e.employe_id
      WHERE c.commande_id = $1
    `;
    
    const { rows } = await pool.query(getUpdatedOrderQuery, [orderId]);
    
    const updatedOrder = {
      ...rows[0],
      client: {
        nom: rows[0].client_nom,
        prenom: rows[0].client_prenom,
        telephone: rows[0].telephone,
        email: rows[0].email
      }
    };
    
    if (rows[0].employe_graphiste_id) {
      updatedOrder.modifiedBy = {
        nom: rows[0].modifier_nom,
        prenom: rows[0].modifier_prenom
      };
    }
    
    // Supprimer les champs redondants
    delete updatedOrder.client_nom;
    delete updatedOrder.client_prenom;
    delete updatedOrder.telephone;
    delete updatedOrder.email;
    delete updatedOrder.modifier_nom;
    delete updatedOrder.modifier_prenom;
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la mise à jour de la commande", error: error.message });
  } finally {
    client.release();
  }
};

// Suppression d'une commande
export const deleteOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const orderId = req.params.id;
    const employeId = req.user.employe_id;
    
    // Vérifier si la commande existe
    const checkOrderQuery = `
      SELECT * FROM commandes 
      WHERE commande_id = $1
    `;
    
    const orderCheck = await client.query(checkOrderQuery, [orderId]);
    
    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    const currentOrder = orderCheck.rows[0];
    
    // Vérifier si la commande peut être supprimée
    if (currentOrder.statut !== "reçue" && !req.user.is_admin) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        message: "Impossible de supprimer une commande qui n'est pas en attente" 
      });
    }
    
    // Récupérer les détails de la commande pour remettre en stock
    const getDetailsQuery = `
      SELECT materiau_id, quantite
      FROM details_commande
      WHERE commande_id = $1
    `;
    
    const detailsResult = await client.query(getDetailsQuery, [orderId]);
    
    // Remettre les matériaux en stock
    for (const detail of detailsResult.rows) {
      // Mettre à jour le stock
      const updateStockQuery = `
        UPDATE materiaux
        SET quantite_en_stock = quantite_en_stock + $1
        WHERE materiau_id = $2
      `;
      
      await client.query(updateStockQuery, [detail.quantite, detail.materiau_id]);
      
      // Enregistrer le mouvement de stock
      const createStockMovementQuery = `
        INSERT INTO mouvements_stock (
          materiau_id, type_mouvement, quantite, 
          date_mouvement, commande_id, employe_id, commentaire
        )
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
      `;
      
      await client.query(createStockMovementQuery, [
        detail.materiau_id,
        'entrée',
        detail.quantite,
        orderId,
        employeId,
        'Suppression de commande'
      ]);
    }
    
    // Supprimer les fichiers associés
    const deleteFilesQuery = `
      DELETE FROM fichiers
      WHERE detail_id IN (SELECT detail_id FROM details_commande WHERE commande_id = $1)
    `;
    
    await client.query(deleteFilesQuery, [orderId]);
    
    // Supprimer les détails de commande
    const deleteDetailsQuery = `
      DELETE FROM details_commande
      WHERE commande_id = $1
    `;
    
    await client.query(deleteDetailsQuery, [orderId]);
    
    // Supprimer la commande
    const deleteOrderQuery = `
      DELETE FROM commandes
      WHERE commande_id = $1
    `;
    
    await client.query(deleteOrderQuery, [orderId]);
    
    // Journaliser l'action
    const logQuery = `
      INSERT INTO journal_activites (
        employe_id, action, date_action, 
        details, entite_affectee, entite_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await client.query(logQuery, [
      employeId,
      'SUPPRESSION',
      'Suppression d\'une commande',
      'commandes',
      orderId
    ]);
    
    await client.query('COMMIT');
    
    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la suppression de la commande", error: error.message });
  } finally {
    client.release();
  }
};
