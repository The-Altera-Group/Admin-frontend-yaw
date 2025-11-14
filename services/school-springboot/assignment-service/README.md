# Assignment Service

This service manages homework, assignments, and project management in the Altera School Management System.

## Features
- Assignment creation and management
- Homework distribution and collection
- Assignment submission tracking
- Due date management and reminders
- Grading integration with grade-service
- Assignment templates and reusability
- File attachments and resources

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- File Storage Integration

## API Endpoints
- GET /assignments
- POST /assignments
- PUT /assignments/{id}
- DELETE /assignments/{id}
- GET /assignments/class/{classId}
- GET /assignments/teacher/{teacherId}
- POST /assignments/{id}/submit
- GET /assignments/{id}/submissions
- PUT /assignments/{id}/grade
