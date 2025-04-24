import pool from "../config/db.js";

/**
 * Get all materials
 */
export const getAllMateriau = async (req, res) => {
  try {
    const query = `
      SELECT m.*, 
        COALESCE(json_agg(json_build_object(
          'stock_id', s.stock_id,
          'largeur', s.largeur,
          'quantite_en_stock', s.quantite_en_stock,
          'unite_mesure', s.unite_mesure,
          'seuil_alerte', s.seuil_alerte
        )) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      GROUP BY m.materiau_id
      ORDER BY m.type_materiau, m.nom
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error getting material:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des matériaux",
      error: error.message
    });
  }
};

/**
 * Search materials by type, name, or description
 */
export const getMateriauBySearch = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Un terme de recherche est requis"
      });
    }
    
    const searchTerm = `%${term}%`;
    
    const query = `
      SELECT m.*, 
        COALESCE(json_agg(json_build_object(
          'stock_id', s.stock_id,
          'largeur', s.largeur,
          'quantite_en_stock', s.quantite_en_stock,
          'unite_mesure', s.unite_mesure,
          'seuil_alerte', s.seuil_alerte
        )) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.type_materiau ILIKE $1 OR 
            m.nom ILIKE $1 OR 
            m.description ILIKE $1
      GROUP BY m.materiau_id
      ORDER BY m.type_materiau, m.nom
    `;
    
    const result = await pool.query(query, [searchTerm]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error searching materials:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche des matériaux",
      error: error.message
    });
  }
};

/**
 * Get a specific material by ID with its stock information
 */
export const getMateriauByID = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT m.*, 
        COALESCE(json_agg(json_build_object(
          'stock_id', s.stock_id,
          'largeur', s.largeur,
          'quantite_en_stock', s.quantite_en_stock,
          'unite_mesure', s.unite_mesure,
          'seuil_alerte', s.seuil_alerte
        )) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.materiau_id = $1
      GROUP BY m.materiau_id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matériau non trouvé"
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error getting material by ID:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du matériau",
      error: error.message
    });
  }
};

/**
 * Get materials with low stock (below threshold)
 */
export const getMateriauStock = async (req, res) => {
  try {
    const query = `
      SELECT m.materiau_id, m.type_materiau, m.nom, m.description, m.prix_unitaire, m.unite_mesure,
        json_agg(json_build_object(
          'stock_id', s.stock_id,
          'largeur', s.largeur,
          'quantite_en_stock', s.quantite_en_stock,
          'unite_mesure', s.unite_mesure,
          'seuil_alerte', s.seuil_alerte,
          'est_bas', (s.quantite_en_stock <= s.seuil_alerte)
        )) as stocks
      FROM materiaux m
      JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE s.quantite_en_stock <= s.seuil_alerte
      GROUP BY m.materiau_id
      ORDER BY m.type_materiau, m.nom
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error getting materials with low stock:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des matériaux en stock bas",
      error: error.message
    });
  }
};

/**
 * Create a new material with its initial stock information
 */
