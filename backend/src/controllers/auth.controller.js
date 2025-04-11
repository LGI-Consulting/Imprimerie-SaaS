import * as bc from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
import cookie from "cookie";

dotenv.config();

/**
 * Enregistrement d'un nouvel employé par un admin de tenant
 */
async function register(req, res) {
  try {
    const { nom, prenom, email, telephone, role, password, date_embauche } =
      req.body;
    const tenantId = req.user.tenantId; // Obtenu du token JWT

    // Vérifier si l'employé existe déjà dans ce tenant
    const existingUser = await pool.query(
      "SELECT * FROM employes WHERE email = $1 AND tenant_id = $2",
      [email, tenantId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Un utilisateur avec cet email existe déjà dans votre entreprise",
      });
    }

    // Hasher le mot de passworde
    const salt = await bc.genSalt(12);
    const hashedpassword = await bc.hash(password, salt);

    // Insérer le nouvel employé avec le tenant_id
    const result = await pool.query(
      "INSERT INTO employes (tenant_id, nom, prenom, email, telephone, role, password, date_embauche) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        tenantId,
        nom,
        prenom,
        email,
        telephone,
        role,
        hashedpassword,
        date_embauche,
      ]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        tenantId,
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

/**
 * Enregistrement d'un nouveau tenant par un super admin
 */
async function registerTenant(req, res) {
  try {
    const { nom, description, adresse, telephone, email, logoUrl } = req.body;

    // Créer le nouveau tenant
    const tenantResult = await pool.query(
      "INSERT INTO tenants (nom, description, adresse, telephone, email, logo_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nom, description, adresse, telephone, email, logoUrl]
    );

    const newTenant = tenantResult.rows[0];

    // Journal d'activité pour le super admin
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "création_tenant",
        `Création du tenant "${nom}"`,
        "tenants",
        newTenant.tenant_id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Nouvelle entreprise créée avec succès",
      data: newTenant,
    });
  } catch (error) {
    console.error("Erreur lors de la création du tenant:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'entreprise",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Enregistrement du premier admin d'un tenant par un super admin
 */
async function registerTenantAdmin(req, res) {
  try {
    const {
      tenant_id,
      nom,
      prenom,
      email,
      telephone,
      password,
      date_embauche,
    } = req.body;

    // Vérifier si le tenant existe
    const tenantCheck = await pool.query(
      "SELECT * FROM tenants WHERE tenant_id = $1",
      [tenant_id]
    );
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "L'entreprise spécifiée n'existe pas",
      });
    }

    // Vérifier si l'employé existe déjà dans ce tenant
    const existingUser = await pool.query(
      "SELECT * FROM employes WHERE email = $1 AND tenant_id = $2",
      [email, tenant_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Un utilisateur avec cet email existe déjà dans cette entreprise",
      });
    }

    // Hasher le mot de passworde
    const salt = await bc.genSalt(12);
    const hashedpassword = await bc.hash(password, salt);

    // Insérer le nouvel admin avec le role 'admin'
    const result = await pool.query(
      "INSERT INTO employes (tenant_id, nom, prenom, email, telephone, role, password, date_embauche) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        tenant_id,
        nom,
        prenom,
        email,
        telephone,
        "admin",
        hashedpassword,
        date_embauche,
      ]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.user.id,
        "création_admin_tenant",
        `Création du compte admin pour ${nom} ${prenom} dans l'entreprise ID ${tenant_id}`,
        "employes",
        result.rows[0].employe_id,
      ]
    );

    // Ne pas renvoyer le mot de passworde dans la réponse
    const { password: _, ...newAdmin } = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Administrateur de l'entreprise créé avec succès",
      data: newAdmin,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'admin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'administrateur",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

