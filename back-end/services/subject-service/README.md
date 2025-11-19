# Subject Service

This service manages subjects and curriculum in the Altera School Management System.

## Features
- Subject creation and management
- Curriculum planning and structure
- Subject-grade level mapping
- Learning objectives tracking
- Subject prerequisites management
- Syllabus and content organization
- Subject-teacher assignments

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL

## API Endpoints
- GET /subjects
- POST /subjects
- PUT /subjects/{id}
- DELETE /subjects/{id}
- GET /subjects/grade/{gradeLevel}
- GET /subjects/{id}/curriculum
- POST /subjects/{id}/teachers/{teacherId}
- GET /subjects/{id}/prerequisites
