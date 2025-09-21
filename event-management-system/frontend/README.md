# Kongu Event Management System - Frontend

React.js frontend application for the Kongu College Event Management System.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── admin/         # Admin-specific components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── EventsPage.jsx
│   │   ├── EventDetailsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── RegisterEventPage.jsx
│   ├── context/           # State management
│   │   ├── authStore.js
│   │   └── socketStore.js
│   ├── services/          # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── registrationService.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/
│   ├── index.html
│   └── assets/
├── .env.example           # Environment variables template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── package.json
└── README.md
```

## 🚀 Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
```

5. **Preview Production Build**
```bash
npm run preview
```

## 🔧 Environment Variables

Required environment variables (see `.env.example` for details):

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000/api)
- `VITE_SOCKET_URL` - Socket.io server URL (default: http://localhost:5000)

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions and navigation
- **Kongu**: College brand colors for headers and important elements
- **Semantic**: Success (green), warning (yellow), error (red), info (blue)

### Typography
- **Display Font**: Poppins for headings and important text
- **Body Font**: Inter for body text and UI elements

### Components
- **Cards**: Clean, shadowed containers with hover effects
- **Buttons**: Multiple variants (primary, secondary, kongu)
- **Forms**: Consistent input styling with validation states
- **Navigation**: Responsive navbar with mobile menu

## 📱 Pages & Features

### Public Pages
- **Homepage**: Attractive landing page with featured events
- **Events Page**: Browse all events with filtering and search
- **Event Details**: Detailed event information with registration option
- **Login/Register**: Authentication pages with form validation

### Student Pages (Protected)
- **Dashboard**: Personalized overview of registered events
- **Profile**: Edit personal and academic information
- **Event Registration**: Comprehensive registration form with file upload

### Admin Pages (Admin Only)
- **Admin Dashboard**: Analytics, statistics, and overview
- **Event Management**: Create, edit, and manage events
- **Registration Management**: Review and manage student registrations
- **User Management**: View and manage all registered users

## 🏗️ State Management

### Zustand Stores

#### Auth Store (`authStore.js`)
- User authentication state
- Login/logout functionality
- Profile management
- Token handling

#### Socket Store (`socketStore.js`)
- Real-time WebSocket connection
- Notification management
- Event updates
- Admin notifications

### Features
- Persistent state with localStorage
- Automatic token refresh
- Real-time updates
- Error handling

## 🌐 API Integration

### Service Architecture
- **API Service**: Base Axios configuration with interceptors
- **Auth Service**: Authentication-related API calls
- **Event Service**: Event management and browsing
- **Registration Service**: Student registration operations

### Features
- Automatic token injection
- Request/response interceptors
- Error handling and retry logic
- Loading state management

## 🎭 Animations & Interactions

### Framer Motion
- Page transitions and route animations
- Component enter/exit animations
- Hover effects and micro-interactions
- Loading state animations

### Interaction Design
- Smooth hover effects
- Card lift animations
- Button state feedback
- Form validation feedback

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Features
- Mobile-first approach
- Touch-friendly interactions
- Responsive navigation
- Adaptive layouts

## 🔔 Real-time Features

### Socket.io Integration
- Automatic reconnection
- Event-specific rooms
- Real-time notifications
- Connection status indicators

### Notifications
- Toast notifications for actions
- Persistent notification center
- Unread count badges
- Admin notification system

## 🎨 Styling & Theming

### Tailwind CSS
- Utility-first CSS framework
- Custom color palette
- Responsive utilities
- Component classes

### Custom Components
```css
.btn-primary       /* Primary action button */
.btn-secondary     /* Secondary button */
.btn-kongu         /* College-branded button */
.card              /* Basic card container */
.card-hover        /* Card with hover effects */
.input-field       /* Form input styling */
.badge-*           /* Status badges */
```

## 🖼️ Image Handling

### File Upload
- Drag-and-drop interface
- Image preview
- File validation
- Progress indicators

### Image Optimization
- Cloudinary integration
- Automatic optimization
- Responsive images
- Format conversion

## 📊 Performance

### Code Splitting
- Route-based splitting
- Lazy loading components
- Dynamic imports
- Optimized bundles

### Optimization
- Tree shaking
- Asset minification
- Image optimization
- Caching strategies

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

### Testing Libraries
- **Vitest**: Fast unit testing
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deployment Options

#### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Static Hosting
Upload the contents of the `dist` folder to any static file hosting service.

## 🔧 Configuration

### Vite Configuration
- React plugin setup
- Path aliases (@/ for src/)
- Proxy configuration for API
- Build optimization

### Tailwind Configuration
- Custom colors and spacing
- Font family configuration
- Animation utilities
- Responsive breakpoints

## 🐛 Debugging

### Development Tools
- React Developer Tools
- Redux DevTools (for state)
- Network tab for API calls
- Console logging

### Error Boundaries
- Graceful error handling
- Error reporting
- Fallback UI components
- User feedback

## 📱 Progressive Web App (PWA)

### Features (Future Enhancement)
- Service worker integration
- Offline functionality
- Push notifications
- App-like experience

## 🔒 Security

### Client-Side Security
- XSS prevention
- Input sanitization
- Secure token storage
- Content Security Policy

### Best Practices
- Environment variable protection
- Sensitive data handling
- HTTPS enforcement
- API key protection

## 🎯 SEO & Accessibility

### SEO Optimization
- Meta tags and descriptions
- Open Graph tags
- Structured data
- Sitemap generation

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## 📈 Analytics (Future)

### User Analytics
- Page view tracking
- User engagement metrics
- Event registration funnel
- Performance monitoring

## 🔄 State Management Patterns

### Zustand Patterns
```javascript
// Store creation
const useStore = create((set, get) => ({
  // State
  data: null,
  
  // Actions
  fetchData: async () => {
    const response = await api.getData();
    set({ data: response.data });
  }
}));

// Usage in components
const { data, fetchData } = useStore();
```

## 📝 Code Style Guide

### ESLint Configuration
- React hooks rules
- Import/export conventions
- Code formatting standards
- Best practice enforcement

### Component Structure
```jsx
// Component imports
import React, { useState, useEffect } from 'react';

// External library imports
import { motion } from 'framer-motion';

// Internal imports
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const ComponentName = () => {
  // Hooks and state
  const [state, setState] = useState();
  
  // Store access
  const { user } = useAuthStore();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Render
  return (
    <div className="component-class">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

## 📞 Support

For frontend-specific issues:
- Check browser console for errors
- Verify environment variables
- Check network tab for API issues
- Contact: frontend-support@kongu.edu

---

**Frontend Application for Kongu Engineering College Event Management System**
