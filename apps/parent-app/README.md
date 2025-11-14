# Parent Mobile App

A React Native mobile application for parents to track their children's academic progress in the Altera School Management System.

## Features

- **Student Progress Tracking**: View grades, attendance, and academic performance
- **Real-time Notifications**: Get instant updates about attendance, grades, and school announcements
- **Communication**: Direct messaging with teachers and school administration
- **Event Calendar**: Stay updated with school events and important dates
- **Report Cards**: Access and download digital report cards
- **Fee Management**: View and pay school fees online

## Technology Stack

- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- AsyncStorage for local data persistence

## Getting Started

### Prerequisites

- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens
├── services/       # API services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── App.tsx         # Main app component
```

## API Integration

The app connects to the Spring Boot backend services for:
- Authentication
- Student data
- Grades and reports
- Attendance records
- Notifications
