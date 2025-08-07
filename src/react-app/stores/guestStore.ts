import { create } from 'zustand';

interface GuestData {
  firstName: string;
  lastName: string;
  mobile: string;
  sessionId?: string;
}

interface GuestState {
  isSessionActive: boolean;
  currentStep: number;
  guestData: GuestData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initiateGuestSession: (data: GuestData) => Promise<void>;
  verifyGuestOTP: (mobile: string, otp: string) => Promise<void>;
  goToStep: (step: number) => void;
  initGuestSession: () => void;
  clearGuestSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGuestStore = create<GuestState>((set, get) => ({
  isSessionActive: false,
  currentStep: 1,
  guestData: null,
  isLoading: false,
  error: null,

  initiateGuestSession: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call - in real app would call backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sessionData = {
        ...data,
        sessionId: `guest_${Date.now()}`
      };
      
      set({
        guestData: sessionData,
        isSessionActive: true,
        currentStep: 2,
        isLoading: false
      });
      
      // Save to localStorage
      localStorage.setItem('guestSession', JSON.stringify(sessionData));
    } catch (error) {
      set({ 
        error: 'Failed to initiate guest session', 
        isLoading: false 
      });
      throw error;
    }
  },

  verifyGuestOTP: async (mobile, otp) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock OTP verification - in real app would call backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp !== '123456') {
        throw new Error('Invalid OTP');
      }
      
      set({
        currentStep: 3,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'OTP verification failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  goToStep: (step) => set({ currentStep: step }),

  initGuestSession: () => {
    const savedSession = localStorage.getItem('guestSession');
    if (savedSession) {
      try {
        const guestData = JSON.parse(savedSession);
        set({
          guestData,
          isSessionActive: true,
          currentStep: 3 // Assume verified if session exists
        });
      } catch (error) {
        console.error('Failed to parse guest session:', error);
        localStorage.removeItem('guestSession');
      }
    }
  },

  clearGuestSession: () => {
    localStorage.removeItem('guestSession');
    set({
      isSessionActive: false,
      currentStep: 1,
      guestData: null,
      error: null
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));