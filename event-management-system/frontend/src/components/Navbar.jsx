import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { useSocketStore } from '../context/socketStore';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Calendar, 
  Home, 
  Settings,
  Bell,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, getUnreadCount } = useSocketStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = getUnreadCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, mobile = false }) => {
    const baseClass = mobile 
      ? "block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200"
      : "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200";
    
    const activeClass = isActivePath(to)
      ? "bg-primary-100 text-primary-700"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

    return (
      <Link
        to={to}
        className={`${baseClass} ${activeClass}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 kongu-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Kongu Events</h1>
                <p className="text-xs text-gray-500">Engineering College</p>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">
              <Home className="w-4 h-4 inline mr-1" />
              Home
            </NavLink>
            <NavLink to="/events">
              <Calendar className="w-4 h-4 inline mr-1" />
              Events
            </NavLink>
            
            {isAuthenticated && (
              <NavLink to="/dashboard">
                <Settings className="w-4 h-4 inline mr-1" />
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                      >
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 border-b border-gray-100 last:border-b-0 ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No notifications
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-2 border-t border-gray-200">
                            <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2">
                              View all notifications
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Profile dropdown menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                      >
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Student'}
                          </span>
                        </div>
                        <div className="p-1">
                          <Link
                            to="/profile"
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/" mobile>
                <Home className="w-4 h-4 inline mr-2" />
                Home
              </NavLink>
              <NavLink to="/events" mobile>
                <Calendar className="w-4 h-4 inline mr-2" />
                Events
              </NavLink>
              
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" mobile>
                    <Settings className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/profile" mobile>
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </NavLink>
                  {user.role === 'admin' && (
                    <NavLink to="/admin" mobile>
                      <Settings className="w-4 h-4 inline mr-2" />
                      Admin Panel
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" mobile>
                    Login
                  </NavLink>
                  <NavLink to="/register" mobile>
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
