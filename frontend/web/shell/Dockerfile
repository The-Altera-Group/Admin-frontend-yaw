# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY ../../package*.json ./
COPY ../../web/package*.json ./web/

# Copy shell app files
COPY package*.json ./shell/
COPY . ./shell/

# Install dependencies (from root for workspaces)
WORKDIR /app
RUN npm install

# Build the shell application
WORKDIR /app/shell
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/shell/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
