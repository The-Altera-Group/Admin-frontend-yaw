# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY ../../../../package*.json ./
COPY ../../package*.json ./web/

# Copy teacher app files
COPY package*.json ./web/apps/teacher-web-app/
COPY . ./web/apps/teacher-web-app/

# Install dependencies (from root for workspaces)
WORKDIR /app
RUN npm install

# Build the teacher application
WORKDIR /app/web/apps/teacher-web-app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/web/apps/teacher-web-app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
