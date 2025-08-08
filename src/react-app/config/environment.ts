interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'local' | 'dev' | 'production';
  debug: boolean;
  mockOTP: boolean;
  guestMode: boolean;
}

// SET ACTIVE PROFILE HERE
const ACTIVE_PROFILE: 'local' | 'dev' | 'production' = 'local';

const getEnvironment = (): 'local' | 'dev' | 'production' => {
  // Use ACTIVE_PROFILE instead of environment variables
  return ACTIVE_PROFILE;
};

const environmentConfigs: Record<'local' | 'dev' | 'production', EnvironmentConfig> = {
  local: {
    apiBaseUrl: 'http://localhost:8081',
    environment: 'local',
    debug: true,
    mockOTP: true,
    guestMode: false,
  },
  dev: {
    apiBaseUrl: 'https://api-dev.mycalldriver.com',
    environment: 'dev',
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