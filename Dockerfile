# Stage 1: Build Frontend
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files (explicitly copying package-lock.json is safer)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend application
# Note: VITE_BOT_TOKEN is NO LONGER passed here for security.
RUN npm run build

# Stage 2: Serve with Node.js Backend
FROM node:18-alpine

WORKDIR /app

# Copy package files (we need express dependencies)
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy build artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend server code
COPY server.js .

EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]
