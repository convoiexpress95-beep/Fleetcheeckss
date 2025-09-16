import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Mission {
  id: string;
  reference: string;
  title: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  driver_id?: string;
  created_by: string;
}

interface LiveMapProps {
  missions: Mission[];
  onMissionSelect?: (mission: Mission) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ missions, onMissionSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  // Clé API Google Maps venant de l'environnement (ne jamais coder en dur)
  const GOOGLE_MAPS_API_KEY = String((import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY || '');

  useEffect(() => {
    const initMap = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        if (import.meta.env.DEV) {
          console.warn('[LiveMap] VITE_GOOGLE_MAPS_API_KEY manquante. Définissez-la dans .env ou variables Vercel.');
        }
        return; // attendre que la clé soit définie
      }
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
      });

      try {
        await loader.load();
        
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 46.603354, lng: 1.888334 }, // Centre de la France
            zoom: 6,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#1a1a2e' }]
              },
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }]
              },
              {
                featureType: 'all',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#000000' }, { lightness: 13 }]
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.fill',
                stylers: [{ color: '#16213e' }]
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#000000' }, { lightness: 14 }, { weight: 1.4 }]
              },
              {
                featureType: 'landscape',
                elementType: 'all',
                stylers: [{ color: '#08304b' }]
              },
              {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#0c4152' }, { lightness: 5 }]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0b434f' }, { lightness: 25 }]
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0b3d51' }, { lightness: 16 }]
              },
              {
                featureType: 'road.local',
                elementType: 'geometry',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'transit',
                elementType: 'all',
                stylers: [{ color: '#146474' }]
              },
              {
                featureType: 'water',
                elementType: 'all',
                stylers: [{ color: '#021019' }]
              }
            ]
          });

          mapInstanceRef.current = map;
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de Google Maps:', error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();

    // Créer des marqueurs pour chaque mission
    missions.forEach((mission, index) => {
      // Marqueur de départ
      geocoder.geocode({ address: mission.pickup_address + ', France' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const pickupMarker = new google.maps.Marker({
            position: results[0].geometry.location,
            map: mapInstanceRef.current,
            title: `Départ: ${mission.title}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#10B981" stroke="#fff" stroke-width="2"/>
                  <circle cx="16" cy="16" r="6" fill="#fff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
            }
          });

          const pickupInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="color: #000; padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937;">${mission.title}</h3>
                <p style="margin: 0; color: #6b7280;"><strong>Départ:</strong> ${mission.pickup_address}</p>
                <p style="margin: 4px 0 0 0; color: #6b7280;"><strong>Réf:</strong> ${mission.reference}</p>
              </div>
            `
          });

          pickupMarker.addListener('click', () => {
            pickupInfoWindow.open(mapInstanceRef.current, pickupMarker);
            onMissionSelect?.(mission);
          });

          markersRef.current.push(pickupMarker);
          bounds.extend(results[0].geometry.location);
          
          if (markersRef.current.length === missions.length * 2) {
            mapInstanceRef.current?.fitBounds(bounds);
          }
        }
      });

      // Marqueur d'arrivée
      geocoder.geocode({ address: mission.delivery_address + ', France' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const deliveryMarker = new google.maps.Marker({
            position: results[0].geometry.location,
            map: mapInstanceRef.current,
            title: `Arrivée: ${mission.title}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="#fff" stroke-width="2"/>
                  <circle cx="16" cy="16" r="6" fill="#fff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
            }
          });

          const deliveryInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="color: #000; padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937;">${mission.title}</h3>
                <p style="margin: 0; color: #6b7280;"><strong>Arrivée:</strong> ${mission.delivery_address}</p>
                <p style="margin: 4px 0 0 0; color: #6b7280;"><strong>Statut:</strong> ${mission.status}</p>
              </div>
            `
          });

          deliveryMarker.addListener('click', () => {
            deliveryInfoWindow.open(mapInstanceRef.current, deliveryMarker);
            onMissionSelect?.(mission);
          });

          markersRef.current.push(deliveryMarker);
          bounds.extend(results[0].geometry.location);
          
          if (markersRef.current.length === missions.length * 2) {
            mapInstanceRef.current?.fitBounds(bounds);
          }
        }
      });
    });
  }, [missions, isLoaded, onMissionSelect]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {(!isLoaded || !GOOGLE_MAPS_API_KEY) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            {GOOGLE_MAPS_API_KEY
              ? <p>Chargement de la carte...</p>
              : (
                <div>
                  <p className="mb-1">Clé Google Maps manquante.</p>
                  <p className="text-white/70 text-sm">Définissez VITE_GOOGLE_MAPS_API_KEY dans votre .env (ou variables Vercel) puis relancez.</p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};