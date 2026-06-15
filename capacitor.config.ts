import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zexichen.thoughtjournal',
  appName: '思考记录',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
};

export default config;
