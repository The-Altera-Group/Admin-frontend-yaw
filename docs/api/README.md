# API Documentation

This directory contains comprehensive API documentation for all Altera School Management System services.

## Services

### Authentication Service
- **Base URL**: `http://localhost:8081`
- **Documentation**: [Auth API](./auth-service.md)
- **Endpoints**: Login, Register, Token Management

### Student Service
- **Base URL**: `http://localhost:8082`
- **Documentation**: [Student API](./student-service.md)
- **Endpoints**: Student CRUD, Enrollment, Academic History

### Teacher Service
- **Base URL**: `http://localhost:8083`
- **Documentation**: [Teacher API](./teacher-service.md)
- **Endpoints**: Teacher CRUD, Course Assignment, Schedule

### Course Service
- **Base URL**: `http://localhost:8084`
- **Documentation**: [Course API](./course-service.md)
- **Endpoints**: Course CRUD, Curriculum Management

### Attendance Service
- **Base URL**: `http://localhost:8085`
- **Documentation**: [Attendance API](./attendance-service.md)
- **Endpoints**: Attendance Recording, Reports, Analytics

### Grade Service
- **Base URL**: `http://localhost:8086`
- **Documentation**: [Grade API](./grade-service.md)
- **Endpoints**: Grade Management, Report Cards, Analytics

## API Standards

### Authentication
All API endpoints (except login/register) require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

### Response Format
All APIs follow a consistent response format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2023-01-01T00:00:00Z"
}
```

### Error Handling
Error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2023-01-01T00:00:00Z"
}
```

### Pagination
List endpoints support pagination:
```
GET /api/students?page=0&size=20&sort=name,asc
```

## Testing
- Use Postman collection: [Altera API Collection](./postman-collection.json)
- Swagger UI available at: `http://localhost:8080/swagger-ui.html`
