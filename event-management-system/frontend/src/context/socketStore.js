import { create } from 'zustand';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  onlineUsers: [],
  notifications: [],

  // Actions
  initializeSocket: (user) => {
    const { socket: existingSocket } = get();
    
    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.disconnect();
    }

    // Create new socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        userId: user._id,
        userType: user.role,
        userName: user.name,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      set({ isConnected: true });
      
      // Join user-specific room
      socket.emit('join-room', {
        userType: user.role,
        userId: user._id,
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ isConnected: false });
    });

    // Event-related socket events
    socket.on('event-created', (data) => {
      if (user.role === 'student') {
        toast.success(`New event: ${data.eventName}`, {
          duration: 5000,
          icon: '🎉',
        });
        
        get().addNotification({
          id: Date.now(),
          type: 'event-created',
          title: 'New Event Available',
          message: `${data.eventName} has been announced`,
          timestamp: new Date(),
          data: data,
        });
      }
    });

    socket.on('event-updated', (data) => {
      get().addNotification({
        id: Date.now(),
        type: 'event-updated',
        title: 'Event Updated',
        message: `${data.eventName} has been updated`,
        timestamp: new Date(),
        data: data,
      });
    });

    socket.on('event-deleted', (data) => {
      if (user.role === 'student') {
        toast.error(`Event cancelled: ${data.eventName}`, {
          duration: 5000,
        });
      }
    });

    // Registration-related socket events
    socket.on('registration-created', (data) => {
      if (user.role === 'admin') {
        toast.success(`New registration: ${data.userName}`, {
          duration: 4000,
          icon: '📝',
        });
      }
    });

    socket.on('registration-status-updated', (data) => {
      if (data.userId === user._id) {
        const statusMessage = data.status === 'approved' ? 
          'Your registration has been approved!' : 
          'Your registration has been rejected.';
        
        toast[data.status === 'approved' ? 'success' : 'error'](statusMessage, {
          duration: 5000,
        });
        
        get().addNotification({
          id: Date.now(),
          type: 'registration-status',
          title: 'Registration Status Update',
          message: statusMessage,
          timestamp: new Date(),
          data: data,
        });
      }
    });

    // Admin-specific notifications
    if (user.role === 'admin') {
      socket.on('new-registration-notification', (data) => {
        get().addNotification({
          id: Date.now(),
          type: 'new-registration',
          title: 'New Registration',
          message: `${data.userName} registered for ${data.eventName}`,
          timestamp: new Date(),
          data: data,
        });
      });

      socket.on('registration-cancelled-notification', (data) => {
        get().addNotification({
          id: Date.now(),
          type: 'registration-cancelled',
          title: 'Registration Cancelled',
          message: `${data.userName} cancelled registration for ${data.eventName}`,
          timestamp: new Date(),
          data: data,
        });
      });
    }

    // User activity events
    socket.on('user-login', (data) => {
      console.log('User logged in:', data);
    });

    socket.on('user-logout', (data) => {
      console.log('User logged out:', data);
    });

    // Set socket in state
    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: [] });
    }
  },

  // Emit events
  emitEvent: (eventName, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  },

  // Notification management
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep only latest 50
    }));
  },

  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== notificationId),
    }));
  },

  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // Get unread notification count
  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.read).length;
  },

  // Real-time updates
  onEventUpdate: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.on('event-updated', callback);
      socket.on('registration-updated', callback);
    }
  },

  offEventUpdate: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.off('event-updated', callback);
      socket.off('registration-updated', callback);
    }
  },
}));

export { useSocketStore };
