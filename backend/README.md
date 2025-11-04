# Conference Room Booking System Backend

The backend server for the Conference Room Booking System built with Node.js, Express, and MongoDB.

## 🚀 Features

- **RESTful API:** Clean and well-documented API endpoints
- **JWT Authentication:** Secure token-based authentication with refresh tokens
- **Role-Based Access:** Admin and user role management
- **Real-time Notifications:** Email notifications for booking events
- **Data Validation:** Input validation and sanitization
- **Rate Limiting:** API rate limiting for security
- **Activity Logging:** Comprehensive activity tracking

## 🛠️ Tech Stack

- Node.js 18+
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Express Rate Limit
- Nodemailer for emails
- bcrypt for password hashing

## 📦 Project Structure

```
backend/
├── src/
│   ├── index.js          # Server entry point
│   ├── config.js         # Configuration
│   ├── routes.js         # API routes
│   ├── controllers.js    # Route handlers
│   ├── models.js         # Database models
│   ├── services.js       # Business logic
│   ├── validators.js     # Input validation
│   ├── middleware.js     # Custom middleware
│   └── notifications.js  # Email notifications
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

## 🔑 Environment Variables

Required variables in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/conference-rooms
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
EMAIL_FROM=noreply@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## 📱 Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests
- `npm run lint`: Lint code
- `npm run format`: Format code

## 📚 API Documentation

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/refresh` - Refresh access token

### Rooms
- GET `/rooms` - List all rooms
- POST `/rooms` - Create room (admin)
- GET `/rooms/:id` - Get room details
- PUT `/rooms/:id` - Update room (admin)
- DELETE `/rooms/:id` - Delete room (admin)

### Bookings
- POST `/bookings` - Create booking
- GET `/bookings/my` - Get user's bookings
- GET `/admin/bookings` - Get all bookings (admin)
- PATCH `/bookings/:id/status` - Update booking status
- DELETE `/bookings/:id` - Delete booking

### Reports
- GET `/admin/reports` - Get booking statistics
- GET `/admin/reports/export` - Export bookings CSV
- GET `/admin/activity-logs` - View activity logs

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token encryption
- XSS protection
- Rate limiting
- Input sanitization
- CORS configuration
- Helmet security headers

## 💾 Database Schema

### User Model
- Email (unique)
- Password (hashed)
- Role (admin/user)

### Room Model
- Name
- Location
- Capacity
- Amenities
- Active status

### Booking Model
- User reference
- Room reference
- Start time
- End time
- Status (pending/approved/rejected/cancelled)
- Purpose

### Activity Log Model
- User reference
- Action type
- Details
- Timestamp
- IP address

## 📧 Notifications

Email notifications for:
- Booking creation
- Status changes
- Reminders
- Cancellations

## 🧪 Testing

- Unit tests for services
- Integration tests for API
- Mock email service
- Test coverage reports
