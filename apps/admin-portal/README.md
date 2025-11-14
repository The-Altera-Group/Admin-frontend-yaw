# Admin Portal

A React-based administrative portal for comprehensive school management and system administration in the Altera School Management System.

## Features

- **User Management**: Manage students, teachers, and staff accounts
- **Academic Management**: Oversee courses, classes, and academic programs
- **System Analytics**: Comprehensive dashboards and reporting tools
- **Financial Management**: Fee management, payment tracking, and financial reports
- **Communication Hub**: Broadcast announcements and manage communications
- **System Configuration**: Configure system settings and preferences
- **Data Import/Export**: Bulk data operations and backup management

## Technology Stack

- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- TanStack Query for data fetching and caching
- Tailwind CSS for styling
- Radix UI for accessible components
- Recharts for data visualization
- React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Application pages/routes
├── hooks/          # Custom React hooks
├── services/       # API service functions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── styles/         # Global styles
└── App.tsx         # Main application component
```

## Key Features

### Dashboard
- Real-time system metrics
- Quick access to common tasks
- Recent activity feed
- System health monitoring

### User Management
- Student enrollment and profile management
- Teacher and staff administration
- Role-based access control
- Bulk user operations

### Academic Management
- Course and curriculum management
- Class scheduling and room allocation
- Academic calendar management
- Grade and assessment oversight

### Reports & Analytics
- Student performance analytics
- Attendance reports
- Financial reports
- Custom report generation

## API Integration

The portal connects to all backend microservices:
- Authentication Service
- Student Service
- Teacher Service
- Course Service
- Grade Service
- Attendance Service

## Environment Variables

Create a `.env` file with:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVICE_URL=http://localhost:8081
```
