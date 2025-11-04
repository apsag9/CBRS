# System Architecture 🏗️

## Overview

The Conference Room Booking System uses a modern MERN stack architecture with clear separation of concerns and scalable design patterns.

## 🔧 Technical Stack

### Frontend
- React 18+ with functional components and hooks
- Vite for build tooling
- Modern CSS with utility classes
- JWT for authentication
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Email notifications
- Rate limiting and security middleware

## 🏛️ Architecture Diagram

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│   React Frontend│      │Express Backend│      │  MongoDB    │
│                 │      │              │      │             │
│  - Components   │──┬──►│  - Routes    │──┬──►│ - Users    │
│  - Pages        │  │   │  - Models    │  │   │ - Rooms    │
│  - State        │  │   │  - Services  │  │   │ - Bookings │
│  - API Client   │  │   │  - Auth      │  │   │ - Logs     │
│                 │  │   │              │  │   │            │
└─────────────────┘  │   └──────────────┘  │   └─────────────┘
                     │                      │
                     │   ┌──────────────┐   │
                     └──►│Email Service │   │
                         │              │   │
                         │- Node Mailer │◄──┘
                         │- Templates   │
                         └──────────────┘
```

## 🔄 Data Flow

1. Client makes request through React frontend
2. API client adds auth headers if needed
3. Express backend validates request
4. Controllers process the request
5. Services handle business logic
6. Models interact with MongoDB
7. Response flows back to client
8. Side effects (emails, logs) processed

## 🛡️ Security Architecture

### Authentication
- JWT-based auth with refresh tokens
- Password hashing with bcrypt
- Token blacklisting
- Session management

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API route protection
- Input validation

### API Security
- Rate limiting
- CORS configuration
- XSS protection
- Request validation
- Error handling

## 📦 Component Architecture

### Frontend Components
```
App
├── Auth
│   ├── Login
│   └── Register
├── Rooms
│   ├── RoomList
│   ├── RoomDetails
│   └── ManageRooms
├── Bookings
│   ├── BookingForm
│   ├── BookingHistory
│   └── ManageBookings
└── Reports
    ├── AdminDashboard
    └── ReportsPage
```

### Backend Services
```
Services
├── AuthService
├── BookingService
├── RoomService
├── NotificationService
├── ReportService
└── LoggingService
```

## 🔌 Integration Points

- Frontend ↔️ Backend API
- Backend ↔️ MongoDB
- Backend ↔️ Email Service
- Backend ↔️ External Services

## 📈 Scalability Considerations

- Horizontal scaling of backend
- Caching strategies
- Database indexing
- Rate limiting
- Connection pooling
- Async processing

## 🧪 Testing Architecture

### Frontend Testing
- Component tests
- Integration tests
- E2E tests
- API mocking

### Backend Testing
- Unit tests
- API tests
- Service tests
- Load tests

## 📊 Monitoring

- API metrics
- Error tracking
- Performance monitoring
- User analytics
- Server health checks

## 🔄 Deployment Architecture

### Development
- Local environment
- Development server
- Test database

### Production
- Load balanced servers
- Production database
- Email service
- Monitoring tools
- Backup systems