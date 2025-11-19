# Notification Service

This service manages push notifications and alerts in the Altera School Management System.

## Features
- Push notification delivery
- Email notifications
- SMS alerts
- In-app notifications
- Notification templates
- User notification preferences
- Bulk notification sending
- Notification scheduling
- Delivery tracking and analytics

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Firebase Cloud Messaging (FCM)
- Email Service Integration
- SMS Service Integration

## API Endpoints
- POST /notifications/send
- GET /notifications/user/{userId}
- POST /notifications/bulk
- PUT /notifications/{id}/read
- GET /notifications/templates
- POST /notifications/templates
- PUT /notifications/preferences/{userId}
- GET /notifications/analytics
