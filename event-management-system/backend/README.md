# Kongu Event Management System - Backend

Node.js + Express.js backend API for the Kongu College Event Management System.

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── adminController.js
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Registration.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── admin.js
│   │   └── students.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── utils/             # Utility functions
│   │   ├── cloudinary.js
│   │   └── documentGenerator.js
│   └── server.js          # Server entry point
├── temp/                  # Temporary files (auto-created)
├── .env.example          # Environment variables template
├── .gitignore
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

4. **Start Production Server**
```bash
npm start
```

## 🔧 Environment Variables

Required environment variables (see `.env.example` for details):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend application URL
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `GET /verify-token` - Verify JWT token
- `POST /logout` - User logout

### Events (`/api/events`)
- `GET /` - Get all events (with filters)
- `GET /search` - Search events
- `GET /status/:status` - Get events by status
- `GET /department/:department` - Get events by department
- `GET /:id` - Get single event
- `GET /:id/stats` - Get event statistics
- `GET /user/registered` - Get user's registered events

### Registrations (`/api/registrations`)
- `POST /event/:eventId` - Create registration
- `GET /` - Get user registrations
- `GET /stats` - Get user registration statistics
- `GET /:id` - Get single registration
- `PUT /:id` - Update registration
- `DELETE /:id` - Cancel registration

### Admin (`/api/admin`)
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /events` - Get all events (admin view)
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/:eventId/registrations` - Get event registrations
- `PUT /registrations/:registrationId/status` - Update registration status
- `GET /events/:eventId/export` - Export registrations
- `GET /users` - Get all users

### Students (`/api/students`)
- `GET /dashboard` - Get student dashboard data

## 🗄️ Database Models

### User Model
- Personal information (name, email, phone, etc.)
- Academic details (college, department, year)
- Authentication data (password hash, role)
- Profile settings and preferences

### Event Model
- Event details (name, description, venue, dates)
- Registration settings (deadlines, limits, fees)
- Media files (poster, payment QR)
- Custom registration fields
- Real-time status tracking

### Registration Model
- User and event references
- Registration type (individual/team)
- Contact and academic information
- Payment details and screenshot
- Status tracking and admin notes
- Team member details (for team registrations)

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (student/admin)
- Password hashing with bcrypt
- Token expiration and refresh

### Input Validation
- Express-validator for request validation
- File upload validation (type, size)
- Data sanitization and filtering

### Security Middleware
- Helmet.js for security headers
- Rate limiting for API endpoints
- CORS configuration
- Request size limiting

## 📁 File Upload & Storage

### Cloudinary Integration
- Automatic image optimization
- Multiple upload formats support
- Secure URL generation
- Folder-based organization

### Upload Types
- Event posters (max 5MB)
- Payment QR codes (max 2MB)
- Payment screenshots (max 3MB)
- Profile images (max 2MB)

## 📊 Real-time Features

### Socket.io Integration
- Real-time event updates
- Registration notifications
- User activity tracking
- Admin notifications

### Events
- `event-created` - New event notification
- `event-updated` - Event modification
- `registration-created` - New registration
- `registration-status-updated` - Status changes

## 📄 Document Generation

### Export Features
- Word document generation (registration details)
- Excel spreadsheet export
- Automated formatting and styling
- Temporary file cleanup

### Generated Documents Include
- Registration summaries
- Team member details
- Payment information
- Event statistics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Performance Optimization

### Database
- Indexed queries for faster search
- Aggregation pipelines for statistics
- Connection pooling
- Query optimization

### Caching
- Redis integration (optional)
- Memory caching for frequent data
- Static asset optimization

### Monitoring
- Request logging with Morgan
- Error tracking and reporting
- Performance metrics

## 🚀 Deployment

### Production Setup
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "kongu-events-api"

# Monitor
pm2 monit

# Restart
pm2 restart kongu-events-api
```

### Environment Configuration
- Set `NODE_ENV=production`
- Use MongoDB Atlas for database
- Configure proper CORS settings
- Set up SSL/HTTPS

### Docker Deployment (Optional)
```bash
# Build image
docker build -t kongu-events-backend .

# Run container
docker run -p 5000:5000 kongu-events-backend
```

## 🐛 Debugging

### Development
```bash
# Debug mode with nodemon
npm run debug

# Enable detailed logging
DEBUG=* npm run dev
```

### Logging
- Request/response logging
- Error tracking with stack traces
- Database query logging
- File upload logging

## 📝 API Documentation

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (for paginated responses)
  }
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors array
  ]
}
```

## 🔧 Maintenance

### Regular Tasks
- Database backup and cleanup
- Log file rotation
- Security updates
- Performance monitoring

### Database Maintenance
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/kongu-event-management

# Backup database
mongodump --db kongu-event-management

# Restore database
mongorestore --db kongu-event-management dump/kongu-event-management
```

## 📞 Support

For backend-specific issues:
- Check server logs: `npm run logs`
- Monitor API health: `GET /api/health`
- Review error reports in logs/
- Contact: backend-support@kongu.edu

---

**Backend API for Kongu Engineering College Event Management System**
