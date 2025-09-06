// Shims pour permettre au build web de passer lorsque les plugins Capacitor ne sont pas présents
declare module '@capacitor/core' {
  export const Capacitor: {
    isNativePlatform?: () => boolean;
    getPlatform?: () => string;
  };
}

declare module '@capacitor/push-notifications' {
  export const PushNotifications: any;
}

declare module '@capacitor/status-bar' {
  export const StatusBar: any;
  export const Style: any;
}

declare module '@capacitor/splash-screen' {
  export const SplashScreen: any;
}