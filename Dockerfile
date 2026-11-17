# ==============================================================
# Multi-Stage Production Dockerfile for ERP Purchase System
# ==============================================================

# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets to production dist directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose ERP Web & API Port
EXPOSE 5000

# Start unified server
CMD ["node", "backend/server.js"]
