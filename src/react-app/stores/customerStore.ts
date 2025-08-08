import { create } from 'zustand';
import apiService from '../services/apiService';

interface CustomerData {
  firstName: string;
  lastName: string;
  mobile: string;
  location?: string;
  sessionId?: string;
  showLoginLink?: boolean;
  loginMessage?: string;
  linkText?: string;
  isNewCustomer?: boolean;
  deviceFingerprint?: string;
}

interface CustomerRequest {
  id: string;
  requestId: string;
  service: string;
  fromLocation: string;
  toLocation?: string;
  status: string;
  createdAt: string;
  amount?: number;
}

interface CustomerState {
  isSessionActive: boolean;
  currentStep: number;
  customerData: CustomerData | null;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
  deviceFingerprint: string | null;
  requests: CustomerRequest[];
  
  // Actions
  initiateCustomerSession: (data: CustomerData) => Promise<void>;
  verifyCustomerOTP: (mobile: string, otp: string) => Promise<void>;
  loginWithPin: (mobile: string, pin: string) => Promise<void>;
  goToStep: (step: number) => void;
  initCustomerSession: () => void;
  clearCustomerSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRequest: (request: CustomerRequest) => void;
  getRequestById: (id: string) => CustomerRequest | undefined;
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

export const useCustomerStore = create<CustomerState>((set, get) => ({
  isSessionActive: false,
  currentStep: 1,
  customerData: null,
  isLoading: false,
  error: null,
  sessionExpiry: null,
  deviceFingerprint: null,
  requests: [],

  initiateCustomerSession: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      // Check mobile registration status
      const response = await apiService.validateCustomer(data.mobile, deviceFingerprint) as any;
      
      if (response.success && response.data) {
        const checkResult = response.data;
        
        if (checkResult.action === 'SHOW_LOGIN_LINK') {
          // Customer exists with recent login - show login option
          set({
            customerData: {
              ...data,
              deviceFingerprint,
              showLoginLink: true,
              loginMessage: checkResult.message,
              linkText: checkResult.linkText
            },
            isSessionActive: false,
            currentStep: 1, // Stay on first step but show login link
            deviceFingerprint,
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
        isNewCustomer: !response.data?.customerExists
      };
      
      set({
        customerData: sessionData,
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

  verifyCustomerOTP: async (mobile, otp) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentData = get().customerData;
      const deviceFingerprint = get().deviceFingerprint || generateDeviceFingerprint();
      
      // Verify OTP with enhanced auth service
      const response = await apiService.verifyOTPEnhanced(mobile, otp) as any;
      
      if (response.success && response.data) {
        const sessionExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
        
        const sessionData = {
          customerData: {
            mobile,
            firstName: currentData?.firstName || '',
            lastName: currentData?.lastName || '',
            location: currentData?.location || '',
            sessionId: response.data.token,
            isNewCustomer: currentData?.isNewCustomer
          },
          sessionExpiry,
          deviceFingerprint,
          requests: []
        };
        
        localStorage.setItem('customerSession', JSON.stringify(sessionData));
        
        set({
          currentStep: 3,
          isSessionActive: true,
          sessionExpiry,
          deviceFingerprint,
          customerData: sessionData.customerData,
          isLoading: false
        });
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'OTP verification failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  goToStep: (step) => set({ currentStep: step }),

  initCustomerSession: () => {
    const savedSession = localStorage.getItem('customerSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        if (sessionData.sessionExpiry && sessionData.sessionExpiry > Date.now()) {
          set({
            customerData: sessionData.customerData,
            isSessionActive: true,
            sessionExpiry: sessionData.sessionExpiry,
            deviceFingerprint: sessionData.deviceFingerprint,
            requests: sessionData.requests || [],
            currentStep: 3
          });
        } else {
          localStorage.removeItem('customerSession');
        }
      } catch (error) {
        console.error('Failed to parse customer session:', error);
        localStorage.removeItem('customerSession');
      }
    }
  },

  clearCustomerSession: () => {
    localStorage.removeItem('customerSession');
    set({
      isSessionActive: false,
      currentStep: 1,
      customerData: null,
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
        customerData: state.customerData,
        sessionExpiry: state.sessionExpiry,
        deviceFingerprint: state.deviceFingerprint,
        requests: updatedRequests
      };
      localStorage.setItem('customerSession', JSON.stringify(sessionData));
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

  loginWithPin: async (mobile, pin) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.loginWithPin(mobile, pin) as any;
      
      if (response.success && response.data) {
        const sessionExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
        const deviceFingerprint = get().deviceFingerprint || generateDeviceFingerprint();
        
        const sessionData = {
          customerData: {
            mobile,
            firstName: response.data.customer.firstName || '',
            lastName: response.data.customer.lastName || '',
            location: response.data.customer.cityPincode || '',
            sessionId: response.data.token
          },
          sessionExpiry,
          deviceFingerprint,
          requests: []
        };
        
        localStorage.setItem('customerSession', JSON.stringify(sessionData));
        
        set({
          customerData: sessionData.customerData,
          isSessionActive: true,
          currentStep: 4, // Go to lead form
          sessionExpiry,
          deviceFingerprint,
          isLoading: false
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

}));

export type { CustomerData, CustomerRequest };