import pool from "../config/db.js";

/**
 * Get all tenants (for super admin)
 */
async function getAllTenants(req, res) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    // Base query
    let query = "SELECT * FROM tenants";
    let countQuery = "SELECT COUNT(*) FROM tenants";
    const queryParams = [];
    
    // Add search filter if provided
    if (search) {
      query += " WHERE nom ILIKE $1 OR email ILIKE $1";
      countQuery += " WHERE nom ILIKE $1 OR email ILIKE $1";
      queryParams.push(`%${search}%`);
    }

    // Add pagination to main query
    query += ` ORDER BY date_creation DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Execute both queries
    const tenantsResult = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, queryParams.slice(0, search ? 1 : 0));

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details) VALUES ($1, $2, $3)",
      [
        req.user.id,
        "liste_tenants",
        `Consultation de la liste des tenants (page ${page})`
      ]
    );

    res.status(200).json({
      success: true,
      data: tenantsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tenants:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des entreprises",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Get a single tenant by ID
 */
async function getTenantById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM tenants WHERE tenant_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entreprise non trouvée",
      });
    }

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "consultation_tenant",
        `Consultation du tenant ${result.rows[0].nom}`,
        "tenants",
        id
      ]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du tenant:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'entreprise",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Update a tenant
 */
async function updateTenant(req, res) {
  try {
    const { id } = req.params;
    const { nom, description, logo_url, adresse, telephone, email, est_actif } = req.body;

    // Vérifier si le tenant existe
    const existingTenant = await pool.query("SELECT * FROM tenants WHERE tenant_id = $1", [id]);
    if (existingTenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entreprise non trouvée",
      });
    }

    // Mettre à jour le tenant
    const result = await pool.query(
      "UPDATE tenants SET nom = $1, description = $2, logo_url = $3, adresse = $4, telephone = $5, email = $6, est_actif = $7, date_modification = CURRENT_TIMESTAMP WHERE tenant_id = $8 RETURNING *",
      [nom, description, logo_url, adresse, telephone, email, est_actif, id]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "modification_tenant",
        `Modification du tenant ${nom}`,
        "tenants",
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Entreprise mise à jour avec succès",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tenant:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'entreprise",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Toggle tenant activation status
 */
async function toggleTenantStatus(req, res) {
  try {
    const { id } = req.params;

    // Vérifier si le tenant existe
    const existingTenant = await pool.query("SELECT * FROM tenants WHERE tenant_id = $1", [id]);
    if (existingTenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entreprise non trouvée",
      });
    }

    // Basculer le statut
    const newStatus = !existingTenant.rows[0].est_actif;
    await pool.query(
      "UPDATE tenants SET est_actif = $1 WHERE tenant_id = $2",
      [newStatus, id]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "changement_statut_tenant",
        `Changement de statut du tenant ${existingTenant.rows[0].nom} à ${newStatus ? 'actif' : 'inactif'}`,
        "tenants",
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: `Entreprise ${newStatus ? 'activée' : 'désactivée'} avec succès`,
      data: {
        tenant_id: id,
        est_actif: newStatus
      },
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut du tenant:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de statut de l'entreprise",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Get tenant statistics
 */
async function getTenantStats(req, res) {
  try {
    const { id } = req.params;

    // Vérifier si le tenant existe
    const tenantCheck = await pool.query("SELECT * FROM tenants WHERE tenant_id = $1", [id]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entreprise non trouvée",
      });
    }

    // Get counts for various metrics
    const employeesCount = await pool.query(
      "SELECT COUNT(*) FROM employes WHERE tenant_id = $1 AND est_actif = true",
      [id]
    );
    const clientsCount = await pool.query(
      "SELECT COUNT(*) FROM clients WHERE tenant_id = $1",
      [id]
    );
    const activeOrdersCount = await pool.query(
      "SELECT COUNT(*) FROM commandes WHERE tenant_id = $1 AND statut NOT IN ('terminée', 'livrée')",
      [id]
    );
    const completedOrdersCount = await pool.query(
      "SELECT COUNT(*) FROM commandes WHERE tenant_id = $1 AND statut IN ('terminée', 'livrée')",
      [id]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "statistiques_tenant",
        `Consultation des statistiques du tenant ${tenantCheck.rows[0].nom}`,
        "tenants",
        id
      ]
    );

    res.status(200).json({
      success: true,
      data: {
        tenant: tenantCheck.rows[0],
        stats: {
          employees: parseInt(employeesCount.rows[0].count),
          clients: parseInt(clientsCount.rows[0].count),
          active_orders: parseInt(activeOrdersCount.rows[0].count),
          completed_orders: parseInt(completedOrdersCount.rows[0].count),
        }
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de l'entreprise",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

export {
  getAllTenants,
  getTenantById,
  updateTenant,
  toggleTenantStatus,
  getTenantStats
};