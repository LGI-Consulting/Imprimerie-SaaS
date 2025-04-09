import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from '../config/db.js';

dotenv.config();

/**
 * Middleware pour vérifier le token JWT et authentifier l'utilisateur
 */
const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Un token est requis pour l'authentification",
    });
  }
  
  try {
    // Enlever le préfixe 'Bearer ' si présent
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
    
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }
};

/**
 * Middleware pour vérifier les rôles utilisateur
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Utilisateur non authentifié",
      });
    }
    
    // Pour les super admins (ils ont un type spécial, pas un rôle)
    if (req.user.type === 'superAdmin') {
      return next();
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Vous n'avez pas les droits suffisants pour accéder à cette ressource",
      });
    }
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est un super admin
 */
const checkSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Utilisateur non authentifié",
    });
  }
  
  if (req.user.type === 'superAdmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Accès réservé aux super administrateurs",
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est un admin de tenant
 */
const checkTenantAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Utilisateur non authentifié",
    });
  }
  
  if (req.user.type === 'superAdmin' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Accès réservé aux administrateurs",
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur appartient au bon tenant
 */
const checkTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Utilisateur non authentifié",
    });
  }
  
  // Les super admins ont accès à tous les tenants
  if (req.user.type === 'superAdmin') {
    return next();
  }
  
  // Si un tenant_id est spécifié dans la requête, vérifier qu'il correspond
  const requestTenantId = req.params.tenant_id || req.body.tenant_id;
  
  if (requestTenantId && parseInt(requestTenantId) !== req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Vous n'avez pas accès aux données de cette entreprise",
    });
  }
  
  next();
};

export {
  verifyToken,
  checkRole,
  checkSuperAdmin,
  checkTenantAdmin,
  checkTenantAccess
};