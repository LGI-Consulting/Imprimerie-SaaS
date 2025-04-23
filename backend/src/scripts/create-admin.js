import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

dotenv.config();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT * FROM employes WHERE email = $1",
      [process.env.DEFAULT_ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, salt);

    // Create admin user
    const result = await pool.query(
      "INSERT INTO employes (nom, prenom, email, telephone, role, password, date_embauche, est_actif) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        process.env.DEFAULT_ADMIN_NOM,
        process.env.DEFAULT_ADMIN_PRENOM,
        process.env.DEFAULT_ADMIN_EMAIL,
        process.env.DEFAULT_ADMIN_TELEPHONE,
        process.env.DEFAULT_ADMIN_ROLE,
        hashedPassword,
        new Date().toISOString().split('T')[0],
        true
      ]
    );

    console.log('Admin user created successfully:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 