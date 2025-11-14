# Deployment Guide

This guide covers deployment options for the Altera School Management System.

## Prerequisites

- Docker and Docker Compose
- Node.js 16+ and pnpm
- Java 17+ and Maven
- MySQL 8.0+

## Local Development Setup

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Altera-System
pnpm install
```

### 2. Database Setup
```bash
# Start PostgreSQL with Docker
docker run -d \
  --name altera-postgresql \
  -e POSTGRES_DB=altera_school_db \
  -e POSTGRES_USER=altera_user \
  -e POSTGRES_PASSWORD=altera_password \
  -p 5432:5432 \
  postgres:15
```

### 3. Backend Services
```bash
cd services/school-springboot
mvn clean install
mvn spring-boot:run
```

### 4. Frontend Applications
```bash
# Teacher Portal
cd apps/teacher-portal
npm run dev

# Admin Portal
cd apps/admin-portal
npm run dev

# Parent Mobile App
cd apps/parent-app
npm start
```

## Docker Deployment

### Using Docker Compose
```bash
cd infrastructure/docker
docker-compose up -d
```

This will start:
- MySQL database
- All Spring Boot microservices
- Frontend applications
- Service discovery (Eureka)

### Individual Service Deployment
```bash
# Build and run specific service
cd services/school-springboot/auth-service
docker build -t altera/auth-service .
docker run -p 8081:8081 altera/auth-service
```

## Production Deployment

### AWS Deployment with Terraform

1. **Setup AWS Credentials**
```bash
aws configure
```

2. **Deploy Infrastructure**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

3. **Deploy Services to ECS**
```bash
# Build and push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push each service
docker build -t altera/auth-service services/school-springboot/auth-service
docker tag altera/auth-service:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/altera/auth-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/altera/auth-service:latest
```

### Kubernetes Deployment

1. **Setup Kubernetes Cluster**
```bash
# For AWS EKS
eksctl create cluster --name altera-cluster --region us-east-1
```

2. **Deploy Applications**
```bash
cd infrastructure/kubernetes
kubectl apply -f namespace.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f auth-service-deployment.yaml
# ... other services
```

3. **Setup Ingress**
```bash
kubectl apply -f ingress.yaml
```

## Environment Configuration

### Development (.env.local)
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=altera_school_db
DB_USERNAME=altera_user
DB_PASSWORD=altera_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# API URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080
```

### Production
```
# Database (RDS)
DB_HOST=altera-db.cluster-xyz.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=altera_school_db
DB_USERNAME=postgres
DB_PASSWORD=<secure-password>

# JWT
JWT_SECRET=<secure-random-key>
JWT_EXPIRATION=86400000

# API URLs
NEXT_PUBLIC_API_BASE_URL=https://api.altera-school.com
VITE_API_BASE_URL=https://api.altera-school.com
```

## Monitoring and Logging

### Health Checks
- Spring Boot Actuator: `http://localhost:8080/actuator/health`
- Database: `http://localhost:8080/actuator/health/db`

### Logs
```bash
# Docker logs
docker logs altera-auth-service

# Kubernetes logs
kubectl logs -f deployment/auth-service -n altera-system
```

### Metrics
- Prometheus metrics: `http://localhost:8080/actuator/prometheus`
- Grafana dashboard: `http://localhost:3000`

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U altera_user -d altera_school_db > backup.sql

# Restore
psql -h localhost -U altera_user -d altera_school_db < backup.sql
```

### Application Data
- Configuration files backup
- User uploaded files backup
- Log files archival

## Troubleshooting

### Common Issues

1. **Service Discovery Issues**
   - Check Eureka server status
   - Verify service registration

2. **Database Connection**
   - Verify database credentials
   - Check network connectivity

3. **Authentication Issues**
   - Verify JWT secret configuration
   - Check token expiration settings

### Debug Commands
```bash
# Check service status
docker ps
kubectl get pods -n altera-system

# View logs
docker logs <container-name>
kubectl logs <pod-name> -n altera-system

# Database connection test
psql -h <host> -U <user> -d <database>
```
