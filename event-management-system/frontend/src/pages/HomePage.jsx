import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Trophy, 
  ArrowRight, 
  Clock, 
  MapPin,
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import eventService from '../services/eventService';
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch featured events
  const { data: featuredEvents, isLoading } = useQuery(
    'featuredEvents',
    () => eventService.getFeaturedEvents(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch upcoming events
  const { data: upcomingEvents } = useQuery(
    'upcomingEvents', 
    () => eventService.getUpcomingEvents(6)
  );

  // Auto slide for hero section
  useEffect(() => {
    const events = featuredEvents?.data?.events || [];
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % events.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredEvents]);

  const heroEvents = featuredEvents?.data?.events || [];
  const currentEvent = heroEvents[currentSlide];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 kongu-gradient">
          <div className="absolute inset-0 bg-black/30"></div>
          {currentEvent?.posterImage && (
            <img
              src={currentEvent.posterImage.url}
              alt={currentEvent.name}
              className="w-full h-full object-cover opacity-20"
            />
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
              <h1 className="text-5xl md:text-7xl font-bold font-display">
                Kongu Events
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400 ml-3" />
            </div>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Discover amazing events, competitions, and activities at Kongu Engineering College. 
              Join the excitement and showcase your talents!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/events"
                className="btn-kongu text-lg px-8 py-4 inline-flex items-center"
              >
                Explore Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn-secondary text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Join Now
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-effect p-6 rounded-lg"
              >
                <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold">50+</div>
                <div className="text-gray-300">Events Yearly</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-effect p-6 rounded-lg"
              >
                <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold">5000+</div>
                <div className="text-gray-300">Students</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-effect p-6 rounded-lg"
              >
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold">15+</div>
                <div className="text-gray-300">Departments</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Slide indicators */}
        {heroEvents.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Kongu Events?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience seamless event management with real-time updates, easy registration, 
              and comprehensive features designed for students and organizers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card card-hover p-8 text-center"
            >
              <div className="w-16 h-16 kongu-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Easy Registration</h3>
              <p className="text-gray-600">
                Register for events with just a few clicks. Upload payment proofs and track your registrations in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card card-hover p-8 text-center"
            >
              <div className="w-16 h-16 kongu-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Team Collaboration</h3>
              <p className="text-gray-600">
                Form teams easily and participate in group events. Manage team members and coordinate effectively.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card card-hover p-8 text-center"
            >
              <div className="w-16 h-16 kongu-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about registration status, event updates, and important announcements.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-gray-600">
                Don't miss out on these exciting upcoming events
              </p>
            </div>
            <Link
              to="/events?status=upcoming"
              className="btn-primary inline-flex items-center"
            >
              View All
              <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents?.data?.events?.slice(0, 6).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="event-card group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.posterImage?.url || '/api/placeholder/400/200'}
                      alt={event.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`badge ${eventService.getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    {event.registrationFee > 0 && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                        ₹{event.registrationFee}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {eventService.formatEventDate(event.startDate)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        {event.department}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {eventService.getDaysUntilEvent(event.startDate)}
                      </span>
                      <Link
                        to={`/events/${event._id}`}
                        className="btn-primary text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 kongu-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join the Fun?
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              {isAuthenticated 
                ? `Welcome back, ${user?.name}! Explore upcoming events and register now.`
                : 'Create your account today and start participating in amazing events at Kongu Engineering College.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/events"
                    className="btn-kongu bg-white text-primary-600 hover:bg-gray-100"
                  >
                    Browse Events
                  </Link>
                  <Link
                    to="/dashboard"
                    className="btn-secondary border-white text-white hover:bg-white/10"
                  >
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-kongu bg-white text-primary-600 hover:bg-gray-100"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary border-white text-white hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
