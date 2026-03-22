import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jesseweigel.battlemath',
  appName: 'Battle Math',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
