import config from '../config/environment';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Guest API methods
  async sendOTP(mobile: string) {
    if (config.mockOTP) {
      // Mock OTP for testing
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, message: 'OTP sent successfully' });
        }, 1000);
      });
    }
    
    return this.request('/api/guest/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOTP(mobile: string, otp: string) {
    if (config.mockOTP) {
      // Mock OTP verification with 123456
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (otp === '123456') {
            resolve({ success: true, message: 'OTP verified successfully' });
          } else {
            reject(new Error('Invalid OTP'));
          }
        }, 1000);
      });
    }
    
    return this.request('/api/guest/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  async createLead(leadData: any) {
    return this.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async getLeadStatus(requestId: string) {
    return this.request(`/api/leads/${requestId}/status`);
  }

  async getGuestHistory(sessionId: string) {
    return this.request(`/api/guest/history/${sessionId}`);
  }

  async validateCustomer(mobile: string, deviceFingerprint: string) {
    return this.request('/api/auth/mobile/check', {
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
}

export const apiService = new ApiService();
export default apiService;