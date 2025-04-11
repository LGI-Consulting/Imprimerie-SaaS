import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all materials for a specific tenant
 */
export const getAllMateriau = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const query = `
      SELECT m.*, 
             COALESCE(json_agg(
               json_build_object(
                 'stock_id', s.stock_id,
                 'largeur', s.largeur,
                 'quantite_en_stock', s.quantite_en_stock,
                 'seuil_alerte', s.seuil_alerte,
                 'unite_mesure', s.unite_mesure
               )
             ) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.tenant_id = $1
      GROUP BY m.materiau_id
      ORDER BY m.date_creation DESC
    `;
    
    const result = await pool.query(query, [tenantId]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error getting all materiaux:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des matériaux",
      error: error.message
    });
  }
};

/**
 * Get material by ID
 */
export const getMateriauByID = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const materiauId = req.params.id;
    
    const query = `
      SELECT m.*, 
             COALESCE(json_agg(
               json_build_object(
                 'stock_id', s.stock_id,
                 'largeur', s.largeur,
                 'quantite_en_stock', s.quantite_en_stock,
                 'seuil_alerte', s.seuil_alerte,
                 'unite_mesure', s.unite_mesure
               )
             ) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.tenant_id = $1 AND m.materiau_id = $2
      GROUP BY m.materiau_id
    `;
    
    const result = await pool.query(query, [tenantId, materiauId]);
    
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
    console.error("Error getting materiau by ID:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du matériau",
      error: error.message
    });
  }
};

/**
 * Search materials by name, type or description
 */
export const getMateriauBySearch = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Le terme de recherche est requis"
      });
    }
    
    const searchTerm = `%${term}%`;
    
    const query = `
      SELECT m.*, 
             COALESCE(json_agg(
               json_build_object(
                 'stock_id', s.stock_id,
                 'largeur', s.largeur,
                 'quantite_en_stock', s.quantite_en_stock,
                 'seuil_alerte', s.seuil_alerte,
                 'unite_mesure', s.unite_mesure
               )
             ) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.tenant_id = $1 
      AND (
        m.nom ILIKE $2 OR
        m.type_materiau ILIKE $2 OR
        m.description ILIKE $2
      )
      GROUP BY m.materiau_id
      ORDER BY m.date_creation DESC
    `;
    
    const result = await pool.query(query, [tenantId, searchTerm]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error searching materiaux:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche des matériaux",
      error: error.message
    });
  }
};

/**
 * Get material stock information
 */
export const getMateriauStock = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const materiauId = req.params.id;
    
    const query = `
      SELECT s.*
      FROM stocks_materiaux_largeur s
      JOIN materiaux m ON s.materiau_id = m.materiau_id
      WHERE m.tenant_id = $1 AND m.materiau_id = $2
      ORDER BY s.largeur ASC
    `;
    
    const result = await pool.query(query, [tenantId, materiauId]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error("Error getting materiau stock:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des stocks du matériau",
      error: error.message
    });
  }
};

/**
 * Create a new material with stock information
 */
