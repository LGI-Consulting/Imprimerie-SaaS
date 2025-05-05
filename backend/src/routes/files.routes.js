import express from "express";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Endpoint pour télécharger un fichier
router.get("/:fileId/download", checkRole(["accueil", "admin", "graphiste"]), async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Récupérer les informations du fichier depuis la base de données
    const { rows } = await pool.query(
      "SELECT * FROM print_files WHERE print_file_id = $1",
      [fileId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }
    
    const fileInfo = rows[0];
    const filePath = path.resolve(fileInfo.file_path);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier non trouvé sur le serveur" });
    }
    
    // Envoyer le fichier
    res.download(filePath, fileInfo.file_name);
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error);
    res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
  }
});

// Endpoint pour prévisualiser un fichier
router.get("/:fileId/preview", checkRole(["accueil", "admin", "graphiste"]), async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Configurer les en-têtes CORS pour cette route spécifique
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Récupérer les informations du fichier depuis la base de données
    const { rows } = await pool.query(
      "SELECT * FROM print_files WHERE print_file_id = $1",
      [fileId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }
    
    const fileInfo = rows[0];
    const filePath = path.resolve(fileInfo.file_path);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier non trouvé sur le serveur" });
    }
    
    // Définir le type MIME
    if (fileInfo.mime_type) {
      res.setHeader("Content-Type", fileInfo.mime_type);
    }
    
    // Envoyer le fichier
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Erreur lors de la prévisualisation du fichier:", error);
    res.status(500).json({ message: "Erreur lors de la prévisualisation du fichier" });
  }
});

export default router;
