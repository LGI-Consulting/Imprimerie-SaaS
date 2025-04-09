import * as bc from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enregistrement d'un nouvel employé par un admin de tenant
 */
async function register(req, res) {
  try {
    const { nom, prenom, email, telephone, role, mot_de_passe, date_embauche } = req.body;
    const tenantId = req.user.tenantId; // Obtenu du token JWT

    // Vérifier si l'employé existe déjà dans ce tenant
    const existingUser = await pool.query(
      'SELECT * FROM employes WHERE email = $1 AND tenant_id = $2', 
      [email, tenantId]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà dans votre entreprise'
      });
    }

    // Hasher le mot de passe
    const salt = await bc.genSalt(10);
    const hashedPassword = await bc.hash(mot_de_passe, salt);

    // Insérer le nouvel employé avec le tenant_id
    const result = await pool.query(
      'INSERT INTO employes (tenant_id, nom, prenom, email, telephone, role, mot_de_passe, date_embauche) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [tenantId, nom, prenom, email, telephone, role, hashedPassword, date_embauche]
    );

    // Journal d'activité
    await pool.query(
      'INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        tenantId,
        req.user.id,
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
 * Enregistrement d'un nouveau tenant par un super admin
 */
async function registerTenant(req, res) {
  try {
    const { nom, description, adresse, telephone, email, logoUrl } = req.body;
    
    // Créer le nouveau tenant
    const tenantResult = await pool.query(
      'INSERT INTO tenants (nom, description, adresse, telephone, email, logo_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nom, description, adresse, telephone, email, logoUrl]
    );
    
    const newTenant = tenantResult.rows[0];
    
    // Journal d'activité pour le super admin
    await pool.query(
      'INSERT INTO journal_activites (super_admin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.id,
        'création_tenant',
        `Création du tenant "${nom}"`,
        'tenants',
        newTenant.tenant_id
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Nouvelle entreprise créée avec succès',
      data: newTenant
    });
  } catch (error) {
    console.error('Erreur lors de la création du tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'entreprise',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Enregistrement du premier admin d'un tenant par un super admin
 */
async function registerTenantAdmin(req, res) {
  try {
    const { tenant_id, nom, prenom, email, telephone, mot_de_passe, date_embauche } = req.body;
    
    // Vérifier si le tenant existe
    const tenantCheck = await pool.query('SELECT * FROM tenants WHERE tenant_id = $1', [tenant_id]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'L\'entreprise spécifiée n\'existe pas'
      });
    }
    
    // Vérifier si l'employé existe déjà dans ce tenant
    const existingUser = await pool.query(
      'SELECT * FROM employes WHERE email = $1 AND tenant_id = $2', 
      [email, tenant_id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà dans cette entreprise'
      });
    }

    // Hasher le mot de passe
    const salt = await bc.genSalt(10);
    const hashedPassword = await bc.hash(mot_de_passe, salt);

    // Insérer le nouvel admin avec le role 'admin'
    const result = await pool.query(
      'INSERT INTO employes (tenant_id, nom, prenom, email, telephone, role, mot_de_passe, date_embauche) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [tenant_id, nom, prenom, email, telephone, 'admin', hashedPassword, date_embauche]
    );

    // Journal d'activité
    await pool.query(
      'INSERT INTO journal_activites (super_admin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.id,
        'création_admin_tenant',
        `Création du compte admin pour ${nom} ${prenom} dans l'entreprise ID ${tenant_id}`,
        'employes',
        result.rows[0].employe_id
      ]
    );

    // Ne pas renvoyer le mot de passe dans la réponse
    const { mot_de_passe: _, ...newAdmin } = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Administrateur de l\'entreprise créé avec succès',
      data: newAdmin
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'administrateur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Connexion d'un employé
 */
async function login(req, res) {
  try {
    const { email, mot_de_passe, tenant_id } = req.body;

    // Vérifier si l'identifiant du tenant est fourni
    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'L\'identifiant de l\'entreprise est requis'
      });
    }

    // Vérifier si l'employé existe dans ce tenant
    const result = await pool.query(
      'SELECT * FROM employes WHERE email = $1 AND tenant_id = $2', 
      [email, tenant_id]
    );
    
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

    // Vérifier si le tenant est actif
    const tenantStatus = await pool.query('SELECT est_actif FROM tenants WHERE tenant_id = $1', [tenant_id]);
    if (!tenantStatus.rows[0].est_actif) {
      return res.status(403).json({
        success: false,
        message: 'Cette entreprise est actuellement désactivée'
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
        role: employee.role,
        tenantId: employee.tenant_id,
        type: 'employee'
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
      'INSERT INTO sessions_utilisateurs (tenant_id, employe_id, token_jwt, date_expiration, adresse_ip, appareil) VALUES ($1, $2, $3, $4, $5, $6)',
      [tenant_id, employee.employe_id, token, expirationDate, ip, userAgent]
    );

    // Journal d'activité
    await pool.query(
      'INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        tenant_id,
        employee.employe_id,
        'connexion',
        `Connexion depuis ${ip}`,
        'employes',
        employee.employe_id
      ]
    );

    // Récupérer le nom du tenant
    const tenantInfo = await pool.query('SELECT nom FROM tenants WHERE tenant_id = $1', [tenant_id]);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        id: employee.employe_id,
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        role: employee.role,
        tenant_id: employee.tenant_id,
        tenant_nom: tenantInfo.rows[0].nom
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
 * Connexion d'un super admin
 */
async function superAdminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Vérifier si le super admin existe
    const result = await pool.query('SELECT * FROM super_admin WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const admin = result.rows[0];

    // Vérifier si le compte est actif
    if (!admin.statut) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte a été désactivé'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bc.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      {
        id: admin.admin_id,
        email: admin.email,
        type: 'superAdmin'
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
    expirationDate.setHours(expirationDate.getHours() + 24);

    await pool.query(
      'INSERT INTO sessions_utilisateurs (super_admin_id, token_jwt, date_expiration, adresse_ip, appareil) VALUES ($1, $2, $3, $4, $5)',
      [admin.admin_id, token, expirationDate, ip, userAgent]
    );

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE super_admin SET derniere_connexion = CURRENT_TIMESTAMP WHERE admin_id = $1',
      [admin.admin_id]
    );

    // Journal d'activité
    await pool.query(
      'INSERT INTO journal_activites (super_admin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
      [
        admin.admin_id,
        'connexion_super_admin',
        `Connexion depuis ${ip}`,
        'super_admin',
        admin.admin_id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Connexion super admin réussie',
      data: {
        token,
        id: admin.admin_id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        type: 'superAdmin'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Déconnexion d'un utilisateur (employé ou super admin)
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
      if (req.user.type === 'superAdmin') {
        await pool.query(
          'INSERT INTO journal_activites (super_admin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
          [
            req.user.id,
            'déconnexion',
            'Déconnexion super admin',
            'super_admin',
            req.user.id
          ]
        );
      } else {
        await pool.query(
          'INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            req.user.tenantId,
            req.user.id,
            'déconnexion',
            'Déconnexion employé',
            'employes',
            req.user.id
          ]
        );
      }
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
    // Vérifier le type d'utilisateur
    if (req.user.type === 'superAdmin') {
      const result = await pool.query(
        'SELECT admin_id, nom, prenom, email, date_creation, derniere_connexion, statut FROM super_admin WHERE admin_id = $1', 
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Profil non trouvé'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...result.rows[0],
          type: 'superAdmin'
        }
      });
    } else {
      // Employé régulier
      const result = await pool.query(
        'SELECT e.employe_id, e.nom, e.prenom, e.email, e.telephone, e.role, e.date_embauche, e.est_actif, t.nom as tenant_nom ' +
        'FROM employes e ' +
        'JOIN tenants t ON e.tenant_id = t.tenant_id ' +
        'WHERE e.employe_id = $1 AND e.tenant_id = $2', 
        [req.user.id, req.user.tenantId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Profil non trouvé'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...result.rows[0],
          type: 'employee'
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Création d'un super admin (réservé au premier super admin)
 */
async function createSuperAdmin(req, res) {
  try {
    const { nom, prenom, email, password } = req.body;
    
    // Vérifier si un super admin existe déjà
    const adminCount = await pool.query('SELECT COUNT(*) FROM super_admin');
    const isSuperAdmin = req.user && req.user.type === 'superAdmin';
    
    // Si c'est le premier super admin, ou si la requête vient d'un super admin existant
    if (adminCount.rows[0].count === '0' || isSuperAdmin) {
      // Vérifier si l'email existe déjà
      const existingAdmin = await pool.query('SELECT * FROM super_admin WHERE email = $1', [email]);
      if (existingAdmin.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Un super admin avec cet email existe déjà'
        });
      }
      
      // Hasher le mot de passe
      const salt = await bc.genSalt(10);
      const hashedPassword = await bc.hash(password, salt);
      
      // Créer le super admin
      const result = await pool.query(
        'INSERT INTO super_admin (nom, prenom, email, password) VALUES ($1, $2, $3, $4) RETURNING admin_id, nom, prenom, email, date_creation',
        [nom, prenom, email, hashedPassword]
      );
      
      // Journal d'activité si c'est un super admin existant qui crée
      if (isSuperAdmin) {
        await pool.query(
          'INSERT INTO journal_activites (super_admin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
          [
            req.user.id,
            'création_super_admin',
            `Création du super admin ${nom} ${prenom}`,
            'super_admin',
            result.rows[0].admin_id
          ]
        );
      }
      
      // Réponse avec les données du nouveau super admin
      return res.status(201).json({
        success: true,
        message: 'Super admin créé avec succès',
        data: result.rows[0]
      });
    } else {
      // Si ce n'est pas le premier super admin et que la requête ne vient pas d'un super admin
      return res.status(403).json({
        success: false,
        message: 'Opération non autorisée'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création du super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du super admin',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

/**
 * Modification du mot de passe
 */
async function changePassword(req, res) {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    
    if (req.user.type === 'superAdmin') {
      // Récupérer les infos du super admin
      const admin = await pool.query('SELECT * FROM super_admin WHERE admin_id = $1', [req.user.id]);
      
      if (admin.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Super admin non trouvé'
        });
      }
      
      // Vérifier l'ancien mot de passe
      const isPasswordValid = await bc.compare(ancien_mot_de_passe, admin.rows[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Ancien mot de passe incorrect'
        });
      }
      
      // Hasher le nouveau mot de passe
      const salt = await bc.genSalt(10);
      const hashedPassword = await bc.hash(nouveau_mot_de_passe, salt);
      
      // Mettre à jour le mot de passe
      await pool.query(
        'UPDATE super_admin SET password = $1 WHERE admin_id = $2',
        [hashedPassword, req.user.id]
      );
      
      // Journal d'activité
      await pool.query(
        'INSERT INTO journal_activites (super_admin_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5)',
        [
          req.user.id,
          'modification_mot_de_passe',
          'Modification du mot de passe super admin',
          'super_admin',
          req.user.id
        ]
      );
    } else {
      // Employé régulier
      const employe = await pool.query(
        'SELECT * FROM employes WHERE employe_id = $1 AND tenant_id = $2',
        [req.user.id, req.user.tenantId]
      );
      
      if (employe.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }
      
      // Vérifier l'ancien mot de passe
      const isPasswordValid = await bc.compare(ancien_mot_de_passe, employe.rows[0].mot_de_passe);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Ancien mot de passe incorrect'
        });
      }
      
      // Hasher le nouveau mot de passe
      const salt = await bc.genSalt(10);
      const hashedPassword = await bc.hash(nouveau_mot_de_passe, salt);
      
      // Mettre à jour le mot de passe
      await pool.query(
        'UPDATE employes SET mot_de_passe = $1 WHERE employe_id = $2 AND tenant_id = $3',
        [hashedPassword, req.user.id, req.user.tenantId]
      );
      
      // Journal d'activité
      await pool.query(
        'INSERT INTO journal_activites (tenant_id, employe_id, action, details, entite_affectee, entite_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.tenantId,
          req.user.id,
          'modification_mot_de_passe',
          'Modification du mot de passe employé',
          'employes',
          req.user.id
        ]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du mot de passe',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}

export {
  register,
  registerTenant,
  registerTenantAdmin,
  login,
  superAdminLogin,
  logout,
  getProfile,
  createSuperAdmin,
  changePassword
};