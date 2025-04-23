import pool from "../config/db.js";
import bcrypt from 'bcrypt';

// Récupérer tous les employés
export const getAllEmployes = async (req, res) => {
  try {
    const query = 'SELECT employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif FROM employes';
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des employés", error: error.message });
  }
};

// Récupérer un employé par son ID
export const getEmployeById = async (req, res) => {
  try {
    const employeId = req.params.id;
    const query = 'SELECT employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif FROM employes WHERE employe_id = $1';
    const { rows } = await pool.query(query, [employeId]);
    
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
    const sqlQuery = `
      SELECT employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif 
      FROM employes 
      WHERE nom ILIKE $1 OR prenom ILIKE $1 OR telephone ILIKE $1 OR email ILIKE $1
    `;
    
    const { rows } = await pool.query(sqlQuery, [`%${query}%`]);
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

    const checkQuery = 'SELECT * FROM employes WHERE email = $1';
    const { rows } = await client.query(checkQuery, [email]);
    if (rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Un employé avec cet email existe déjà" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO employes (nom, prenom, email, telephone, role, password, date_embauche, est_actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif
    `;
    const values = [nom, prenom, email, telephone, role, hashedPassword, date_embauche];
    const result = await client.query(insertQuery, values);

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
    const { nom, prenom, email, telephone, role, date_embauche } = req.body;

    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1';
    const checkResult = await client.query(checkQuery, [employeId]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    if (email !== checkResult.rows[0].email) {
      const emailCheckQuery = 'SELECT * FROM employes WHERE email = $1 AND employe_id != $2';
      const emailCheck = await client.query(emailCheckQuery, [email, employeId]);
      if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: "Cet email est déjà utilisé par un autre employé" });
      }
    }

    const updateQuery = `
      UPDATE employes
      SET nom = $1, prenom = $2, email = $3, telephone = $4, role = $5, date_embauche = $6
      WHERE employe_id = $7
      RETURNING employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif
    `;
    const values = [nom, prenom, email, telephone, role, date_embauche, employeId];
    const result = await client.query(updateQuery, values);

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
    const { est_actif } = req.body;

    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1';
    const checkResult = await client.query(checkQuery, [employeId]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    const updateQuery = `
      UPDATE employes
      SET est_actif = $1
      WHERE employe_id = $2
      RETURNING employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif
    `;
    const result = await client.query(updateQuery, [est_actif, employeId]);
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

    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1';
    const checkResult = await client.query(checkQuery, [employeId]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    const deleteQuery = 'DELETE FROM employes WHERE employe_id = $1';
    await client.query(deleteQuery, [employeId]);
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

    const checkQuery = 'SELECT * FROM employes WHERE employe_id = $1';
    const checkResult = await pool.query(checkQuery, [employeId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    const activitiesQuery = `
      SELECT log_id, action, date_action, details, entite_affectee, entite_id
      FROM journal_activites
      WHERE employe_id = $1
      ORDER BY date_action DESC
    `;
    const { rows } = await pool.query(activitiesQuery, [employeId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des activités de l'employé", error: error.message });
  }
};
