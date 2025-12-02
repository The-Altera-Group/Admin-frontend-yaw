# Teacher Web App - Folder Structure Documentation

## Overview
This document explains the folder structure of the Teacher Web App and provides guidelines for where to place new files.

## Directory Structure

```
src/
├── auth/                         # Authentication module
│   ├── components/               # Auth-specific components
│   │   ├── Forgot.jsx           # Password recovery component
│   │   ├── Login.jsx            # Login form component
│   │   └── Reset.jsx            # Password reset component
│   ├── context/                 # Authentication context
│   │   ├── AuthContext.jsx      # Auth context definition
│   │   └── AuthProvider.jsx     # Auth provider wrapper
│   ├── hooks/                   # Auth-specific hooks
│   │   └── useAuth.jsx          # Custom auth hook
│   └── AuthPage.jsx             # Main auth page wrapper
│
├── components/                   # Reusable components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── Classes.jsx          # [Legacy] Classes widget
│   │   ├── GradeDistribution.jsx # [Legacy] Grade widget
│   │   ├── Notifications.jsx    # Notifications widget
│   │   ├── PerformanceMetrics.jsx # Performance metrics widget
│   │   ├── QuickActions.jsx     # Quick actions widget
│   │   ├── RecentActivity.jsx   # Recent activity widget
│   │   ├── StatsCards.jsx       # Statistics cards widget
│   │   ├── StudentPerformanceChart.jsx # Performance chart widget
│   │   ├── TaskTracker.jsx      # Task tracking widget
│   │   ├── TeacherDashboard.jsx # Main dashboard page
│   │   └── UpcomingSchedule.jsx # Schedule widget
│   ├── layout/                  # Layout components
│   │   ├── MainLayout.jsx       # Main application layout
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   └── TopBar.jsx           # Top navigation bar
│   ├── ui/                      # UI utility components
│   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   ├── NotFound.jsx             # 404 page component
│   └── Unauthorized.jsx         # 401 page component
│
├── pages/                        # Full-page views (MAIN FEATURE PAGES)
│   ├── Assignments.jsx          # Assignments management page
│   ├── Attendance.jsx           # Attendance tracking page
│   ├── Calendar.jsx             # Calendar & planning page
│   ├── ClassManagement.jsx      # Class management page
│   ├── Gradebook.jsx            # Gradebook page
│   ├── Messages.jsx             # Messaging system page
│   ├── ResourceLibrary.jsx      # Resource library page
│   └── StudentProfiles.jsx      # Student profiles page
│
├── hooks/                        # Custom React hooks
│   └── useDashboard.jsx         # Dashboard data hook
│
├── services/                     # API and external services
│   ├── apiClient.jsx            # HTTP client configuration
│   ├── authService.jsx          # Authentication service
│   ├── dashboardService.jsx     # Dashboard data service
│   └── mockAuthService.jsx      # Mock authentication service
│
├── utils/                        # Utility functions
│   └── secureStorage.js         # Secure storage utility
│
├── styles/                       # Global styles
│   ├── auth.css                 # Authentication styles
│   └── dashboard.css            # Dashboard styles
│
├── App.jsx                       # Root application component
└── main.jsx                      # Application entry point
```

## Key Concepts

### 1. Pages vs Components

**Pages (`src/pages/`)**
- Full-page views that represent complete features
- Accessed via routing (e.g., `/assignments`, `/attendance`)
- Include their own layout, data fetching, and business logic
- Examples: Assignments.jsx, Gradebook.jsx, Calendar.jsx

**Components (`src/components/`)**
- Reusable UI pieces that can be used across multiple pages
- Should be smaller, focused, and composable
- Examples: Buttons, Cards, Widgets, Layout elements

### 2. Dashboard Structure

The dashboard has two types of components:

**Main Dashboard Page**
- Location: `src/components/dashboard/TeacherDashboard.jsx`
- This is the overview page shown at `/overview`
- Aggregates multiple widgets into a cohesive dashboard view

