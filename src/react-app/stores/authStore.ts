import { create } from 'zustand';
import apiService from '../services/apiService';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  mobile?: string;
  email?: string;
  profile_picture?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  features: {
    debugMode: boolean;
    guestMode: boolean;
    mobileOtpRegistration: boolean;
    pinLogin: boolean;
    ssoRegistration: boolean;
    socialLogin: boolean;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initAuth: () => void;
  register: (mobile: string) => Promise<{ otp: string }>;
  verifyOTP: (mobile: string, otp: string) => Promise<void>;
  saveUserDetails: (details: any) => Promise<void>;
  setupPIN: (mobile: string, pin: string) => Promise<void>;
  loginWithPIN: (mobile: string, pin: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  features: {
    debugMode: false,
    guestMode: true,
    mobileOtpRegistration: true,
    pinLogin: true,
    ssoRegistration: true,
    socialLogin: true,
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  initAuth: () => {
    // No local storage - user must login each time
    set({ user: null, isAuthenticated: false });
  },
  
  register: async (mobile: string) => {
    set({ isLoading: true, error: null });
    try {
      // Send OTP via backend
      const response = await apiService.sendOTP(mobile);
      
      set({ isLoading: false });
      return { otp: response.otp || '123456' }; // Return OTP for testing
    } catch (error) {
      set({ error: 'Registration failed', isLoading: false });
      throw error;
    }
  },

  verifyOTP: async (mobile: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      // Verify OTP with backend
      await apiService.verifyOTP(mobile, otp);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'OTP verification failed', isLoading: false });
      throw error;
    }
  },

  saveUserDetails: async (details: any) => {
    set({ isLoading: true, error: null });
    try {
      // Save user details to backend
      await apiService.saveUserDetails(details.mobile, details);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to save user details', isLoading: false });
      throw error;
    }
  },

  setupPIN: async (mobile: string, pin: string) => {
    set({ isLoading: true, error: null });
    try {
      // Setup PIN via backend
      const response = await apiService.setupPin(mobile, pin);
      
      // Set user as authenticated with backend response
      const user = {
        id: response.data?.customerId || mobile,
        mobile: mobile,
        first_name: response.data?.firstName || '',
        last_name: response.data?.lastName || ''
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: 'PIN setup failed', isLoading: false });
      throw error;
    }
  },

  loginWithPIN: async (mobile: string, pin: string) => {
    set({ isLoading: true, error: null });
    try {
      // Login with PIN via backend
      const response = await apiService.loginWithPin(mobile, pin);
      
      // Set user as authenticated with backend response
      const user = {
        id: response.data?.customerId || mobile,
        mobile: mobile,
        first_name: response.data?.firstName || '',
        last_name: response.data?.lastName || ''
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));