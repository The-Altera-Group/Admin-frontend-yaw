# Altera School Management System - Spring Boot Backend

This is the backend microservices architecture for the Altera School Management System built with Spring Boot.

## Architecture

The system is composed of the following microservices:

- **auth-service**: Authentication & Authorization
- **student-service**: Student Management (CRUD, profiles, promotion)
- **teacher-service**: Teacher Management (CRUD, assignments, profiles)
- **parent-service**: Parent Management (accounts, profiles, relationships)
- **attendance-service**: Attendance Tracking (students & teachers)
- **grade-service**: Gradebook & Academic Performance
- **assignment-service**: Homework & Assignments Management
- **subject-service**: Subject & Curriculum Management
- **class-service**: Class Management (structure, timetables)
- **admission-service**: Admission Processing & Applications
- **fee-service**: Fee Management & Payment Tracking
- **event-service**: School Events & Calendar Management
- **notification-service**: Push Notifications & Alerts
- **messaging-service**: Direct Messaging & Communication
- **document-service**: File Management & Document Storage
- **leave-service**: Leave Management (teachers)
- **report-service**: Progress Reports & Analytics
- **timetable-service**: Class Schedules & Timetables
- **course-service**: Course Management (legacy/compatibility)

## Technologies Used

- Spring Boot 3.1.0
- Spring Security
- Spring Data JPA
- Spring Cloud (Eureka for service discovery)
- PostgreSQL Database
- JWT for authentication
- Maven for build management

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 15+

### Running the Services

1. Start PostgreSQL database
2. Update database configuration in `config/application.properties`
3. Run each service individually or use the parent POM to build all services

```bash
mvn clean install
mvn spring-boot:run
```

## API Documentation

Each service provides its own REST API. Refer to individual service README files for detailed API documentation.

## Configuration

All configuration files are located in the `config/` directory. Update the `application.properties` file with your environment-specific settings.
