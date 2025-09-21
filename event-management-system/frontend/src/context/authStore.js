import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authService.login(credentials);
          
          if (response.success) {
            const { user, token } = response.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Set token for future requests
            authService.setAuthToken(token);
            
            toast.success(`Welcome back, ${user.name}!`);
            return { success: true, user };
          } else {
            set({ isLoading: false });
            toast.error(response.message || 'Login failed');
            return { success: false, message: response.message };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await authService.register(userData);
          
          if (response.success) {
            const { user, token } = response.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Set token for future requests
            authService.setAuthToken(token);
            
            toast.success('Account created successfully!');
            return { success: true, user };
          } else {
            set({ isLoading: false });
            toast.error(response.message || 'Registration failed');
            return { success: false, message: response.message };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          // Call logout API to clean up server-side
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local state regardless of API call result
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          // Clear token from requests
          authService.setAuthToken(null);
          
          toast.success('Logged out successfully');
        }
      },

      updateProfile: async (profileData) => {
        try {
          const response = await authService.updateProfile(profileData);
          
          if (response.success) {
            set((state) => ({
              user: { ...state.user, ...response.data.user },
            }));
            
            toast.success('Profile updated successfully!');
            return { success: true, user: response.data.user };
          } else {
            toast.error(response.message || 'Profile update failed');
            return { success: false, message: response.message };
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Profile update failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      changePassword: async (passwordData) => {
        try {
          const response = await authService.changePassword(passwordData);
          
          if (response.success) {
            toast.success('Password changed successfully!');
            return { success: true };
          } else {
            toast.error(response.message || 'Password change failed');
            return { success: false, message: response.message };
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Password change failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      initializeAuth: async () => {
        try {
          const { token } = get();
          
          if (token) {
            // Set token for requests
            authService.setAuthToken(token);
            
            // Verify token with server
            const response = await authService.verifyToken();
            
            if (response.success) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Token is invalid, clear it
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
              authService.setAuthToken(null);
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear invalid auth data
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          authService.setAuthToken(null);
        }
      },

      refreshUser: async () => {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            set((state) => ({
              user: { ...state.user, ...response.data.user },
            }));
          }
        } catch (error) {
          console.error('Refresh user error:', error);
        }
      },

      // Utility functions
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isStudent: () => {
        const { user } = get();
        return user?.role === 'student';
      },
    }),
    {
      name: 'kongu-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