// Fonction pour générer les tokens
function generateTokens(user) {
  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "15m",
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
    const { email, password, tenant_id } = req.body;

    if (!tenant_id)
      return res.status(400).json({
        success: false,
        message: "L'identifiant de l'entreprise est requis",
      });

    const result = await pool.query(
      "SELECT * FROM employes WHERE email = $1 AND tenant_id = $2",
      [email, tenant_id]
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

    const tenantStatus = await pool.query(
      "SELECT est_actif FROM tenants WHERE tenant_id = $1",
      [tenant_id]
    );
    if (!tenantStatus.rows[0].est_actif)
      return res
        .status(403)
        .json({ success: false, message: "Cette entreprise est désactivée" });

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
      tenantId: employee.tenant_id,
      type: "employee",
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
      "INSERT INTO sessions_utilisateurs (tenant_id, employe_id, token_jwt, date_expiration, adresse_ip, appareil) VALUES ($1, $2, $3, $4, $5, $6)",
      [tenant_id, employee.employe_id, accessToken, expirationDate, ip, userAgent]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        tenant_id,
        employee.employe_id,
        "connexion",
        `Connexion depuis ${ip}`,
        "employes",
        employee.employe_id,
      ]
    );

    // Récupérer le nom du tenant
    const tenantInfo = await pool.query(
      "SELECT nom FROM tenants WHERE tenant_id = $1",
      [tenant_id]
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
        tenant_id: employee.tenant_id,
        tenant_nom: tenantInfo.rows[0].nom,
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
 * Connexion d'un super admin
 */
async function sadminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Vérifier si le super admin existe
    const result = await pool.query(
      "SELECT * FROM sadmin WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passworde incorrect",
      });
    }

    const admin = result.rows[0];

    // Vérifier si le compte est actif
    if (!admin.statut) {
      return res.status(403).json({
        success: false,
        message: "Ce compte a été désactivé",
      });
    }

    // Vérifier le mot de passworde
    const ispasswordValid = await bc.compare(password, admin.password);
    if (!ispasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passworde incorrect",
      });
    }

    // Générer un token JWT
    const payload = {
      id: admin.admin_id,
      email: admin.email,
      type: "sadmin",
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
    expirationDate.setHours(expirationDate.getHours() + 24);

    await pool.query(
      "INSERT INTO sessions_utilisateurs (sadmin_id, token_jwt, date_expiration, adresse_ip, appareil) VALUES ($1, $2, $3, $4, $5)",
      [admin.admin_id, accessToken, expirationDate, ip, userAgent]
    );

    // Mettre à jour la dernière connexion
    await pool.query(
      "UPDATE sadmin SET derniere_connexion = CURRENT_TIMESTAMP WHERE admin_id = $1",
      [admin.admin_id]
    );

    // Journal d'activité
    await pool.query(
      "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
      [
        admin.admin_id,
        "connexion_sadmin",
        `Connexion depuis ${ip}`,
        "sadmin",
        admin.admin_id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Connexion super admin réussie",
      data: {
        token: accessToken,
        id: admin.admin_id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        type: "sadmin",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion super admin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
}

/**
 * Déconnexion d'un utilisateur (employé ou super admin)
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
      if (req.user.type === "sadmin") {
        await pool.query(
          "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
          [
            req.user.id,
            "déconnexion",
            "Déconnexion super admin",
            "sadmin",
            req.user.id,
          ]
        );
      } else {
        await pool.query(
          "INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            req.user.tenantId,
            req.user.id,
            "déconnexion",
            "Déconnexion employé",
            "employes",
            req.user.id,
          ]
        );
      }
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
    // Vérifier le type d'utilisateur
    if (req.user.type === "sadmin") {
      const result = await pool.query(
        "SELECT admin_id, nom, prenom, email, date_creation, derniere_connexion, statut FROM sadmin WHERE admin_id = $1",
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
          type: "sadmin",
        },
      });
    } else {
      // Employé régulier
      const result = await pool.query(
        "SELECT e.employe_id, e.nom, e.prenom, e.email, e.telephone, e.role, e.date_embauche, e.est_actif, t.nom as tenant_nom " +
          "FROM employes e " +
          "JOIN tenants t ON e.tenant_id = t.tenant_id " +
          "WHERE e.employe_id = $1 AND e.tenant_id = $2",
        [req.user.id, req.user.tenantId]
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
    }
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
 * Création d'un super admin (réservé au premier super admin)
 */
async function createsadmin(req, res) {
  try {
    const { nom, prenom, email, password } = req.body;

    // Vérifier si un super admin existe déjà
    const adminCount = await pool.query("SELECT COUNT(*) FROM sadmin");
    
    // S'assurer que la requête vient d'un super admin existant
    // Ce contrôle a été renforcé en ajoutant les middleware dans les routes
    const isSadmin = req.user && req.user.type === "sadmin";

    // Si c'est le premier super admin, ou si la requête vient d'un super admin existant
    if (adminCount.rows[0].count === "0" || isSadmin) {
      // Vérifier si l'email existe déjà
      const existingAdmin = await pool.query(
        "SELECT * FROM sadmin WHERE email = $1",
        [email]
      );
      if (existingAdmin.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Un super admin avec cet email existe déjà",
        });
      }

      // Hasher le mot de passworde
      const salt = await bc.genSalt(12);
      const hashedpassword = await bc.hash(password, salt);

      // Créer le super admin
      const result = await pool.query(
        "INSERT INTO sadmin (nom, prenom, email, password) VALUES ($1, $2, $3, $4) RETURNING admin_id, nom, prenom, email, date_creation",
        [nom, prenom, email, hashedpassword]
      );

      // Journal d'activité si c'est un super admin existant qui crée
      if (isSadmin) {
        await pool.query(
          "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
          [
            req.user.id,
            "création_sadmin",
            `Création du super admin ${nom} ${prenom}`,
            "sadmin",
            result.rows[0].admin_id,
          ]
        );
      }

      // Réponse avec les données du nouveau super admin
      return res.status(201).json({
        success: true,
        message: "Super admin créé avec succès",
        data: result.rows[0],
      });
    } else {
      // Si ce n'est pas le premier super admin et que la requête ne vient pas d'un super admin
      return res.status(403).json({
        success: false,
        message: "Opération non autorisée",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création du super admin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du super admin",
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

    if (req.user.type === "sadmin") {
      // Récupérer les infos du super admin
      const admin = await pool.query(
        "SELECT * FROM sadmin WHERE admin_id = $1",
        [req.user.id]
      );

      if (admin.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Super admin non trouvé",
        });
      }

      // Vérifier l'ancien mot de passworde
      const ispasswordValid = await bc.compare(
        ancien_password,
        admin.rows[0].password
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
        "UPDATE sadmin SET password = $1 WHERE admin_id = $2",
        [hashedpassword, req.user.id]
      );

      // Journal d'activité
      await pool.query(
        "INSERT INTO journal_activites (sadmin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)",
        [
          req.user.id,
          "modification_password",
          "Modification du mot de passworde super admin",
          "sadmin",
          req.user.id,
        ]
      );
    } else {
      // Employé régulier
      const employe = await pool.query(
        "SELECT * FROM employes WHERE employe_id = $1 AND tenant_id = $2",
        [req.user.id, req.user.tenantId]
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
        "UPDATE employes SET password = $1 WHERE employe_id = $2 AND tenant_id = $3",
        [hashedpassword, req.user.id, req.user.tenantId]
      );

      // Journal d'activité
      await pool.query(
        "INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          req.user.tenantId,
          req.user.id,
          "modification_password",
          "Modification du mot de passworde employé",
          "employes",
          req.user.id,
        ]
      );
    }

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
  registerTenant,
  registerTenantAdmin,
  login,
  sadminLogin,
  logout,
  getProfile,
  createsadmin,
  changepassword,
  refreshToken,
};