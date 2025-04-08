const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Importation de la base de donnees
const { pool } = require('./config/db')
/** 
// Importation des routes
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const commandeRoutes = require('./routes/commande.routes');
const materiauRoutes = require('./routes/materiau.routes');
const paiementRoutes = require('./routes/paiement.routes');
*/
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Sécurité
app.use(cors());   // Gestion des CORS
app.use(express.json()); // Parsing du JSON
app.use(express.urlencoded({ extended: true })); // Parsing des URL encodées

// Dossier statique pour les uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/** 
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/materiaux', materiauRoutes);
app.use('/api/paiements', paiementRoutes);
*/

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de gestion des commandes d\'impression' });
});

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