# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY ../../../../package*.json ./
COPY ../../package*.json ./web/

# Copy admin app files
COPY package*.json ./web/apps/admin-web-app/
COPY . ./web/apps/admin-web-app/

# Install dependencies (from root for workspaces)
WORKDIR /app
RUN npm install

# Build the admin application
WORKDIR /app/web/apps/admin-web-app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/web/apps/admin-web-app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5002

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
