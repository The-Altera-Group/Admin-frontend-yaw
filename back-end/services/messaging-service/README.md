# Messaging Service

This service manages direct messaging and communication in the Altera School Management System.

## Features
- Direct messaging between users
- Group chat functionality
- Message threading and replies
- File and media sharing
- Message search and filtering
- Read receipts and delivery status
- Message encryption and security
- Chat moderation and administration

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- WebSocket for real-time messaging
- File Storage Integration

## API Endpoints
- GET /messages
- POST /messages/send
- GET /messages/conversation/{userId}
- GET /messages/groups
- POST /messages/groups
- POST /messages/groups/{groupId}/join
- PUT /messages/{id}/read
- GET /messages/search
- POST /messages/attachments
