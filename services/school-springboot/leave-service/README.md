# Leave Service

This service manages leave management for teachers and staff in the Altera School Management System.

## Features
- Leave application submission
- Leave approval workflow
- Leave balance tracking
- Leave calendar and scheduling
- Substitute teacher assignment
- Leave policy management
- Leave reports and analytics
- Emergency leave handling
- Leave notifications

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Workflow Engine Integration

## API Endpoints
- GET /leave/applications
- POST /leave/apply
- PUT /leave/{id}/approve
- PUT /leave/{id}/reject
- GET /leave/balance/{teacherId}
- GET /leave/calendar/{teacherId}
- POST /leave/{id}/substitute
- GET /leave/reports
- GET /leave/policies