export const createMateriau = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      type_materiau, 
      nom, 
      description, 
      prix_unitaire, 
      unite_mesure, 
      options_disponibles,
      stocks 
    } = req.body;
    
    if (!type_materiau || !prix_unitaire || !unite_mesure) {
      return res.status(400).json({
        success: false,
        message: "Le type de matériau, le prix unitaire et l'unité de mesure sont requis"
      });
    }
    
    await client.query('BEGIN');
    
    // Create the material
    const insertMateriauQuery = `
      INSERT INTO materiaux (
        type_materiau, 
        nom, 
        description, 
        prix_unitaire, 
        unite_mesure, 
        options_disponibles
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const materiauValues = [
      type_materiau, 
      nom || null, 
      description || null, 
      prix_unitaire, 
      unite_mesure, 
      options_disponibles || '{}'
    ];
    
    const materiauResult = await client.query(insertMateriauQuery, materiauValues);
    const materiau = materiauResult.rows[0];
    
    // Add stock information if provided
    let stocksData = [];
    if (stocks && stocks.length > 0) {
      const insertStockQuery = `
        INSERT INTO stocks_materiaux_largeur (
          materiau_id, 
          largeur, 
          quantite_en_stock, 
          seuil_alerte, 
          unite_mesure
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      for (const stock of stocks) {
        const stockValues = [
          materiau.materiau_id,
          stock.largeur,
          stock.quantite_en_stock || 0,
          stock.seuil_alerte || 0,
          stock.unite_mesure || unite_mesure
        ];
        
        const stockResult = await client.query(insertStockQuery, stockValues);
        stocksData.push(stockResult.rows[0]);
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: "Matériau créé avec succès",
      data: {
        ...materiau,
        stocks: stocksData
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating material:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du matériau",
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Update an existing material and its stock information
 */
export const updateMateriau = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { 
      type_materiau, 
      nom, 
      description, 
      prix_unitaire, 
      unite_mesure, 
      options_disponibles,
      stocks 
    } = req.body;
    
    // Check if material exists
    const checkQuery = `
      SELECT * FROM materiaux 
      WHERE materiau_id = $1
    `;
    
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matériau non trouvé"
      });
    }
    
    await client.query('BEGIN');
    
    // Update material info
    const updateMateriauQuery = `
      UPDATE materiaux 
      SET 
        type_materiau = COALESCE($1, type_materiau),
        nom = COALESCE($2, nom),
        description = COALESCE($3, description),
        prix_unitaire = COALESCE($4, prix_unitaire),
        unite_mesure = COALESCE($5, unite_mesure),
        options_disponibles = COALESCE($6, options_disponibles),
        date_modification = CURRENT_TIMESTAMP
      WHERE materiau_id = $7
      RETURNING *
    `;
    
    const materiauValues = [
      type_materiau,
      nom,
      description,
      prix_unitaire,
      unite_mesure,
      options_disponibles,
      id
    ];
    
    const materiauResult = await client.query(updateMateriauQuery, materiauValues);
    
    // Handle stock updates if provided
    if (stocks && stocks.length > 0) {
      for (const stock of stocks) {
        if (stock.stock_id) {
          // Update existing stock
          const updateStockQuery = `
            UPDATE stocks_materiaux_largeur
            SET
              largeur = COALESCE($1, largeur),
              quantite_en_stock = COALESCE($2, quantite_en_stock),
              seuil_alerte = COALESCE($3, seuil_alerte),
              unite_mesure = COALESCE($4, unite_mesure),
              date_modification = CURRENT_TIMESTAMP
            WHERE stock_id = $5 AND materiau_id = $6
            RETURNING *
          `;
          
          await client.query(updateStockQuery, [
            stock.largeur,
            stock.quantite_en_stock,
            stock.seuil_alerte,
            stock.unite_mesure,
            stock.stock_id,
            id
          ]);
        } else {
          // Insert new stock
          const insertStockQuery = `
            INSERT INTO stocks_materiaux_largeur (
              materiau_id,
              largeur,
              quantite_en_stock,
              seuil_alerte,
              unite_mesure
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `;
          
          await client.query(insertStockQuery, [
            id,
            stock.largeur,
            stock.quantite_en_stock || 0,
            stock.seuil_alerte || 0,
            stock.unite_mesure || materiauResult.rows[0].unite_mesure
          ]);
        }
      }
    }
    
    // Get updated data with stocks
    const getUpdatedQuery = `
      SELECT m.*, 
        COALESCE(json_agg(json_build_object(
          'stock_id', s.stock_id,
          'largeur', s.largeur,
          'quantite_en_stock', s.quantite_en_stock,
          'unite_mesure', s.unite_mesure,
          'seuil_alerte', s.seuil_alerte
        )) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.materiau_id = $1
      GROUP BY m.materiau_id
    `;
    
    const updatedResult = await client.query(getUpdatedQuery, [id]);
    
    await client.query('COMMIT');
    
    res.status(200).json({
      success: true,
      message: "Matériau mis à jour avec succès",
      data: updatedResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating material:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du matériau",
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Delete a material and its associated stock information
 */
export const deleteMateriau = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if material exists
    const checkQuery = `
      SELECT * FROM materiaux 
      WHERE materiau_id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matériau non trouvé"
      });
    }
    
    // Check if material is referenced in any commandes
    const checkUsageQuery = `
      SELECT COUNT(*) FROM details_commande 
      WHERE materiau_id = $1
    `;
    
    const usageResult = await pool.query(checkUsageQuery, [id]);
    
    if (parseInt(usageResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: "Ce matériau est utilisé dans des commandes et ne peut pas être supprimé"
      });
    }
    
    // Delete the material (cascade will delete related stocks)
    const deleteQuery = `
      DELETE FROM materiaux 
      WHERE materiau_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(deleteQuery, [id]);
    
    res.status(200).json({
      success: true,
      message: "Matériau supprimé avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du matériau",
      error: error.message
    });
  }
};

