# Secure Authentication System Implementation

## 🔒 Feature Overview
This PR implements a secure authentication system with session timeout and HTTPS support for the conference room booking system.

## 🛠️ Changes Made
- Added session management with configurable timeout
- Implemented HTTPS support with SSL/TLS configuration
- Enhanced password security with bcrypt hashing
- Added secure authentication middleware
- Improved error handling in registration and login flows
- Updated API endpoints for better security
- Fixed CORS and session cookie configurations

## 🧪 Testing
The following test scenarios have been verified:
- User registration with validation
- User login with secure token generation
- Session timeout functionality
- Password hashing and verification
- Protected route access control
- CORS and cookie handling

## 🔍 Review Notes
Please pay special attention to:
- Session configuration in `config.js`
- Authentication flow in `controllers.js`
- Security middleware implementation
- Frontend API integration

## 👥 Reviewers
@Hars03082005 @apsag9 @akshayabhagya78

## 📝 Related Issues
Implements secure authentication requirements from Sprint 1