export const createMateriau = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const tenantId = req.tenantId;
    const {
      type_materiau,
      nom,
      description,
      prix_unitaire,
      unite_mesure,
      options_disponibles,
      stocks = []
    } = req.body;
    
    // Validate required fields
    if (!type_materiau || !prix_unitaire || !unite_mesure) {
      return res.status(400).json({
        success: false,
        message: "Les champs type_materiau, prix_unitaire et unite_mesure sont obligatoires"
      });
    }
    
    // Insert the new material
    const materiauQuery = `
      INSERT INTO materiaux (
        tenant_id, 
        type_materiau, 
        nom, 
        description, 
        prix_unitaire, 
        unite_mesure, 
        options_disponibles
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const materiauValues = [
      tenantId,
      type_materiau,
      nom || null,
      description || null,
      prix_unitaire,
      unite_mesure,
      options_disponibles || '{}'
    ];
    
    const materiauResult = await client.query(materiauQuery, materiauValues);
    const newMateriau = materiauResult.rows[0];
    
    // Insert stock information if provided
    if (stocks && stocks.length > 0) {
      const stockPromises = stocks.map(async (stock) => {
        const stockQuery = `
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
        
        const stockValues = [
          newMateriau.materiau_id,
          stock.largeur,
          stock.quantite_en_stock || 0,
          stock.seuil_alerte || 0,
          stock.unite_mesure || unite_mesure
        ];
        
        return client.query(stockQuery, stockValues);
      });
      
      await Promise.all(stockPromises);
    }
    
    // Log the activity
    const logQuery = `
      INSERT INTO journal_activites (
        tenant_id,
        employe_id,
        action,
        details,
        entite_affectee,
        entite_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId,
      req.employeId,
      'create',
      `Création du matériau: ${nom || type_materiau}`,
      'materiaux',
      newMateriau.materiau_id
    ];
    
    await client.query(logQuery, logValues);
    
    await client.query('COMMIT');
    
    // Query to get the complete new material with stock information
    const getCompleteData = `
      SELECT m.*, 
             COALESCE(json_agg(
               json_build_object(
                 'stock_id', s.stock_id,
                 'largeur', s.largeur,
                 'quantite_en_stock', s.quantite_en_stock,
                 'seuil_alerte', s.seuil_alerte,
                 'unite_mesure', s.unite_mesure
               )
             ) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.tenant_id = $1 AND m.materiau_id = $2
      GROUP BY m.materiau_id
    `;
    
    const completeResult = await pool.query(getCompleteData, [tenantId, newMateriau.materiau_id]);
    
    res.status(201).json({
      success: true,
      message: "Matériau créé avec succès",
      data: completeResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating materiau:", error);
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
    await client.query('BEGIN');
    
    const tenantId = req.tenantId;
    const materiauId = req.params.id;
    const {
      type_materiau,
      nom,
      description,
      prix_unitaire,
      unite_mesure,
      options_disponibles,
      stocks = []
    } = req.body;
    
    // Check if material exists
    const checkQuery = `
      SELECT * FROM materiaux 
      WHERE tenant_id = $1 AND materiau_id = $2
    `;
    
    const checkResult = await client.query(checkQuery, [tenantId, materiauId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matériau non trouvé"
      });
    }
    
    // Update material
    const updateQuery = `
      UPDATE materiaux
      SET 
        type_materiau = COALESCE($1, type_materiau),
        nom = COALESCE($2, nom),
        description = COALESCE($3, description),
        prix_unitaire = COALESCE($4, prix_unitaire),
        unite_mesure = COALESCE($5, unite_mesure),
        options_disponibles = COALESCE($6, options_disponibles),
        date_modification = CURRENT_TIMESTAMP
      WHERE tenant_id = $7 AND materiau_id = $8
      RETURNING *
    `;
    
    const updateValues = [
      type_materiau,
      nom,
      description,
      prix_unitaire,
      unite_mesure,
      options_disponibles ? JSON.stringify(options_disponibles) : null,
      tenantId,
      materiauId
    ];
    
    const updateResult = await client.query(updateQuery, updateValues);
    
    // Update stock information if provided
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
          
          const updateStockValues = [
            stock.largeur,
            stock.quantite_en_stock,
            stock.seuil_alerte,
            stock.unite_mesure,
            stock.stock_id,
            materiauId
          ];
          
          await client.query(updateStockQuery, updateStockValues);
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
          
          const insertStockValues = [
            materiauId,
            stock.largeur,
            stock.quantite_en_stock || 0,
            stock.seuil_alerte || 0,
            stock.unite_mesure || updateResult.rows[0].unite_mesure
          ];
          
          await client.query(insertStockQuery, insertStockValues);
        }
      }
    }
    
    // Log the activity
    const logQuery = `
      INSERT INTO journal_activites (
        tenant_id,
        employe_id,
        action,
        details,
        entite_affectee,
        entite_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId,
      req.employeId,
      'update',
      `Mise à jour du matériau: ${updateResult.rows[0].nom || updateResult.rows[0].type_materiau}`,
      'materiaux',
      materiauId
    ];
    
    await client.query(logQuery, logValues);
    
    await client.query('COMMIT');
    
    // Query to get the complete updated material with stock information
    const getCompleteData = `
      SELECT m.*, 
             COALESCE(json_agg(
               json_build_object(
                 'stock_id', s.stock_id,
                 'largeur', s.largeur,
                 'quantite_en_stock', s.quantite_en_stock,
                 'seuil_alerte', s.seuil_alerte,
                 'unite_mesure', s.unite_mesure
               )
             ) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
      FROM materiaux m
      LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
      WHERE m.tenant_id = $1 AND m.materiau_id = $2
      GROUP BY m.materiau_id
    `;
    
    const completeResult = await pool.query(getCompleteData, [tenantId, materiauId]);
    
    res.status(200).json({
      success: true,
      message: "Matériau mis à jour avec succès",
      data: completeResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating materiau:", error);
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
 * Delete a material and all related stock information
 */
export const deleteMateriau = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const tenantId = req.tenantId;
    const materiauId = req.params.id;
    
    // Check if material exists and get details for logging
    const checkQuery = `
      SELECT * FROM materiaux 
      WHERE tenant_id = $1 AND materiau_id = $2
    `;
    
    const checkResult = await client.query(checkQuery, [tenantId, materiauId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matériau non trouvé"
      });
    }
    
    const materiau = checkResult.rows[0];
    
    // Check if material is used in any order
    const checkOrdersQuery = `
      SELECT COUNT(*) FROM details_commande 
      WHERE materiau_id = $1
    `;
    
    const ordersResult = await client.query(checkOrdersQuery, [materiauId]);
    
    if (parseInt(ordersResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: "Ce matériau est utilisé dans des commandes existantes et ne peut pas être supprimé"
      });
    }
    
    // Delete stock information first (cascade delete will handle this, but we'll do it explicitly)
    const deleteStockQuery = `
      DELETE FROM stocks_materiaux_largeur
      WHERE materiau_id = $1
    `;
    
    await client.query(deleteStockQuery, [materiauId]);
    
    // Delete material
    const deleteQuery = `
      DELETE FROM materiaux
      WHERE tenant_id = $1 AND materiau_id = $2
      RETURNING *
    `;
    
    const deleteResult = await client.query(deleteQuery, [tenantId, materiauId]);
    
    // Log the activity
    const logQuery = `
      INSERT INTO journal_activites (
        tenant_id,
        employe_id,
        action,
        details,
        entite_affectee,
        entite_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId,
      req.employeId,
      'delete',
      `Suppression du matériau: ${materiau.nom || materiau.type_materiau}`,
      'materiaux',
      materiauId
    ];
    
    await client.query(logQuery, logValues);
    
    await client.query('COMMIT');
    
    res.status(200).json({
      success: true,
      message: "Matériau supprimé avec succès",
      data: deleteResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting materiau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du matériau",
      error: error.message
    });
  } finally {
    client.release();
  }
};