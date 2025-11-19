# Report Service

This service manages progress reports and analytics in the Altera School Management System.

## Features
- Academic progress reports
- Performance analytics and insights
- Custom report generation
- Report templates and formats
- Automated report scheduling
- Data visualization and charts
- Comparative analysis
- Export capabilities (PDF, Excel)
- Dashboard metrics

## Technologies
- Spring Boot
- Spring Data JPA
- PostgreSQL
- JasperReports
- Chart.js/D3.js for visualization
- Apache POI for Excel export

## API Endpoints
- GET /reports
- POST /reports/generate
- GET /reports/student/{studentId}
- GET /reports/class/{classId}
- GET /reports/teacher/{teacherId}
- GET /reports/analytics
- POST /reports/schedule
- GET /reports/templates
- POST /reports/export