**Dashboard Widgets**
- Location: `src/components/dashboard/`
- Small, reusable components displayed on the dashboard
- Examples: StatsCards, RecentActivity, TaskTracker
- Can be mixed and matched in the main dashboard

### 3. Routing Architecture

All routes are defined in `src/App.jsx`:

```javascript
// Main dashboard
/overview         → TeacherDashboard.jsx

// Feature pages
/classes          → ClassManagement.jsx
/assignments      → Assignments.jsx
/grades           → Gradebook.jsx
/students         → StudentProfiles.jsx
/attendance       → Attendance.jsx
/messages         → Messages.jsx
/resources        → ResourceLibrary.jsx
/calendar         → Calendar.jsx

// Authentication
/teacher/*   → AuthPage.jsx
```

### 4. Authentication Flow

```
User visits protected route
    ↓
ProtectedRoute checks authentication
    ↓
If authenticated → Show page
If not authenticated → Redirect to /teacher/login
```

Components involved:
- `AuthProvider` - Wraps entire app, provides auth context
- `useAuth` hook - Access authentication state/methods
- `ProtectedRoute` - Guards routes requiring authentication
- `authService` - Handles API calls and token management

### 5. State Management

**Local State (useState)**
- Used for component-specific state
- Examples: Form inputs, modal visibility, filters

**Context API**
- Used for app-wide state
- Example: Authentication state (AuthContext)

**Future: Consider adding**
- Redux/Zustand for complex global state
- React Query for server state management

## Guidelines for Adding New Features

### Adding a New Page

1. Create file in `src/pages/YourPage.jsx`
2. Use MainLayout wrapper:
   ```jsx
   import MainLayout from '../components/layout/MainLayout';

   const YourPage = () => {
     const { user, logout } = useAuth();

     return (
       <MainLayout user={user} onLogout={logout} activeView="yourpage">
         {/* Your content */}
       </MainLayout>
     );
   };
   ```

3. Add route in `src/App.jsx`:
   ```jsx
   import YourPage from './pages/YourPage';

   <Route
     path="/yourpath"
     element={
       <ProtectedRoute>
         <YourPage />
       </ProtectedRoute>
     }
   />
   ```

4. Add navigation item in `src/components/layout/Sidebar.jsx`:
   ```jsx
   {
     id: 'yourpage',
     label: 'Your Page',
     icon: YourIcon,
     path: '/yourpath',
     description: 'Your page description'
   }
   ```

### Adding a Dashboard Widget

1. Create file in `src/components/dashboard/YourWidget.jsx`
2. Make it self-contained and reusable
3. Import in `TeacherDashboard.jsx`:
   ```jsx
   import YourWidget from './YourWidget';

   // Add to dashboard layout
   <YourWidget />
   ```

### Adding a Service

1. Create file in `src/services/yourService.jsx`
2. Export service functions:
   ```jsx
   const yourService = {
     fetchData: async () => { /* ... */ },
     updateData: async (data) => { /* ... */ }
   };

   export default yourService;
   ```

### Adding a Custom Hook

1. Create file in `src/hooks/useYourHook.jsx`
2. Follow React hooks conventions:
   ```jsx
   export const useYourHook = () => {
     const [state, setState] = useState();

     // Hook logic

     return { state, setState };
   };
   ```

## Design Patterns Used

### 1. Component Structure
```jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';

const YourComponent = () => {
  // 1. Hooks
  const { user, logout } = useAuth();
  const [state, setState] = useState();

  // 2. Memoized values
  const computed = useMemo(() => { /* ... */ }, [dependencies]);

  // 3. Event handlers
  const handleAction = () => { /* ... */ };

  // 4. Render
  return (
    <MainLayout user={user} onLogout={logout}>
      {/* JSX */}
      <style jsx>{`/* Styles */`}</style>
    </MainLayout>
  );
};

export default YourComponent;
```

### 2. Styled JSX
All components use inline styled-jsx for scoped styles:
```jsx
<style jsx>{`
  .component-class {
    /* styles */
  }
`}</style>
```

