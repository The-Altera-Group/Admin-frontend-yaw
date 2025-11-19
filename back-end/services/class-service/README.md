# Class Service

This service manages class structure and timetables in the Altera School Management System.

## Features
- Class creation and management
- Class structure organization (grades, sections)
- Student enrollment in classes
- Teacher-class assignments
- Classroom allocation
- Class capacity management
- Academic year and term management

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL

## API Endpoints
- GET /classes
- POST /classes
- PUT /classes/{id}
- DELETE /classes/{id}
- GET /classes/{id}/students
- POST /classes/{id}/students/{studentId}
- GET /classes/{id}/teachers
- POST /classes/{id}/teachers/{teacherId}
- GET /classes/grade/{gradeLevel}
