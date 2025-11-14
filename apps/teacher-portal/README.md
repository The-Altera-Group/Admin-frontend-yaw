# Teacher Portal

A Next.js web application for teachers to manage their classes, students, and academic activities in the Altera School Management System.

## Features

- **Class Management**: Create and manage classes, view student rosters
- **Grade Management**: Record grades, generate report cards, track academic progress
- **Attendance Tracking**: Mark attendance, view attendance reports
- **Student Analytics**: Detailed insights into student performance and behavior
- **Communication Tools**: Message students and parents directly
- **Assignment Management**: Create, distribute, and grade assignments
- **Schedule Management**: View and manage class schedules

## Technology Stack

- Next.js 13 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Headless UI components
- Chart.js for data visualization
- React Hook Form for form management
- React Query for data fetching

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

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Next.js pages
├── styles/         # CSS and styling files
├── lib/            # Utility functions and configurations
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── services/       # API service functions
```

## API Integration

The portal integrates with the following backend services:
- Authentication Service
- Course Service
- Student Service
- Grade Service
- Attendance Service

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8081
```
