import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crosshair, Navigation, MapPin, Loader2 } from 'lucide-react';

// Configuration Mapbox via env (fallback: empty)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface RoutePoint {
  coordinates: [number, number];
  address: string;
  type: 'pickup' | 'delivery' | 'current';
}

interface MapUberStyleProps {
  startPoint?: RoutePoint;
  endPoint?: RoutePoint;
  height?: string;
  showRoute?: boolean;
  followUser?: boolean;
  onLocationUpdate?: (coordinates: [number, number]) => void;
  className?: string;
}

// Style Uber personnalisé utilisant un style Mapbox existant
const UBER_STYLE = 'mapbox://styles/mapbox/dark-v11';

export const MapUberStyle: React.FC<MapUberStyleProps> = ({
  startPoint,
  endPoint,
  height = "500px",
  showRoute = true,
  followUser = true,
  onLocationUpdate,
  className = ""
}) => {
  const tokenMissing = !mapboxgl.accessToken;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const startMarker = useRef<mapboxgl.Marker | null>(null);
  const endMarker = useRef<mapboxgl.Marker | null>(null);
  const routeSource = useRef<string>('route');
  
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(followUser);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Afficher un message clair si le token Mapbox est manquant
  if (tokenMissing) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <div style={{ height }} className="w-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground p-4 text-center">
            Aucun token Mapbox détecté. Définissez VITE_MAPBOX_TOKEN dans votre fichier .env puis relancez le serveur.
          </div>
        </div>
      </Card>
    );
  }

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: UBER_STYLE,
      center: [2.3522, 48.8566], // Paris par défaut
      zoom: 12,
      pitch: 0,
      bearing: 0,
      antialias: true,
      maxZoom: 20,
      minZoom: 3
    });

    // Navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-left'
    );

    // Disable rotation
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    map.current.on('load', () => {
      setIsLoading(false);
      
      // Ajouter source pour la route
      if (map.current && !map.current.getSource(routeSource.current)) {
        map.current.addSource(routeSource.current, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        // Style de la route
        if (!map.current.getLayer('route')) {
          map.current.addLayer({
          id: 'route',
          type: 'line',
          source: routeSource.current,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00d4ff',
            'line-width': {
              base: 1.4,
              stops: [[6, 2], [20, 8]]
            },
            'line-opacity': 0.9
          }
          });
        }

        // Effet glow pour la route
        if (!map.current.getLayer('route-glow')) {
          map.current.addLayer({
            id: 'route-glow',
            type: 'line',
            source: routeSource.current,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#00d4ff',
              'line-width': {
                base: 1.4,
                stops: [[6, 6], [20, 16]]
              },
              'line-opacity': 0.3,
              'line-blur': 2
            }
          }, 'route');
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Géolocalisation utilisateur
  const startTracking = useCallback(() => {
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const coordinates: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          setUserLocation(coordinates);
          onLocationUpdate?.(coordinates);

          // Créer/mettre à jour le marker utilisateur
          if (map.current) {
            if (userLocationMarker.current) {
              userLocationMarker.current.setLngLat(coordinates);
            } else {
              // Créer un élément personnalisé pour le marker utilisateur
              const el = document.createElement('div');
              el.className = 'user-location-marker';
              el.style.cssText = `
                width: 20px;
                height: 20px;
                background: #00d4ff;
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.3);
                animation: pulse 2s infinite;
              `;

              userLocationMarker.current = new mapboxgl.Marker({
                element: el,
                anchor: 'center'
              })
                .setLngLat(coordinates)
                .addTo(map.current);
            }

            // Centrer la carte si suivre utilisateur est activé
            if (isFollowingUser) {
              map.current.easeTo({
                center: coordinates,
                duration: 1000
              });
            }
          }
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
      
      setWatchId(id);
    }
  }, []); // Removed dependencies to prevent infinite loop

  // Arrêter le tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, []); // Removed dependencies to prevent infinite loop

  // Démarrer le tracking au montage
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []); // Removed dependencies to prevent infinite loop

  // Ajouter les marqueurs de départ et arrivée
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Nettoyer les anciens marqueurs
    if (startMarker.current) {
      startMarker.current.remove();
      startMarker.current = null;
    }
    if (endMarker.current) {
      endMarker.current.remove();
      endMarker.current = null;
    }

    // Marqueur de départ (vert)
    if (startPoint) {
      const startEl = document.createElement('div');
      startEl.style.cssText = `
        width: 30px;
        height: 30px;
        background: #00ff88;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      `;
      startEl.textContent = 'A';

      startMarker.current = new mapboxgl.Marker({
        element: startEl,
        anchor: 'center'
      })
        .setLngLat(startPoint.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-green-600">Point de départ</h3>
              <p class="text-sm">${startPoint.address}</p>
            </div>
          `)
        )
        .addTo(map.current);
    }

    // Marqueur d'arrivée (rouge)
    if (endPoint) {
      const endEl = document.createElement('div');
      endEl.style.cssText = `
        width: 30px;
        height: 30px;
        background: #ff4444;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      `;
      endEl.textContent = 'B';

      endMarker.current = new mapboxgl.Marker({
        element: endEl,
        anchor: 'center'
      })
        .setLngLat(endPoint.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-red-600">Destination</h3>
              <p class="text-sm">${endPoint.address}</p>
            </div>
          `)
        )
        .addTo(map.current);
    }

    // Ajuster la vue pour inclure tous les points
    if (startPoint && endPoint) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(startPoint.coordinates);
      bounds.extend(endPoint.coordinates);
      if (userLocation) bounds.extend(userLocation);

      map.current.fitBounds(bounds, {
        padding: 80,
        duration: 1000
      });
    }
  }, [startPoint, endPoint, userLocation, isLoading]);

  // Tracer la route
  const drawRoute = useCallback(async () => {
    if (!map.current || !startPoint || !endPoint || !showRoute) return;

    try {
      const base = import.meta.env.VITE_USE_MAPBOX_PROXY ? '/mapbox' : 'https://api.mapbox.com';
      const url = `${base}/directions/v5/mapbox/driving/${startPoint.coordinates[0]},${startPoint.coordinates[1]};${endPoint.coordinates[0]},${endPoint.coordinates[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const query = await fetch(url);
      
      const json = await query.json();
      
      if (json.routes && json.routes[0]) {
        const route = json.routes[0].geometry;
        // Sécurité: re-créer la source si perdue après HMR
        if (map.current && !map.current.getSource(routeSource.current)) {
          map.current.addSource(routeSource.current, {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
          });
        }

        const src = map.current?.getSource(routeSource.current) as mapboxgl.GeoJSONSource | undefined;
        if (src) {
          src.setData({
            type: 'Feature',
            properties: {},
            geometry: route
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la route:', error);
    }
  }, [startPoint, endPoint, showRoute]);

  useEffect(() => {
    if (isLoading || !map.current) return;
    // Si le style n'est pas encore prêt, attendre l'événement 'idle'
    if (!map.current.isStyleLoaded()) {
      const once = () => {
        drawRoute();
        map.current?.off('idle', once);
      };
      map.current.on('idle', once);
      return () => {
        map.current?.off('idle', once);
      };
    }
    drawRoute();
  }, [drawRoute, isLoading]);

  // Centrer sur la position utilisateur
  const centerOnUser = useCallback(() => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 16,
        duration: 1500
      });
      setIsFollowingUser(true);
    }
  }, [userLocation]);

  // Toggle suivi utilisateur
  const toggleFollowUser = useCallback(() => {
    setIsFollowingUser(!isFollowingUser);
  }, [isFollowingUser]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div ref={mapContainer} style={{ height }} className="w-full" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement de la carte...</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {/* Bouton centrer position */}
        <Button
          size="sm"
          onClick={centerOnUser}
          disabled={!userLocation}
          className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black shadow-lg border-0"
        >
          <Crosshair className="h-5 w-5" />
        </Button>

        {/* Bouton toggle suivi */}
        <Button
          size="sm"
          onClick={toggleFollowUser}
          variant={isFollowingUser ? "default" : "outline"}
          className="w-12 h-12 rounded-full shadow-lg"
        >
          <Navigation className={`h-5 w-5 ${isFollowingUser ? 'text-white' : ''}`} />
        </Button>
      </div>

      {/* Info panel */}
      {(startPoint || endPoint) && (
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-black/80 border-gray-700 text-white p-3">
            <div className="space-y-2 text-sm">
              {startPoint && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="truncate">{startPoint.address}</span>
                </div>
              )}
              {endPoint && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="truncate">{endPoint.address}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Styles pour l'animation du marker utilisateur */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 212, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0);
          }
        }
      `}</style>
    </Card>
  );
};