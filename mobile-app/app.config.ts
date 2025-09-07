import { ExpoConfig } from '@expo/config';

const androidGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.ANDROID_GOOGLE_MAPS_API_KEY ||
  '';

const config: ExpoConfig = {
  name: 'FleetCheck Mobile',
  slug: 'fleetcheck-mobile',
  scheme: 'fleetcheck-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#2563eb',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fleetcheck.mobile',
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Cette application nécessite l'accès à votre localisation pour le suivi des missions en temps réel.",
      NSLocationWhenInUseUsageDescription:
        "Cette application utilise votre localisation pour géolocaliser les photos d'inspection.",
      NSCameraUsageDescription:
        "Cette application a besoin d'accéder à votre appareil photo pour prendre des photos d'état des lieux.",
      NSPhotoLibraryUsageDescription:
        "Cette application peut accéder à vos photos pour les rapports d'inspection.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#2563eb',
    },
    package: 'com.fleetcheck.mobile',
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.CAMERA',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_LOCATION',
      'android.permission.RECORD_AUDIO',
    ],
    config: {
      googleMaps: {
        apiKey: androidGoogleMapsApiKey,
      },
    },
  },
  web: {},
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Cette app a besoin de votre localisation pour le suivi des missions.',
        locationAlwaysPermission:
          "Cette app a besoin de votre localisation en arrière-plan pour le suivi continu.",
        locationWhenInUsePermission:
          'Cette app a besoin de votre localisation pour géolocaliser les photos.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          "Cette app a besoin d'accéder à votre appareil photo pour les photos de mission.",
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          "Cette app accède à vos photos pour les rapports d'inspection.",
        cameraPermission:
          "Cette app utilise l'appareil photo pour les états des lieux.",
      },
    ],
    'expo-font',
  ],
  extra: {
    eas: {
      projectId: '285e2aaa-ce61-4ea0-b3b0-9436588e1e6f',
    },
  },
  owner: 'xcrackz.2',
};

export default config;
