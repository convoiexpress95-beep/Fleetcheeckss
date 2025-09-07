import { Platform } from 'react-native';

let MapboxGL: any = null;

if (Platform.OS !== 'web') {
  try {
    const m = require('@rnmapbox/maps');
    MapboxGL = m?.default ?? m;
  } catch (e) {
    MapboxGL = null;
  }
}

// Token runtime (Expo public env)
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
if (MapboxGL && typeof MapboxGL.setAccessToken === 'function' && MAPBOX_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}
if (MapboxGL && typeof MapboxGL.setTelemetryEnabled === 'function') {
  MapboxGL.setTelemetryEnabled(false);
}

// Fournir un stub sur web pour éviter les crashs d’import
if (!MapboxGL) {
  MapboxGL = {
    MapView: () => null,
    Camera: () => null,
    PointAnnotation: () => null,
    setAccessToken: () => {},
    setTelemetryEnabled: () => {},
  };
}

export default MapboxGL;
