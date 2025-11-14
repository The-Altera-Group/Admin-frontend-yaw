# Admission Service

This service manages admission processing and applications in the Altera School Management System.

## Features
- Online admission applications
- Application form management
- Document verification and tracking
- Admission criteria evaluation
- Interview scheduling
- Admission status tracking
- Fee payment integration
- Enrollment confirmation

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- File Storage Integration

## API Endpoints
- GET /admissions
- POST /admissions/apply
- PUT /admissions/{id}
- GET /admissions/{id}/status
- POST /admissions/{id}/documents
- GET /admissions/{id}/documents
- PUT /admissions/{id}/approve
- PUT /admissions/{id}/reject
- POST /admissions/{id}/interview
