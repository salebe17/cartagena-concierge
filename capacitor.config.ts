import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.cartagenaconcierge.app',
    appName: 'Cartagena Concierge',
    webDir: 'out',
    server: {
        url: 'https://cartagena-concierge-g6tt.vercel.app', // Adjusted to match the specific Vercel project name
        cleartext: true,
        androidScheme: 'https'
    },
    plugins: {
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
    },
};

export default config;
