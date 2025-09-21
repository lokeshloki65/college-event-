# Kongu College Event Management System

A comprehensive MERN stack event management system built for Kongu Engineering College, featuring real-time updates, student registrations, admin management, and document generation.

## 🚀 Features

### Student Features
- **Attractive Homepage**: Professional homepage inspired by modern quiz platforms
- **Event Discovery**: Browse upcoming, ongoing, and completed events
- **User Registration/Login**: Gmail-based authentication system
- **Student Dashboard**: Personalized dashboard showing registered events
- **Event Registration**: Individual and team registration support
- **Payment Integration**: UPI QR code payment with screenshot upload
- **Real-time Updates**: Live notifications for event status changes
- **WhatsApp Sharing**: Share event information to WhatsApp groups
- **Profile Management**: Complete profile editing and management

### Admin Features
- **Admin Dashboard**: Comprehensive analytics and statistics
- **Event Management**: Create, edit, and delete events
- **Registration Management**: View, approve, or reject registrations
- **User Management**: Manage all registered students
- **Document Export**: Export registration details to Word/Excel
- **Real-time Monitoring**: Live updates on registrations and activities
- **Cloudinary Integration**: Secure image storage and management

### Technical Features
- **Real-time Communication**: Socket.io for live updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Secure Authentication**: JWT-based authentication system
- **File Upload**: Cloudinary integration for images
- **Document Generation**: Generate Word and Excel reports
- **Email Notifications**: Automated email notifications
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Robust error handling and user feedback

## 🏗️ Architecture

```
event-management-system/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Server entry point
│   └── package.json
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # State management
│   │   ├── services/       # API services
│   │   └── App.jsx         # App entry point
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd event-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/kongu-event-management

# JWT Secret (use a strong, unique secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Admin Default Credentials
ADMIN_EMAIL=admin@kongu.edu
ADMIN_PASSWORD=admin123456

# WhatsApp Integration (Optional)
WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/your-group-link
```

Start the backend server:

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend application will start on `http://localhost:3000`

## 🗄️ Database Setup

### MongoDB Setup

1. **Local MongoDB**: Install MongoDB locally and ensure it's running on the default port (27017)

2. **MongoDB Atlas**: Create a free cluster on MongoDB Atlas and use the connection string

### Default Admin Account

The system will automatically create a default admin account on first run:
- **Email**: admin@kongu.edu
- **Password**: admin123456

**Important**: Change the default admin credentials after first login!

## 🔧 Configuration

### Cloudinary Setup

1. Create a free account on [Cloudinary](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to your `.env` file

### Email Configuration (Optional)

For email notifications:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in the `EMAIL_PASS` environment variable

## 📱 Usage

### For Students

1. **Register**: Create an account with your Gmail ID
2. **Browse Events**: View all available events on the homepage
3. **Register for Events**: 
   - Click on an event to view details
   - Fill out the registration form
   - Upload payment screenshot
   - Submit registration
4. **Track Registrations**: View all your registrations in the dashboard
5. **Receive Updates**: Get real-time notifications about registration status

### For Admins

1. **Login**: Use admin credentials to access admin panel
2. **Create Events**: 
   - Add event details and upload poster
   - Set registration deadlines and participant limits
   - Configure payment details with QR codes
3. **Manage Registrations**:
   - Review submitted registrations
   - Approve or reject applications
   - Export registration data
4. **Monitor Activity**: Track real-time statistics and user activity

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas for production
3. **File Storage**: Cloudinary is already configured for production
4. **Process Manager**: Use PM2 for process management

```bash
npm install -g pm2
pm2 start src/server.js --name "kongu-events-api"
```

### Frontend Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Deploy**: Deploy the `dist` folder to your hosting provider (Netlify, Vercel, etc.)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Comprehensive server-side validation
- **File Upload Security**: Validated file types and sizes
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Controlled cross-origin requests

## 📊 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Event Routes
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `GET /api/events/status/:status` - Get events by status
- `GET /api/events/search` - Search events

### Registration Routes
- `POST /api/registrations/event/:eventId` - Create registration
- `GET /api/registrations` - Get user registrations
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Cancel registration

### Admin Routes
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `GET /api/admin/events/:id/registrations` - Get event registrations
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity for MongoDB Atlas

2. **Cloudinary Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper file formats

3. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify socket URL in frontend
   - Check firewall settings

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all environment variables are set

## 📝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Kongu Engineering College for the inspiration
- React and Node.js communities for excellent documentation
- All the open-source libraries that made this project possible

## 📞 Support

For support and queries:
- **Email**: support@kongu.edu
- **Phone**: +91 4294 226000
- **Address**: Kongu Engineering College, Perundurai, Erode - 638060

## 🔮 Future Enhancements

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with college ERP system
- [ ] QR code-based attendance tracking
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Event calendar integration
- [ ] Social media integrations
- [ ] Payment gateway integration
- [ ] Automated certificate generation

---

**Made with ❤️ for Kongu Engineering College**
