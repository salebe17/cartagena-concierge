import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.cartagenaconcierge.app',
    appName: 'Cartagena Concierge',
    webDir: 'out',
    server: {
        url: 'https://cartagena-concierge.vercel.app', // IMPORTANT: Change this to your actual Vercel URL
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
