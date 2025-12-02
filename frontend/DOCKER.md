# Docker Setup for Altera System Frontend

This document provides instructions for building and running the Altera System frontend applications using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- 10GB of free disk space

## Quick Start

### Build and Start All Applications

```bash
# From the frontend directory
docker-compose up --build
```

This will build and start all applications:
- Shell (Container App) - http://localhost:5000
- Teacher Web App - http://localhost:5001
- Admin Web App - http://localhost:5002
- Parent Mobile App - http://localhost:19000 (Expo DevTools)

### Start in Detached Mode

```bash
docker-compose up -d
```

### Stop All Applications

```bash
docker-compose down
```

## Individual Application Commands

### Build Individual Applications

```bash
# Shell application
docker build -t altera-shell -f web/shell/Dockerfile .

# Teacher web app
docker build -t altera-teacher-web-app -f web/apps/teacher-web-app/Dockerfile .

# Admin web app
docker build -t altera-admin-web-app -f web/apps/admin-web-app/Dockerfile .

# Parent mobile app
docker build -t altera-parent-mobile-app -f mobile/parent/Dockerfile ./mobile/parent
```

### Run Individual Containers

```bash
# Shell (depends on teacher and admin apps)
docker run -p 5000:5000 --name altera-shell altera-shell

# Teacher web app
docker run -p 5001:5001 --name altera-teacher-web-app altera-teacher-web-app

# Admin web app
docker run -p 5002:5002 --name altera-admin-web-app altera-admin-web-app

# Parent mobile app
docker run -p 8081:8081 -p 19000:19000 --name altera-parent-mobile-app altera-parent-mobile-app
```

## Architecture Overview

### Web Applications (Vite + React + Nginx)

The web applications use a **multi-stage build**:

1. **Build Stage**:
   - Uses Node.js 18 Alpine image
   - Installs dependencies via npm workspaces
   - Builds the application using Vite

2. **Production Stage**:
   - Uses Nginx Alpine image
   - Serves static files from the build output
   - Configured for SPA routing

### Mobile Application (Expo/React Native)

The mobile application Dockerfile:
- Uses Node.js 18 Alpine image
- Installs Expo CLI globally
- Runs Expo development server
- Exposes ports for Metro bundler and Expo DevTools

## Port Configuration

| Application | Port | Description |
|-------------|------|-------------|
| Shell | 5000 | Main container application |
| Teacher Web App | 5001 | Teacher portal microfrontend |
| Admin Web App | 5002 | Admin portal microfrontend |
| Mobile App (Metro) | 8081 | React Native Metro bundler |
| Mobile App (Expo) | 19000 | Expo DevTools |
| Mobile App (iOS) | 19001 | Expo iOS connection |
| Mobile App (Android) | 19002 | Expo Android connection |

## Module Federation Configuration

The shell application uses Module Federation to load remote microfrontends. Ensure the following:

1. **Teacher and Admin apps must start before Shell**
   - Docker Compose handles this with `depends_on`

2. **Remote URLs in shell/vite.config.js**:
   ```javascript
   remotes: {
     teacher: 'http://localhost:5001/assets/remoteEntry.js',
     admin: 'http://localhost:5002/assets/remoteEntry.js',
   }
   ```

For production, update these URLs to point to your deployed microfrontends.

## Development vs Production

### Development
- Use `docker-compose up` for local development
- Mobile app runs in development mode with hot reload
- Volume mounts enable code changes without rebuilding

### Production
- Update Module Federation remote URLs
- Configure environment variables
- Use orchestration platforms (Kubernetes, ECS, etc.)
- Set up proper CI/CD pipelines

## Troubleshooting

### Build Failures

**Problem**: `npm install` fails
```bash
# Clear Docker cache and rebuild
docker-compose build --no-cache
```

**Problem**: Workspace dependencies not found
```bash
# Ensure you're building from the correct context (frontend root)
docker build -t app-name -f path/to/Dockerfile .
```

### Runtime Issues

**Problem**: Module Federation remotes not loading
- Ensure teacher-web-app and admin-web-app are running
- Check network connectivity between containers
- Verify remote URLs in vite.config.js

**Problem**: Nginx 404 errors
- Check nginx.conf configuration
- Verify dist folder contains built files
- Check nginx logs: `docker logs altera-shell`

### Mobile App Issues

**Problem**: Expo DevTools not accessible
```bash
# Ensure ports are properly mapped
docker-compose ps
```

**Problem**: Metro bundler connection issues
- Check EXPO_DEVTOOLS_LISTEN_ADDRESS is set to 0.0.0.0
- Verify ports 8081, 19000-19002 are not in use

## Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs shell
docker-compose logs teacher-web-app
```

## Cleanup

### Remove Containers
```bash
docker-compose down
```

### Remove Containers and Volumes
```bash
docker-compose down -v
```

### Remove Images
```bash
docker rmi altera-shell altera-teacher-web-app altera-admin-web-app altera-parent-mobile-app
```

### Complete Cleanup
```bash
# Remove all stopped containers, networks, and images
docker system prune -a
```

## Environment Variables

Create a `.env` file in the frontend directory for environment-specific configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Module Federation URLs (Production)
VITE_TEACHER_REMOTE_URL=https://teacher.altera-system.com/assets/remoteEntry.js
VITE_ADMIN_REMOTE_URL=https://admin.altera-system.com/assets/remoteEntry.js
```

## Best Practices

1. **Use .dockerignore**: Already configured to exclude node_modules, build outputs, etc.
2. **Multi-stage builds**: Keeps production images small
3. **Layer caching**: Copy package.json first to cache dependencies
4. **Security**: Nginx includes security headers
5. **Health checks**: Consider adding health check endpoints

## Next Steps

1. Set up CI/CD pipelines for automated builds
2. Configure environment-specific docker-compose files
3. Implement health checks and monitoring
4. Set up container registry for image storage
5. Configure production orchestration (Kubernetes/ECS)

## Support

For issues related to Docker setup, please check:
- Docker documentation: https://docs.docker.com
- Vite deployment: https://vitejs.dev/guide/static-deploy.html
- Module Federation: https://github.com/originjs/vite-plugin-federation
