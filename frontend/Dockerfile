# Use official Node.js image (can use LTS version for frontend)
FROM node:20

# Set working directory (matches compose volume mount)
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy all files
COPY . .

# Expose port (matches Next.js default)
EXPOSE 3000

# Start development server (matches compose command)
CMD ["npm", "run", "dev"]