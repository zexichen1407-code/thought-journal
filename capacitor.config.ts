import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zexichen.thoughtjournal',
  appName: 'Muse',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
};

export default config;
