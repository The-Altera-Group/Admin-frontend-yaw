# Altera School Management System

A comprehensive school management system designed to streamline administrative, academic, and communication tasks within a school. Built using a modern monorepo structure with microservices architecture for scalability, maintainability, and modular development.

## Project Structure

├── services/
│   └── school-springboot/       # Spring Boot backend (18 Microservices)
│       ├── auth-service/        # Authentication & Authorization
│       ├── student-service/     # Student Management (CRUD, profiles, promotion)
│       ├── teacher-service/     # Teacher Management (CRUD, assignments, profiles)
│       ├── parent-service/      # Parent Management (accounts, profiles, relationships)
│       ├── attendance-service/  # Attendance Tracking (students & teachers)
│       ├── grade-service/       # Gradebook & Academic Performance
│       ├── assignment-service/  # Homework & Assignments Management
│       ├── subject-service/     # Subject & Curriculum Management
│       ├── class-service/       # Class Management (structure, timetables)
│       ├── admission-service/   # Admission Processing & Applications
│       ├── fee-service/         # Fee Management & Payment Tracking
│       ├── event-service/       # School Events & Calendar Management
│       ├── notification-service/ # Push Notifications & Alerts
│       ├── messaging-service/   # Direct Messaging & Communication
│       ├── document-service/    # File Management & Document Storage
│       ├── leave-service/       # Leave Management (teachers)
│       ├── report-service/      # Progress Reports & Analytics
│       ├── timetable-service/   # Class Schedules & Timetables
│       ├── course-service/      # Course Management (legacy/compatibility)
│       ├── config/              # Configuration files
│       ├── src/                 # Java source code
│       ├── pom.xml              # Maven build configuration
│       └── README.md            # Backend documentation
├── apps/
│   ├── parent-app/              # Mobile app for Parents (React Native)
│   ├── teacher-portal/          # Website for Teachers (Next.js)
│   └── admin-portal/            # Website for Admins (React + Vite)
├── packages/                    # Shared libraries/components
│   ├── ui-components/           # Shared React UI components
│   ├── shared-utils/            # Common utilities and helpers
│   └── api-client/              # Shared API client library
├── infrastructure/              # Deployment and infrastructure configs
│   ├── docker/                  # Docker and Docker Compose files
│   ├── terraform/               # Terraform configurations for AWS
│   └── kubernetes/              # Kubernetes deployment manifests
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   ├── architecture/            # System architecture docs
│   └── deployment/              # Deployment guides
├── package.json                 # Root package.json for monorepo
├── pnpm-workspace.yaml          # pnpm workspace configuration
└── README.md                    # This file
```

## 🚀 Features

### For Students & Parents
- **Academic Progress Tracking**: Real-time access to grades, attendance, and performance analytics
- **Mobile Application**: Native mobile app for parents to stay connected
- **Communication Hub**: Direct messaging with teachers and school administration
- **Digital Report Cards**: Access and download comprehensive academic reports

### For Teachers
- **Class Management**: Organize classes, manage student rosters, and track progress
- **Grade Management**: Efficient grade recording and report generation
- **Attendance Tracking**: Quick and easy attendance marking with analytics
- **Assignment Management**: Create, distribute, and grade assignments digitally

### For Administrators
- **Comprehensive Dashboard**: System-wide analytics and management tools
- **User Management**: Manage students, teachers, and staff accounts
- **Academic Oversight**: Monitor courses, curriculum, and academic performance
- **Financial Management**: Fee tracking, payment processing, and financial reports

## 🛠️ Technology Stack

### Backend (Microservices)
- **Framework**: Spring Boot 3.1 with Java 17
- **Database**: PostgreSQL 15
- **Authentication**: JWT with Spring Security
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Build Tool**: Maven

### Frontend Applications
- **Mobile App**: React Native with Expo
- **Teacher Portal**: Next.js 13 with TypeScript
- **Admin Portal**: React 18 + Vite with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Headless UI
- **State Management**: TanStack Query (React Query)

### Shared Libraries
- **UI Components**: Reusable React components with Storybook
- **Utilities**: Common functions and validation schemas
- **API Client**: Centralized API communication layer

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **Cloud Platform**: AWS (ECS, RDS, ALB, ECR)
- **Infrastructure as Code**: Terraform
- **Package Management**: pnpm workspaces

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+ and pnpm 8+
- Java 17+ and Maven 3.6+
- Docker and Docker Compose
- PostgreSQL 15+

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd Altera-System
pnpm install
```