/**
 * Get a specific stock by ID
 */
export const getStockById = async (req, res) => {
  try {
    const { stockId } = req.params;
    
    const query = `
      SELECT s.*, m.nom as materiau_nom, m.type_materiau, m.unite_mesure as materiau_unite_mesure
      FROM stocks_materiaux_largeur s
      JOIN materiaux m ON s.materiau_id = m.materiau_id
      WHERE s.stock_id = $1
    `;
    
    const result = await pool.query(query, [stockId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock non trouvé"
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error getting stock by ID:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du stock",
      error: error.message
    });
  }
};

/**
 * Create a new stock movement
 */
export const createMouvementStock = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      stock_id, 
      type_mouvement, 
      quantite, 
      commentaire,
      commande_id,
      employe_id
    } = req.body;
    
    // Validation des données
    if (!stock_id || !type_mouvement || !quantite) {
      return res.status(400).json({
        success: false,
        message: "Le stock ID, le type de mouvement et la quantité sont requis"
      });
    }
    
    // Vérifier si le stock existe
    const stockQuery = `
      SELECT * FROM stocks_materiaux_largeur
      WHERE stock_id = $1
    `;
    
    const stockResult = await client.query(stockQuery, [stock_id]);
    
    if (stockResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock non trouvé"
      });
    }
    
    const stock = stockResult.rows[0];
    
    // Vérifier si le stock est suffisant pour une sortie
    if (type_mouvement === 'sortie' && stock.quantite_en_stock < quantite) {
      return res.status(400).json({
        success: false,
        message: "Stock insuffisant pour cette sortie"
      });
    }
    
    await client.query('BEGIN');
    
    // Créer le mouvement
    const insertMouvementQuery = `
      INSERT INTO mouvements_stock (
        stock_id,
        type_mouvement,
        quantite,
        commentaire,
        commande_id,
        employe_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const mouvementValues = [
      stock_id,
      type_mouvement,
      quantite,
      commentaire || null,
      commande_id || null,
      employe_id || req.user.employe_id
    ];
    
    const mouvementResult = await client.query(insertMouvementQuery, mouvementValues);
    const mouvement = mouvementResult.rows[0];
    
    // Mettre à jour le stock
    const updateStockQuery = `
      UPDATE stocks_materiaux_largeur
      SET 
        quantite_en_stock = CASE 
          WHEN $2 = 'entrée' THEN quantite_en_stock + $3
          WHEN $2 = 'sortie' THEN quantite_en_stock - $3
          ELSE quantite_en_stock
        END,
        date_modification = CURRENT_TIMESTAMP
      WHERE stock_id = $1
      RETURNING *
    `;
    
    const updateStockResult = await client.query(updateStockQuery, [stock_id, type_mouvement, quantite]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: "Mouvement de stock créé avec succès",
      data: {
        mouvement,
        stock: updateStockResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating stock movement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du mouvement de stock",
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get stock movements history
 */
export const getMouvementsStock = async (req, res) => {
  try {
    const { stockId } = req.params;
    
    // Vérifier si le stock existe
    const stockQuery = `
      SELECT * FROM stocks_materiaux_largeur
      WHERE stock_id = $1
    `;
    
    const stockResult = await pool.query(stockQuery, [stockId]);
    
    if (stockResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock non trouvé"
      });
    }
    
    // Récupérer les mouvements
    const mouvementsQuery = `
      SELECT m.*, 
        c.numero_commande,
        e.nom as employe_nom, e.prenom as employe_prenom
      FROM mouvements_stock m
      LEFT JOIN commandes c ON m.commande_id = c.commande_id
      LEFT JOIN employes e ON m.employe_id = e.employe_id
      WHERE m.stock_id = $1
      ORDER BY m.date_mouvement DESC
    `;
    
    const mouvementsResult = await pool.query(mouvementsQuery, [stockId]);
    
    res.status(200).json({
      success: true,
      data: mouvementsResult.rows
    });
  } catch (error) {
    console.error("Error getting stock movements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des mouvements de stock",
      error: error.message
    });
  }
};