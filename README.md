🚀 College Event Management System
A complete MERN stack application designed to streamline event organization and participation within a college campus. This platform provides a seamless experience for students to discover and register for events, and for administrators to manage them effortlessly.

✨ Key Features
This system is divided into two main user roles, each with a specific set of powerful features.

🧑‍🎓 For Students & Participants
Secure Authentication: Easy and secure user registration and login system using JWT (JSON Web Tokens).

Event Discovery: Browse a clean, modern interface displaying all available events with details like date, venue, and description.

Simple Registration: Register for any event with a single click.

Profile Management: View and manage your registration history and personal details.

Real-time Notifications: Receive live updates and notifications about events.

👑 For Administrators
Admin Dashboard: A central hub to get an overview of all events, registrations, and student data.

Full Event Control (CRUD): Create new events with images, update existing event details, and delete events that are no longer active.

Registration Management: View a detailed list of all students registered for each event.

Student Data Management: Access and manage a comprehensive list of all student users on the platform.

Automatic Certificate Generation: Automatically generate and prepare participation documents for registered students.

🛠️ Technology Stack
This project is a full-stack application built with modern and powerful technologies.

Area	Technology / Library
Backend	Node.js, Express.js, MongoDB (with Mongoose), JWT, Cloudinary, Multer, Socket.IO
Frontend	React.js (with Vite), Tailwind CSS, Zustand (for state management), Axios
DevOps	Concurrently (to run both servers simultaneously)

Export to Sheets
🚀 Getting Started
To get a local copy up and running, follow these steps.

Prerequisites
Node.js (v14 or later)

npm (Node Package Manager)

MongoDB (either local or a cloud instance like MongoDB Atlas)

A Cloudinary account for image storage.

Installation & Setup
Clone the Repository:

Bash

git clone https://github.com/your-username/college-event-management.git
cd college-event-management
Install Backend Dependencies:

Bash

cd backend
npm install
Install Frontend Dependencies:

Bash

cd ../frontend
npm install
Configure Environment Variables:

In the backend directory, create a .env file.

Add the following variables with your credentials:

Code snippet

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Run the Application:

Navigate back to the root event-management-system directory.

The project includes setup scripts to install dependencies and run both servers concurrently.

On Windows:

Bash

setup.bat
On macOS/Linux:

Bash

chmod +x setup.sh
./setup.sh
This will start the backend server on http://localhost:5000 and the frontend React app on http://localhost:5173.

📂 Project Structure
The project is organized into two main folders: frontend and backend.

/
├── backend/
│   ├── src/
│   │   ├── controllers/ (Handles request logic)
│   │   ├── middleware/  (For auth and file uploads)
│   │   ├── models/      (Mongoose schemas)
│   │   ├── routes/      (API endpoints)
│   │   └── utils/       (Cloudinary, PDF generation)
│   └── server.js      (Main server entry point)
│
└── frontend/
    ├── src/
    │   ├── components/  (Reusable React components)
    │   ├── context/     (State management with Zustand)
    │   ├── pages/       (Page-level components)
    │   └── services/    (API call handlers)
    └── main.jsx       (Main React entry point)
