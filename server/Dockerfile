# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown -R node:node logs

# Switch to non-root user
USER node

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "dist/index.js"]
