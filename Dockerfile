# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy environment file
COPY .env.example ./.env

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 