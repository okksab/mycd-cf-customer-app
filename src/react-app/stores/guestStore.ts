import { create } from 'zustand';
import apiService from '../services/apiService';

interface GuestData {
  firstName: string;
  lastName: string;
  mobile: string;
  location?: string;
  sessionId?: string;
}

interface GuestRequest {
  id: string;
  requestId: string;
  service: string;
  fromLocation: string;
  toLocation?: string;
  status: string;
  createdAt: string;
  amount?: number;
}

interface GuestState {
  isSessionActive: boolean;
  currentStep: number;
  guestData: GuestData | null;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
  deviceFingerprint: string | null;
  requests: GuestRequest[];
  
  // Actions
  initiateGuestSession: (data: GuestData) => Promise<void>;
  verifyGuestOTP: (mobile: string, otp: string) => Promise<void>;
  goToStep: (step: number) => void;
  initGuestSession: () => void;
  clearGuestSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRequest: (request: GuestRequest) => void;
  getRequestById: (id: string) => GuestRequest | undefined;
}

const generateDeviceFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillText('fingerprint', 10, 10);
    }
    const fingerprint = (canvas.toDataURL() + navigator.userAgent + screen.width + screen.height);
    return btoa(fingerprint).slice(0, 32);
  } catch (error) {
    // Fallback fingerprint
    return btoa(navigator.userAgent + Date.now().toString()).slice(0, 32);
  }
};

export const useGuestStore = create<GuestState>((set, get) => ({
  isSessionActive: false,
  currentStep: 1,
  guestData: null,
  isLoading: false,
  error: null,
  sessionExpiry: null,
  deviceFingerprint: null,
  requests: [],

  initiateGuestSession: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      // Validate customer with device fingerprint
      const validation = await apiService.validateCustomer(data.mobile, deviceFingerprint);
      
      if (validation && validation.exists) {
        if (validation.otpValidFor30Days) {
          // Skip OTP, directly get customer data
          const customerData = await apiService.getCustomerData(data.mobile);
          
          const sessionData = {
            guestData: {
              ...data,
              ...customerData,
              sessionId: validation.sessionId
            },
            sessionExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
            deviceFingerprint,
            requests: customerData.previousRequests || []
          };
          
          localStorage.setItem('guestSession', JSON.stringify(sessionData));
          
          set({
            guestData: sessionData.guestData,
            isSessionActive: true,
            currentStep: 4, // Skip to lead form
            sessionExpiry: sessionData.sessionExpiry,
            deviceFingerprint,
            requests: sessionData.requests,
            isLoading: false
          });
          return;
        }
      }
      
      // Send OTP (for new users or users needing re-verification)
      await apiService.sendOTP(data.mobile);
      
      const sessionData = {
        ...data,
        deviceFingerprint,
        isNewCustomer: !validation || !validation.exists
      };
      
      set({
        guestData: sessionData,
        isSessionActive: false,
        currentStep: 2,
        deviceFingerprint,
        isLoading: false
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to validate customer', 
        isLoading: false 
      });
      throw error;
    }
  },

  verifyGuestOTP: async (mobile, otp) => {
    set({ isLoading: true, error: null });
    
    try {
      // Verify OTP with backend
      await apiService.verifyOTP(mobile, otp);
      
      const sessionExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
      const currentData = get().guestData;
      const deviceFingerprint = get().deviceFingerprint || generateDeviceFingerprint();
      
      let customerData;
      
      if (currentData && currentData.isNewCustomer) {
        // Create new customer
        customerData = await apiService.createNewCustomer({
          mobile,
          deviceFingerprint,
          firstName: currentData.firstName || '',
          lastName: currentData.lastName || '',
          location: currentData.location || ''
        });
      } else {
        // Get existing customer data
        customerData = await apiService.getCustomerData(mobile);
      }
      
      if (!customerData) {
        throw new Error('Failed to retrieve customer data');
      }
      
      const sessionData = {
        guestData: {
          ...currentData,
          ...customerData,
          sessionId: customerData.sessionId
        },
        sessionExpiry,
        deviceFingerprint,
        requests: customerData.previousRequests || []
      };
      
      localStorage.setItem('guestSession', JSON.stringify(sessionData));
      
      set({
        currentStep: 3,
        isSessionActive: true,
        sessionExpiry,
        deviceFingerprint,
        guestData: sessionData.guestData,
        requests: sessionData.requests,
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
        const sessionData = JSON.parse(savedSession);
        if (sessionData.sessionExpiry && sessionData.sessionExpiry > Date.now()) {
          set({
            guestData: sessionData.guestData,
            isSessionActive: true,
            sessionExpiry: sessionData.sessionExpiry,
            deviceFingerprint: sessionData.deviceFingerprint,
            requests: sessionData.requests || [],
            currentStep: 3
          });
        } else {
          localStorage.removeItem('guestSession');
        }
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
      error: null,
      sessionExpiry: null,
      deviceFingerprint: null,
      requests: []
    });
  },

  addRequest: (request) => {
    const state = get();
    const currentRequests = Array.isArray(state.requests) ? state.requests : [];
    const updatedRequests = [...currentRequests, request];
    
    try {
      const sessionData = {
        guestData: state.guestData,
        sessionExpiry: state.sessionExpiry,
        deviceFingerprint: state.deviceFingerprint,
        requests: updatedRequests
      };
      localStorage.setItem('guestSession', JSON.stringify(sessionData));
      set({ requests: updatedRequests });
    } catch (error) {
      console.error('Failed to save request:', error);
    }
  },

  getRequestById: (id) => {
    const state = get();
    if (!state.requests || !Array.isArray(state.requests)) {
      return undefined;
    }
    return state.requests.find(req => req && req.requestId === id);
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export type { GuestData, GuestRequest };