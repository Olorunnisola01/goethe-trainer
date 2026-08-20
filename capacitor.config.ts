import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goethetrainer.app',
  appName: 'Goethe Trainer',
  webDir: 'out',
  server: {
    url: 'https://personal-german-trainer.web.app',
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
