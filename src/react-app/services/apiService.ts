import config from '../config/environment';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    };

    console.log(`[API Request] ${requestId} ${options.method || 'GET'} ${url}`, {
      endpoint,
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      body: options.body
    });

    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const responseData = await response.text();
      
      console.log(`[API Response] ${requestId} ${response.status} ${response.statusText}`, {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        // Try to parse JSON error response
        try {
          const errorData = JSON.parse(responseData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Keep default error message if JSON parsing fails
        }
        
        const error = new Error(errorMessage);
        console.error(`[API Error] ${requestId}`, {
          endpoint,
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          responseBody: responseData,
          requestBody: options.body,
          traceId: requestId
        });
        throw error;
      }

      return responseData ? JSON.parse(responseData) : {};
    } catch (error) {
      if (error instanceof Error && error.message.includes('API Error:')) {
        throw error; // Re-throw API errors with existing context
      }
      
      // Network or other errors
      console.error(`[Network Error] ${requestId}`, {
        endpoint,
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: requestId
      });
      throw new Error(`Network Error: Failed to connect to ${endpoint} (Trace: ${requestId})`);
    }
  }

  // Guest API methods
  async sendOTP(mobile: string) {
    return this.request('/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOTP(mobile: string, otp: string) {
    return this.request('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  async createLead(leadData: any) {
    return this.request('/api/v1/leads/create', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async getLeadStatus(requestId: string) {
    return this.request(`/api/v1/leads/status/${requestId}`);
  }

  async getCustomerLeadsByMobile(mobile: string) {
    return this.request(`/api/v1/leads/customer/mobile/${mobile}`, {
      method: 'GET',
      credentials: 'include'
    });
  }

  async getGuestHistory(sessionId: string) {
    return this.request(`/api/guest/history/${sessionId}`);
  }

  async validateCustomer(mobile: string, deviceFingerprint: string) {
    return this.request('/api/v1/auth/mobile/check', {
      method: 'POST',
      body: JSON.stringify({ mobile, deviceFingerprint }),
    });
  }

  async createGuestSession(guestData: any) {
    return this.request('/api/guest/create-session', {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  }

  async getCustomerData(mobile: string) {
    return this.request(`/api/customer/data/${mobile}`);
  }

  async createNewCustomer(customerData: any) {
    return this.request('/api/customer/create', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getServiceCategories() {
    return this.request('/api/v1/service-categories');
  }

  async getVehicleTypes() {
    return this.request('/api/v1/vehicle-types');
  }

  async generateLeadId(stateCode?: string) {
    const params = stateCode ? `?stateCode=${encodeURIComponent(stateCode)}` : '';
    return this.request(`/api/v1/generate-lead-id${params}`);
  }

  async verifyOTPEnhanced(mobile: string, otp: string) {
    return this.request('/api/v1/auth/enhanced/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  async loginWithPin(mobile: string, pin: string) {
    return this.request('/api/v1/auth/login-pin', {
      method: 'POST',
      body: JSON.stringify({ mobile, pin }),
      credentials: 'include', // Include cookies
    });
  }

  async saveUserDetails(mobile: string, details: any) {
    return this.request('/api/v1/auth/save-details', {
      method: 'POST',
      body: JSON.stringify({ mobile, ...details }),
    });
  }

  // PIN setup is now handled in saveUserDetails
  async setupPin(mobile: string, pin: string) {
    return this.request('/api/v1/auth/setup-pin', {
      method: 'POST',
      body: JSON.stringify({ mobile, pin }),
      credentials: 'include', // Include cookies
    });
  }

  async logout() {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });
  }

  async checkAuth() {
    return this.request('/api/v1/auth/verify', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
  }

  async getCurrentUser() {
    return this.request('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
  }

  async updateProfile(profileData: any) {
    return this.request('/api/v1/customer/profile/update', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      credentials: 'include', // Include cookies
    });
  }

  async changePin(pinData: { currentPin: string; newPin: string }) {
    return this.request('/api/v1/customer/change-pin', {
      method: 'PUT',
      body: JSON.stringify(pinData),
      credentials: 'include', // Include cookies
    });
  }

  async getSubscriptionPlan(planId: number) {
    return this.request(`/api/v1/customer/subscription-plans/${planId}`, {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
  }

  async getAvailableSubscriptionPlans() {
    return this.request('/api/v1/customer/subscription-plans', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
  }

  async getSettings(group: string) {
    return this.request(`/api/v1/customer/settings/${group}`, {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
  }
}

export const apiService = new ApiService();
export default apiService;