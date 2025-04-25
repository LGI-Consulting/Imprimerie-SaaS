import pkg  from 'pg';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.DB_USER, process.env.DB_HOST, process.env.DB_PASSWORD, process.env.DB_NAME, process.env.DB_PORT)

const pool = new pkg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test de la connexion à la base de données
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connexion à la base de données établie avec succès à:', res.rows[0].now);
  }
});

export default pool