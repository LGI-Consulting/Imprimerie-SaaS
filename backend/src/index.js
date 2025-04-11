import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
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
import remiseRoutes from './routes/remise.routes.js';
import { swaggerUi, specs } from './config/swagger.js';

/**
const materiauRoutes = require('./routes/materiau.routes');
const paiementRoutes = require('./routes/paiement.routes');
*/
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cookieParser());
app.use(helmet()); // Sécurité
app.use(cors());   // Gestion des CORS
app.use(express.json()); // Parsing du JSON
app.use(express.urlencoded({ extended: true })); // Parsing des URL encodées

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/materiaux', materiauRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/remise', remiseRoutes);
/**
*/

// Route de base
app.use('/', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});