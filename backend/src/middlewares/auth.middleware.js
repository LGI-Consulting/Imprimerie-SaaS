import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Logger simple
const logAuthError = (message) => {
  fs.appendFileSync("auth-errors.log", `[${new Date().toISOString()}] ${message}\n`);
};

const verifyToken = (req, res, next) => {
  const headerToken = req.headers["x-access-token"] || req.headers["authorization"];
  const cookieToken = req.cookies?.accessToken;
  const token = headerToken || cookieToken;

  if (!token) {
    logAuthError("Token manquant");
    return res.status(403).json({
      success: false,
      message: "Un token est requis pour l'authentification",
    });
  }

  try {
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    logAuthError(`Token invalide : ${err.message}`);
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }
};

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
        message: "Droits insuffisants pour cette ressource",
      });
    }
  };
};

const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Accès réservé aux administrateurs",
    });
  }
  next();
};

export {
  verifyToken,
  checkRole,
  checkAdmin,
};
