interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'local' | 'test' | 'production';
  debug: boolean;
  mockOTP: boolean;
  guestMode: boolean;
}

const getEnvironment = (): 'local' | 'test' | 'production' => {
  // Check Cloudflare environment variable first, then fallback to local
  const env = process.env.REACT_APP_ENV as 'local' | 'test' | 'production';
  return env || 'local';
};

const environmentConfigs: Record<'local' | 'test' | 'production', EnvironmentConfig> = {
  local: {
    apiBaseUrl: 'http://localhost:8081',
    environment: 'local',
    debug: true,
    mockOTP: false,
    guestMode: false,
  },
  test: {
    apiBaseUrl: 'https://api-test.mycalldriver.com',
    environment: 'test',
    debug: true,
    mockOTP: false,
    guestMode: false,
  },
  production: {
    apiBaseUrl: 'https://api.mycalldriver.com',
    environment: 'production',
    debug: false,
    mockOTP: false,
    guestMode: false,
  },
};

const currentEnvironment = getEnvironment();
export const config = environmentConfigs[currentEnvironment];

export default config;