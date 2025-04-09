# Use official Node.js image (matches version in your compose)
FROM node:23.7.0

# Set working directory (matches compose volume mount)
WORKDIR /src

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including dev dependencies for development)
RUN npm install

# Copy all files (exclude node_modules via .dockerignore)
COPY . .

# Expose the port (matches compose port mapping)
EXPOSE 5000

# Use the same command as in compose (development mode)
CMD ["npm", "run", "dev"]