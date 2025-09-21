import api from './api';

class EventService {
  // Get all events with filters and pagination
  async getEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/events?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single event by ID
  async getEventById(eventId) {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get events by status
  async getEventsByStatus(status, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/events/status/${status}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get events by department
  async getEventsByDepartment(department, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/events/department/${department}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search events
  async searchEvents(searchQuery, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', searchQuery);
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/events/search?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's registered events
  async getUserRegisteredEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/events/user/registered?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get event statistics
  async getEventStats(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming events (convenience method)
  async getUpcomingEvents(limit = 6) {
    try {
      return await this.getEventsByStatus('upcoming', { limit });
    } catch (error) {
      throw error;
    }
  }

  // Get ongoing events (convenience method)
  async getOngoingEvents(limit = 6) {
    try {
      return await this.getEventsByStatus('ongoing', { limit });
    } catch (error) {
      throw error;
    }
  }

  // Get featured events for homepage
  async getFeaturedEvents() {
    try {
      return await this.getEvents({ 
        limit: 3, 
        sortBy: 'startDate', 
        sortOrder: 'asc',
        status: 'upcoming'
      });
    } catch (error) {
      throw error;
    }
  }

  // Get events by multiple departments
  async getEventsByDepartments(departments = [], params = {}) {
    try {
      const promises = departments.map(dept => 
        this.getEventsByDepartment(dept, { ...params, limit: 10 })
      );
      
      const results = await Promise.all(promises);
      
      // Combine and deduplicate events
      const allEvents = [];
      const eventIds = new Set();
      
      results.forEach(result => {
        if (result.success && result.data.events) {
          result.data.events.forEach(event => {
            if (!eventIds.has(event._id)) {
              eventIds.add(event._id);
              allEvents.push(event);
            }
          });
        }
      });
      
      // Sort by start date
      allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      return {
        success: true,
        data: {
          events: allEvents,
          totalEvents: allEvents.length
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if event registration is open
  isRegistrationOpen(event) {
    if (!event) return false;
    
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    
    return (
      event.status === 'upcoming' &&
      event.isActive &&
      now <= deadline &&
      (!event.maxParticipants || event.registrationCount < event.maxParticipants)
    );
  }

  // Get event status color class
  getStatusColor(status) {
    const colors = {
      upcoming: 'status-upcoming',
      ongoing: 'status-ongoing',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return colors[status] || 'status-upcoming';
  }

  // Format event date for display
  formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculate days until event
  getDaysUntilEvent(eventDate) {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past event';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  }

  // Get event categories/departments
  async getEventCategories() {
    try {
      // This would typically come from the backend
      // For now, return common departments at Kongu
      return {
        success: true,
        data: [
          'Computer Science and Engineering',
          'Electronics and Communication Engineering',
          'Mechanical Engineering',
          'Electrical and Electronics Engineering',
          'Civil Engineering',
          'Information Technology',
          'Biomedical Engineering',
          'Textile Technology',
          'Fashion Technology',
          'MBA',
          'MCA',
          'General'
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  // Share event via WhatsApp
  shareEventWhatsApp(event) {
    const message = `🎉 Check out this event: ${event.name}\n\n📅 Date: ${this.formatEventDate(event.startDate)}\n📍 Venue: ${event.venue}\n\nRegister now: ${window.location.origin}/events/${event._id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Copy event link to clipboard
  async copyEventLink(eventId) {
    const link = `${window.location.origin}/events/${eventId}`;
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Failed to copy link:', error);
      return false;
    }
  }
}

export default new EventService();
