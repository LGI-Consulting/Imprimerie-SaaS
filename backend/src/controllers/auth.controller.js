import * as bc from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
import cookie from "cookie";

dotenv.config();

/**
 * Enregistrement d'un nouvel employé
 */
async function register(req, res) {
  try {
    const { nom, prenom, email, telephone, role, password, date_embauche } =
      req.body;

    // Vérifier si l'employé existe déjà
    const existingUser = await pool.query(
      "SELECT * FROM employes WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    // Hasher le mot de passworde
    const salt = await bc.genSalt(12);
    const hashedpassword = await bc.hash(password, salt);

    // Insérer le nouvel employé
    const result = await pool.query(
      "INSERT INTO employes (nom, prenom, email, telephone, role, password, date_embauche) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nom, prenom, email, telephone, role, hashedpassword, date_embauche]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "création_compte",
        `Création du compte pour ${nom} ${prenom}`,
        "employes",
        result.rows[0].employe_id,
      ]
    );

    // Ne pas renvoyer le mot de passworde dans la réponse
    const { password: _, ...newEmployee } = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Employé enregistré avec succès",
      data: newEmployee,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de l'employé",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

// Fonction pour générer les tokens
function generateTokens(user) {
  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1d",
  });

  const refreshToken = jwt.sign(user, process.env.JWT_SECRET_REFRESH, {
    expiresIn: "1d",
  });

  return { accessToken, refreshToken };
}

/**
 * Connexion d'un employé avec refresh token sécurisé
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM employes WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passworde incorrect" });

    const employee = result.rows[0];
    if (!employee.est_actif)
      return res
        .status(403)
        .json({ success: false, message: "Ce compte a été désactivé" });

    const ispasswordValid = await bc.compare(
      password,
      employee.password
    );
    if (!ispasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passworde incorrect" });

    const payload = {
      id: employee.employe_id,
      email: employee.email,
      role: employee.role,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // Enregistrer la session
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24); // Basé sur JWT_EXPIRATION

    await pool.query(
      "INSERT INTO sessions_utilisateurs (employe_id, token_jwt, date_expiration, adresse_ip, appareil) VALUES ($1, $2, $3, $4, $5)",
      [employee.employe_id, accessToken, expirationDate, ip, userAgent]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        employee.employe_id,
        "connexion",
        `Connexion depuis ${ip}`,
        "employes",
        employee.employe_id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        token: accessToken,
        id: employee.employe_id,
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ success: false, message: "Erreur interne" });
  }
}

/**
 * Refresh token route
 */
async function refreshToken(req, res) {
  try {
    const cookies = req.headers.cookie;
    if (!cookies)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const parsed = cookie.parse(cookies);
    const token = parsed.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Token manquant" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_REFRESH);
    const accessToken = jwt.sign(decoded, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || "15m",
    });

    res.status(200).json({ success: true, token: accessToken });
  } catch (error) {
    console.error("Erreur refreshToken:", error);
    res
      .status(403)
      .json({ success: false, message: "Token invalide ou expiré" });
  }
}

/**
 * Déconnexion d'un utilisateur
 */
async function logout(req, res) {
  try {
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    if (!token) {
      return res.status(200).json({
        success: true,
        message: "Déconnexion réussie",
      });
    }

    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Invalider la session
    await pool.query(
      "UPDATE sessions_utilisateurs SET date_expiration = NOW() WHERE token_jwt = $1",
      [tokenValue]
    );

    // Journal d'activité
    if (req.user) {
      await pool.query(
        "INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
        [
          req.user.id,
          "déconnexion",
          "Déconnexion employé",
          "employes",
          req.user.id,
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Obtenir le profil de l'employé connecté
 */
async function getProfile(req, res) {
  try {
    const result = await pool.query(
      "SELECT e.employe_id, e.nom, e.prenom, e.email, e.telephone, e.role, e.date_embauche, e.est_actif " +
        "FROM employes e " +
        "WHERE e.employe_id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profil non trouvé",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...result.rows[0],
        type: "employee",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Modification du mot de passworde
 */
async function changepassword(req, res) {
  try {
    const { ancien_password, nouveau_password } = req.body;

    // Employé régulier
    const employe = await pool.query(
      "SELECT * FROM employes WHERE employe_id = $1",
      [req.user.id]
    );

    if (employe.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employé non trouvé",
      });
    }

    // Vérifier l'ancien mot de passworde
    const ispasswordValid = await bc.compare(
      ancien_password,
      employe.rows[0].password
    );
    if (!ispasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Ancien mot de passworde incorrect",
      });
    }

    // Hasher le nouveau mot de passworde
    const salt = await bc.genSalt(12);
    const hashedpassword = await bc.hash(nouveau_password, salt);

    // Mettre à jour le mot de passworde
    await pool.query(
      "UPDATE employes SET password = $1 WHERE employe_id = $2",
      [hashedpassword, req.user.id]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "modification_password",
        "Modification du mot de passworde employé",
        "employes",
        req.user.id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Mot de passworde modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la modification du mot de passworde:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du mot de passworde",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

export {
  register,
  login,
  logout,
  getProfile,
  changepassword,
  refreshToken,
};