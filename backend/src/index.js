import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import multer from 'multer';


dotenv.config();

// Importation de la base de donnees
import pool from './config/db.js';

// Importation des routes
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import commandeRoutes from './routes/commande.routes.js';
import materiauRoutes from './routes/materiau.routes.js';
import paiementRoutes from './routes/paiement.routes.js';
import employeRoutes from './routes/employe.routes.js';
import remiseRoutes from './routes/remise.routes.js';
//import { swaggerUi, specs } from './config/swagger.js';

/**
const materiauRoutes = require('./routes/materiau.routes');
const paiementRoutes = require('./routes/paiement.routes');
*/
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cookieParser());
app.use(helmet()); // Sécurité
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // Parsing du JSON
app.use(express.urlencoded({ extended: true })); // Parsing des URL encodées


// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Les fichiers seront stockés dans le dossier 'uploads'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Renommer le fichier pour éviter les conflits
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/materiaux', materiauRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/employe', employeRoutes);
app.use('/api/remises', remiseRoutes);


// Route de base

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});