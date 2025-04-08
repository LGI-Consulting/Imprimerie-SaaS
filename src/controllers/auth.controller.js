import * as bc from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();
/**
 * Enregistrement d'un nouvel employé
 */
 async function register(req, res) {
  try {
    const { nom, prenom, email, telephone, role, mot_de_passe, date_embauche } = req.body;

    // Vérifier si l'employé existe déjà
    const existingUser = await pool.query('SELECT * FROM employes WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const salt = await bc.genSalt(10);
    const hashedPassword = await bc.hash(mot_de_passe, salt);

    // Insérer le nouvel employé
    const result = await pool.query(
      'INSERT INTO employes (nom, prenom, email, telephone, role, mot_de_passe, date_embauche) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nom, prenom, email, telephone, role, hashedPassword, date_embauche]
    );

    // Journal d'activité
    await pool.query(
      'INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user ? req.user.id : null,
        'création_compte',
        `Création du compte pour ${nom} ${prenom}`,
        'employes',
        result.rows[0].employe_id
      ]
    );

    // Ne pas renvoyer le mot de passe dans la réponse
    const { mot_de_passe: _, ...newEmployee } = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Employé enregistré avec succès',
      data: newEmployee
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'employé',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Connexion d'un employé
 */
 async function login(req, res) {
  try {
    const { email, mot_de_passe } = req.body;

    // Vérifier si l'employé existe
    const result = await pool.query('SELECT * FROM employes WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const employee = result.rows[0];

    // Vérifier si l'employé est actif
    if (!employee.est_actif) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte a été désactivé'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bc.compare(mot_de_passe, employee.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      {
        id: employee.employe_id,
        email: employee.email,
        role: employee.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION
      }
    );

    // Enregistrer la session
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24); // Basé sur JWT_EXPIRATION

    await pool.query(
      'INSERT INTO sessions_utilisateurs (employe_id, token_jwt, date_expiration, adresse_ip, appareil) VALUES ($1, $2, $3, $4, $5)',
      [employee.employe_id, token, expirationDate, ip, userAgent]
    );

    // Journal d'activité
    await pool.query(
      'INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
      [
        employee.employe_id,
        'connexion',
        `Connexion depuis ${ip}`,
        'employes',
        employee.employe_id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        id: employee.employe_id,
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Déconnexion d'un employé
 */
 async function logout(req, res) {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
      return res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    }

    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Invalider la session
    await pool.query('UPDATE sessions_utilisateurs SET date_expiration = NOW() WHERE token_jwt = $1', [tokenValue]);

    // Journal d'activité
    if (req.user) {
      await pool.query(
        'INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
        [
          req.user.id,
          'déconnexion',
          'Déconnexion',
          'employes',
          req.user.id
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Obtenir le profil de l'employé connecté
 */
 async function getProfile(req, res) {
  try {
    const result = await query('SELECT employe_id, nom, prenom, email, telephone, role, date_embauche, est_actif FROM employes WHERE employe_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

export default {
    register,
    login,
    logout,
    getProfile
}