### 3. Responsive Design
Use these breakpoints consistently:
```css
@media (max-width: 480px)  { /* Mobile */ }
@media (max-width: 768px)  { /* Tablet */ }
@media (max-width: 1024px) { /* Small desktop */ }
@media (max-width: 1400px) { /* Large desktop */ }
```

## Common Patterns

### Loading States
```jsx
const [isLoading, setIsLoading] = useState(false);

if (isLoading) return <LoadingSpinner />;
```

### Error Handling
```jsx
const [error, setError] = useState(null);

if (error) return <ErrorMessage error={error} />;
```

### Empty States
```jsx
{items.length === 0 && (
  <div className="empty-state">
    <Icon size={64} />
    <p>No items found</p>
  </div>
)}
```

### Modal Pattern
```jsx
const [showModal, setShowModal] = useState(false);

{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

## Best Practices

### Do's ✅
- Keep pages in `src/pages/`
- Keep reusable components in `src/components/`
- Use MainLayout for all full pages
- Use useAuth hook for authentication
- Add new routes to App.jsx
- Add navigation items to Sidebar.jsx
- Use consistent naming (PascalCase for components)
- Include responsive design in all components
- Use semantic HTML elements
- Add proper ARIA labels for accessibility

### Don'ts ❌
- Don't create pages in components/ folder
- Don't bypass ProtectedRoute for authenticated routes
- Don't mix business logic with UI components
- Don't hardcode API endpoints (use services)
- Don't forget to add cleanup in useEffect
- Don't use inline styles (use styled-jsx instead)
- Don't forget error handling
- Don't commit sensitive data (tokens, keys)

## CSS Variables
Available throughout the app:
```css
--primary-green: #059669
--primary-green-hover: #047857
--bg-primary: #f9fafb
--bg-secondary: #f3f4f6
--text-primary: #111827
--text-secondary: #6b7280
--text-tertiary: #9ca3af
--border-color: #e5e7eb
--space-xs: 0.25rem
--space-sm: 0.5rem
--space-md: 1rem
--space-lg: 1.5rem
--space-xl: 2rem
```

## Testing Strategy (Future)

When adding tests:
```
src/
├── __tests__/          # Test files
│   ├── pages/
│   ├── components/
│   └── services/
```

## Performance Considerations

1. **Code Splitting**: Pages are lazy-loaded via routing
2. **Memoization**: Use useMemo for expensive computations
3. **React.memo**: Wrap components that re-render frequently
4. **Debouncing**: Use for search inputs and filters
5. **Virtual Scrolling**: Consider for large lists (100+ items)

## Security Considerations

1. **Authentication**: All sensitive routes use ProtectedRoute
2. **Token Storage**: Encrypted storage via secureStorage utility
3. **XSS Prevention**: Sanitize user inputs
4. **CSRF Protection**: Include CSRF tokens in API requests
5. **Input Validation**: Validate on both client and server

## Next Steps

### Recommended Additions
1. Add unit tests for critical components
2. Implement error boundary components
3. Add loading skeletons for better UX
4. Implement infinite scrolling for large datasets
5. Add toast notifications system
6. Implement file upload progress indicators
7. Add data export functionality (PDF, CSV)
8. Implement real-time updates (WebSockets)
9. Add keyboard shortcuts
10. Implement dark mode toggle

### Future Enhancements
- Add analytics dashboard
- Implement advanced search/filters
- Add bulk operations
- Implement data caching strategy
- Add offline support (PWA)
- Implement collaborative features
- Add automated backups
- Implement audit logging

## Questions?

If you're unsure where to place a new file, ask yourself:

1. **Is it a full page?** → `src/pages/`
2. **Is it reusable across pages?** → `src/components/`
3. **Is it dashboard-specific?** → `src/components/dashboard/`
4. **Is it a utility function?** → `src/utils/`
5. **Does it fetch/manage data?** → `src/services/`
6. **Is it a custom hook?** → `src/hooks/`
7. **Is it authentication-related?** → `src/auth/`

---

**Last Updated**: December 2025
**Maintainer**: Development Team
**Version**: 1.0.0
