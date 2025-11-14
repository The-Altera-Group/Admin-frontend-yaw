# Fee Service

This service manages fee management and payment tracking in the Altera School Management System.

## Features
- Fee structure management
- Student fee calculation
- Payment processing and tracking
- Invoice generation
- Payment reminders and notifications
- Fee collection reports
- Scholarship and discount management
- Payment history tracking

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Payment Gateway Integration

## API Endpoints
- GET /fees
- POST /fees/structure
- GET /fees/student/{studentId}
- POST /fees/payment
- GET /fees/payment/{paymentId}
- GET /fees/invoices/{studentId}
- POST /fees/discount
- GET /fees/reports
- GET /fees/pending/{studentId}