### 2. Start Database
```bash
docker run -d \
  --name altera-postgresql \
  -e POSTGRES_DB=altera_school_db \
  -e POSTGRES_USER=altera_user \
  -e POSTGRES_PASSWORD=altera_password \
  -p 5432:5432 \
  postgres:15
```

### 3. Start Backend Services
```bash
cd services/school-springboot
mvn clean install
mvn spring-boot:run
```

### 4. Start Frontend Applications
```bash
# In separate terminals:

# Teacher Portal (http://localhost:3000)
pnpm dev:teacher-portal

# Admin Portal (http://localhost:3001)
pnpm dev:admin-portal

# Parent Mobile App
pnpm dev:parent-app
```

### 5. Using Docker (Alternative)
```bash
# Start all services with Docker Compose
pnpm docker:up

# Stop all services
pnpm docker:down
```

## 📚 Documentation

- **[API Documentation](./docs/api/README.md)**: Complete API reference for all services
- **[Architecture Overview](./docs/architecture/system-overview.md)**: System design and architecture details
- **[Deployment Guide](./docs/deployment/README.md)**: Comprehensive deployment instructions
- **[Development Guide](./docs/development/README.md)**: Setup and development workflows

## 🔧 Available Scripts

```bash
# Development
pnpm dev                    # Start all applications in development mode
pnpm dev:teacher-portal     # Start teacher portal only
pnpm dev:admin-portal       # Start admin portal only
pnpm dev:parent-app         # Start mobile app only

# Building
pnpm build                  # Build all applications
pnpm build:apps             # Build frontend applications only
pnpm build:packages         # Build shared packages only
pnpm backend:build          # Build backend services

# Testing & Quality
pnpm test                   # Run all tests
pnpm lint                   # Lint all code
pnpm format                 # Format code with Prettier
pnpm type-check             # TypeScript type checking

# Docker Operations
pnpm docker:build           # Build Docker images
pnpm docker:up              # Start with Docker Compose
pnpm docker:down            # Stop Docker services

# Utilities
pnpm clean                  # Clean all build artifacts and dependencies
```

## 🌐 Service Endpoints

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Main API entry point |
| Auth Service | 8081 | Authentication & authorization |
| Student Service | 8082 | Student management |
| Teacher Service | 8083 | Teacher management |
| Parent Service | 8084 | Parent management |
| Attendance Service | 8085 | Attendance tracking |
| Grade Service | 8086 | Grade & report management |
| Assignment Service | 8087 | Homework & assignments |
| Subject Service | 8088 | Subject & curriculum |
| Class Service | 8089 | Class management |
| Admission Service | 8090 | Admission processing |
| Fee Service | 8091 | Fee management |
| Event Service | 8092 | School events |
| Notification Service | 8093 | Push notifications |
| Messaging Service | 8094 | Direct messaging |
| Document Service | 8095 | File management |
| Leave Service | 8096 | Leave management |
| Report Service | 8097 | Progress reports |
| Timetable Service | 8098 | Class schedules |
| Course Service | 8099 | Course management (legacy) |
| Teacher Portal | 3000 | Next.js web application |
| Admin Portal | 3001 | React admin dashboard |
| Parent Mobile App | Expo | React Native mobile app |

## 🚀 Deployment

### Development Environment
- Local development with Docker Compose
- Hot reloading for all frontend applications
- Automatic service discovery and load balancing

### Production Environment
- AWS ECS for container orchestration
- RDS for managed database
- Application Load Balancer for high availability
- Auto-scaling based on metrics

See the [Deployment Guide](./docs/deployment/README.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Altera Development Team**
- Backend Development: Spring Boot microservices
- Frontend Development: React, React Native, Next.js
- DevOps & Infrastructure: Docker, Kubernetes, AWS, Terraform

## 📞 Support

For support and questions:
- 📧 Email: support@altera-group.com
- 📖 Documentation: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/altera-group/altera-system/issues)

---

**Built with ❤️ by the Altera Team**
