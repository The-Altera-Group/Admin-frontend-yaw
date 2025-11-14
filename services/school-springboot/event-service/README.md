# Event Service

This service manages school events and calendar management in the Altera School Management System.

## Features
- Event creation and management
- School calendar maintenance
- Event scheduling and conflicts resolution
- Event notifications and reminders
- RSVP and attendance tracking
- Recurring events management
- Event categories and types
- Resource booking for events

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Calendar Integration

## API Endpoints
- GET /events
- POST /events
- PUT /events/{id}
- DELETE /events/{id}
- GET /events/calendar
- GET /events/upcoming
- POST /events/{id}/rsvp
- GET /events/{id}/attendees
- GET /events/category/{category}
