# Use the official Node.js v23 image
FROM node:23.7.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all remaining source files
COPY . .

# Expose the correct port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

