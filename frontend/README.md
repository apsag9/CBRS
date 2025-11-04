# Conference Room Booking System Frontend

The frontend application for the Conference Room Booking System built with React and Vite.

## 🚀 Features

- **User Authentication:** Secure login and registration system
- **Room Booking:** Easy room booking with date and time selection
- **Booking Management:** View, edit, and cancel bookings
- **Admin Dashboard:** Comprehensive admin features for room and booking management
- **Reports & Analytics:** Usage statistics and booking trends
- **Responsive Design:** Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- React 18+ (with Hooks)
- Vite for fast development and building
- React Router for navigation
- Modern CSS with utility classes
- JWT for authentication
- Fetch API for backend communication

## 📦 Project Structure

```
frontend/
├── src/
│   ├── App.jsx               # Root component
│   ├── index.jsx            # Entry point
│   ├── pages.jsx            # Page exports
│   ├── api/
│   │   └── api.js           # API client
│   └── pages/
│       ├── Auth/            # Login/Register
│       ├── Bookings/        # Booking management
│       ├── Reports/         # Analytics
│       └── Rooms/          # Room management
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🔑 Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000 # Backend API URL
```

## 📱 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Lint code
- `npm run format`: Format code

## 🔒 Authentication

- Uses JWT tokens for secure authentication
- Token refresh mechanism for extended sessions
- Protected routes for authorized access
- Role-based access control (user/admin)

## 🎨 Styling Guide

- Utility classes for consistent styling
- Responsive breakpoints: sm, md, lg, xl
- Color scheme defined in CSS variables
- Common components share style patterns

## 📚 API Integration

- REST API endpoints in `api.js`
- Automatic token handling
- Error handling and retry logic
- Loading states for better UX

## 🧪 Testing

- Unit tests for components
- Integration tests for workflows
- End-to-end testing with Cypress
- Mock service worker for API tests

## 🔄 State Management

- React hooks for local state
- Context for shared state
- Optimistic updates
- Error boundary handling
