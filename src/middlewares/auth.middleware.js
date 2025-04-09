import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message:
          "Vous n'avez pas les droits suffisants pour accéder à cette ressource",
      });
    }
  };
};

export default {
  verifyToken,
  checkRole,
};
