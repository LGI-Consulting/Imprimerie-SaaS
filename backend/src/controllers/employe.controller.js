import pool from "../config/db.js";
import bcrypt from 'bcrypt';

// Récupérer tous les employés d'un tenant
export const getAllEmployes = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const query = 'SELECT employe_id, tenant_id, nom, prenom, email, telephone, role, date_embauche, est_actif FROM employes WHERE tenant_id = $1';
    const { rows } = await pool.query(query, [tenantId]);
    
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des employés", error: error.message });
  }
};

// Récupérer un employé par son ID
export const getEmployeById = async (req, res) => {
  try {
    const employeId = req.params.id;
    const tenantId = req.user.tenant_id;
    
    const query = 'SELECT employe_id, tenant_id, nom, prenom, email, telephone, role, date_embauche, est_actif FROM employes WHERE employe_id = $1 AND tenant_id = $2';
    const { rows } = await pool.query(query, [employeId, tenantId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'employé", error: error.message });
  }
};

// Rechercher un employé par nom, téléphone ou email
export const getEmployeBySearch = async (req, res) => {
  try {
    const { query } = req.query;
    const tenantId = req.user.tenant_id;
    
    const sqlQuery = `
      SELECT employe_id, tenant_id, nom, prenom, email, telephone, role, date_embauche, est_actif 
      FROM employes 
      WHERE tenant_id = $1 AND 
      (nom ILIKE $2 OR prenom ILIKE $2 OR telephone ILIKE $2 OR email ILIKE $2)
    `;
    
    const { rows } = await pool.query(sqlQuery, [tenantId, `%${query}%`]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la recherche d'employés", error: error.message });
  }
};

// Créer un nouvel employé
export const createEmploye = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { nom, prenom, email, telephone, role, password, date_embauche } = req.body;
    const tenantId = req.user.tenant_id;
    
    // Vérifier si l'employé existe déjà
    const checkQuery = 'SELECT * FROM employes WHERE tenant_id = $1 AND email = $2';
    const { rows } = await client.query(checkQuery, [tenantId, email]);
    
    if (rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Un employé avec cet email existe déjà" });
    }
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const insertQuery = `
      INSERT INTO employes (tenant_id, nom, prenom, email, telephone, role, password, date_embauche, est_actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING employe_id, tenant_id, nom, prenom, email, telephone, role, date_embauche, est_actif
    `;
    
    const values = [tenantId, nom, prenom, email, telephone, role, hashedPassword, date_embauche];
    const result = await client.query(insertQuery, values);
    
    // Enregistrer l'action dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId, 
      req.user.employe_id, 
      'creation', 
      `Création d'un nouvel employé: ${nom} ${prenom}`,
      'employes',
      result.rows[0].employe_id
    ];
    
    await client.query(logQuery, logValues);
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la création de l'employé", error: error.message });
  } finally {
    client.release();
  }
};

// Mettre à jour un employé
export const updateEmploye = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const employeId = req.params.id;
    const tenantId = req.user.tenant_id;
    const { nom, prenom, email, telephone, role, date_embauche } = req.body;
    
    // Vérifier si l'employé existe
    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1 AND tenant_id = $2';
    const checkResult = await client.query(checkQuery, [employeId, tenantId]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre employé
    if (email !== checkResult.rows[0].email) {
      const emailCheckQuery = 'SELECT * FROM employes WHERE tenant_id = $1 AND email = $2 AND employe_id != $3';
      const emailCheck = await client.query(emailCheckQuery, [tenantId, email, employeId]);
      
      if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: "Cet email est déjà utilisé par un autre employé" });
      }
    }
    
    // Mettre à jour l'employé
    const updateQuery = `
      UPDATE employes
      SET nom = $1, prenom = $2, email = $3, telephone = $4, role = $5, date_embauche = $6
      WHERE employe_id = $7 AND tenant_id = $8
      RETURNING employe_id, tenant_id, nom, prenom, email, telephone, role, date_embauche, est_actif
    `;
    
    const values = [nom, prenom, email, telephone, role, date_embauche, employeId, tenantId];
    const result = await client.query(updateQuery, values);
    
    // Enregistrer l'action dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId, 
      req.user.employe_id, 
      'modification', 
      `Mise à jour des informations de l'employé: ${nom} ${prenom}`,
      'employes',
      employeId
    ];
    
    await client.query(logQuery, logValues);
    await client.query('COMMIT');
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'employé", error: error.message });
  } finally {
    client.release();
  }
};

// Changer le statut d'un employé (activer/désactiver)
export const changeEmployeStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const employeId = req.params.id;
    const tenantId = req.user.tenant_id;
    const { est_actif } = req.body;
    
    // Vérifier si l'employé existe
    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1 AND tenant_id = $2';
    const checkResult = await client.query(checkQuery, [employeId, tenantId]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    // Mettre à jour le statut
    const updateQuery = `
      UPDATE employes
      SET est_actif = $1
      WHERE employe_id = $2 AND tenant_id = $3
      RETURNING employe_id, tenant_id, nom, prenom, email, telephone, role, date_embauche, est_actif
    `;
    
    const values = [est_actif, employeId, tenantId];
    const result = await client.query(updateQuery, values);
    
    // Enregistrer l'action dans le journal des activités
    const action = est_actif ? 'activation' : 'désactivation';
    const logQuery = `
      INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId, 
      req.user.employe_id, 
      action, 
      `${action.charAt(0).toUpperCase() + action.slice(1)} du compte employé: ${checkResult.rows[0].nom} ${checkResult.rows[0].prenom}`,
      'employes',
      employeId
    ];
    
    await client.query(logQuery, logValues);
    await client.query('COMMIT');
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors du changement de statut de l'employé", error: error.message });
  } finally {
    client.release();
  }
};

// Supprimer un employé
export const deleteEmploye = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const employeId = req.params.id;
    const tenantId = req.user.tenant_id;
    
    // Vérifier si l'employé existe
    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1 AND tenant_id = $2';
    const checkResult = await client.query(checkQuery, [employeId, tenantId]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    // Stocker les informations de l'employé avant suppression pour le journal
    const employeInfo = checkResult.rows[0];
    
    // Supprimer l'employé
    const deleteQuery = 'DELETE FROM employes WHERE employe_id = $1 AND tenant_id = $2';
    await client.query(deleteQuery, [employeId, tenantId]);
    
    // Enregistrer l'action dans le journal des activités
    const logQuery = `
      INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const logValues = [
      tenantId, 
      req.user.employe_id, 
      'suppression', 
      `Suppression de l'employé: ${employeInfo.nom} ${employeInfo.prenom}`,
      'employes',
      employeId
    ];
    
    await client.query(logQuery, logValues);
    await client.query('COMMIT');
    
    res.status(200).json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Erreur lors de la suppression de l'employé", error: error.message });
  } finally {
    client.release();
  }
};

// Récupérer les activités d'un employé
export const getEmployeActivities = async (req, res) => {
  try {
    const employeId = req.params.id;
    const tenantId = req.user.tenant_id;
    
    // Vérifier si l'employé existe
    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1 AND tenant_id = $2';
    const checkResult = await pool.query(checkQuery, [employeId, tenantId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    // Récupérer les activités
    const activitiesQuery = `
      SELECT log_id, action, date_action, details, entite_affectee, entite_id
      FROM journal_activites
      WHERE employe_id = $1 AND tenant_id = $2
      ORDER BY date_action DESC
    `;
    
    const { rows } = await pool.query(activitiesQuery, [employeId, tenantId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des activités de l'employé", error: error.message });
  }
};