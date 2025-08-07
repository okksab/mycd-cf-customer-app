import { create } from 'zustand';

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
    // Mock initialization - in real app would check localStorage/cookies
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({ user, isAuthenticated: true });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
}));