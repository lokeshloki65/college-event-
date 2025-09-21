import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { useSocketStore } from './context/socketStore';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import RegisterEventPage from './pages/RegisterEventPage';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminUsers from './pages/admin/AdminUsers';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const { user, isLoading, initializeAuth } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    // Initialize authentication
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (user) {
      initializeSocket(user);
    } else {
      disconnectSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [user, initializeSocket, disconnectSocket]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="events/new" element={<AdminEventForm />} />
                <Route path="events/edit/:id" element={<AdminEventForm />} />
                <Route path="events/:id/registrations" element={<AdminRegistrations />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
        } />

        {/* Public and Student Routes */}
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                
                {/* Auth Routes - redirect if already logged in */}
                <Route 
                  path="/login" 
                  element={user ? <Navigate to="/" replace /> : <LoginPage />} 
                />
                <Route 
                  path="/register" 
                  element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
                />

                {/* Protected Student Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                <Route path="/events/:id/register" element={
                  <ProtectedRoute>
                    <RegisterEventPage />
                  </ProtectedRoute>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
