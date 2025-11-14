# Grade Service

This service manages grades and report cards in the Altera School Management System.

## Features
- Grade recording and management
- Report card generation
- Grade analytics
- Performance tracking
- Parent notifications

## Technologies
- Spring Boot
- Spring Data JPA
- MySQL/PostgreSQL
- JasperReports (for report generation)

## API Endpoints
- POST /grades
- GET /grades/student/{id}
- GET /grades/course/{id}
- GET /report-cards/{studentId}
- PUT /grades/{id}
