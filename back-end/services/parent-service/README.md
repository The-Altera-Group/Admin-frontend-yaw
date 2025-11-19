# Parent Service

This service manages parent accounts, profiles, and relationships with students in the Altera School Management System.

## Features
- Parent registration and profile management
- Parent-student relationship mapping
- Parent account authentication integration
- Parent communication preferences
- Emergency contact management
- Family structure management

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL

## API Endpoints
- GET /parents
- POST /parents
- PUT /parents/{id}
- DELETE /parents/{id}
- GET /parents/{id}/children
- POST /parents/{id}/children/{studentId}
- DELETE /parents/{parentId}/children/{studentId}
- GET /parents/{id}/profile
