# Imprimerie SaaS

A comprehensive printing business management system.

## Setup Instructions

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the backend directory with the following variables:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=imprimerie_saas
   DB_USER=postgres
   DB_PASSWORD=postgres

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_SECRET_REFRESH=your_jwt_refresh_secret_key_here
   JWT_EXPIRATION=15m

   # Default Admin User
   DEFAULT_ADMIN_EMAIL=admin@imprimerie.com
   DEFAULT_ADMIN_PASSWORD=Admin123!
   DEFAULT_ADMIN_NOM=Admin
   DEFAULT_ADMIN_PRENOM=System
   DEFAULT_ADMIN_ROLE=admin
   DEFAULT_ADMIN_TELEPHONE=+33600000000
   ```

3. Create the database and run migrations (if applicable)

4. Create the default admin user:
   ```bash
   npm run create-admin
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env.local` file in the frontend directory with the following variables:
   ```
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Authentication

The system uses a token-based authentication system. The default admin user is created during setup and can be used to log in to the system. Only administrators can create new users.

### Default Admin Credentials

- Email: admin@imprimerie.com
- Password: Admin123!

**Note:** Change these credentials in production!
