# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy built React app from builder
COPY --from=builder /app/build ./build

# Copy server code and node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules

# Expose port
EXPOSE 3001

# Start Express server
CMD ["node", "server/index.js"]
