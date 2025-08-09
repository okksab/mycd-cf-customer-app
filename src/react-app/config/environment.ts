interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'local' | 'test' | 'production';
  debug: boolean;
  mockOTP: boolean;
  guestMode: boolean;
  googleMapsApiKey: string;
}

const getEnvironment = (): 'local' | 'test' | 'production' => {
  // Use import.meta.env for Vite instead of process.env
  const env = import.meta.env.VITE_APP_ENV as 'local' | 'test' | 'production';
  return env || 'local';
};

const environmentConfigs: Record<'local' | 'test' | 'production', EnvironmentConfig> = {
  local: {
    apiBaseUrl: 'http://localhost:8081',
    environment: 'local',
    debug: true,
    mockOTP: false,
    guestMode: false,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },
  test: {
    apiBaseUrl: 'https://test-api.mycalldriver.com',
    environment: 'test',
    debug: true,
    mockOTP: false,
    guestMode: false,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },
  production: {
    apiBaseUrl: 'https://api.mycalldriver.com',
    environment: 'production',
    debug: false,
    mockOTP: false,
    guestMode: false,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },
};

const currentEnvironment = getEnvironment();
export const config = environmentConfigs[currentEnvironment];

// Debug: Log the current configuration
console.log('Environment Config:', {
  currentEnvironment,
  apiBaseUrl: config.apiBaseUrl,
  debug: config.debug
});

export default config;