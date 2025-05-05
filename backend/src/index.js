import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';

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
import filesRoutes from './routes/files.routes.js';
//import { swaggerUi, specs } from './config/swagger.js';

/**
const materiauRoutes = require('./routes/materiau.routes');
const paiementRoutes = require('./routes/paiement.routes');
*/
const app = express();
const PORT = process.env.PORT;

// Configuration CORS plus permissive pour les ressources statiques
const corsOptions = {
  origin: 'http://localhost:3000', // Votre frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Appliquer CORS
app.use(cors(corsOptions));

// Pour les routes de fichiers spécifiquement, permettre l'accès aux ressources
app.use('/api/files/:fileId/preview', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Middlewares
app.use(cookieParser());
app.use(helmet()); // Sécurité
app.use(express.json({ limit: '10gb' })); // Parsing du JSON
app.use(express.urlencoded({ extended: true, limit: '10gb' })); // Parsing des URL encodées

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/materiaux', materiauRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/employe', employeRoutes);
app.use('/api/remises', remiseRoutes);
app.use('/api/files', filesRoutes);
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
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Augmenter le timeout à 30 minutes (1800000 ms)
server.timeout = 1800000;
