import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

import { MissionWithTracking } from '@/hooks/useRealTimeTracking';

interface MapboxMapProps {
  missions: MissionWithTracking[];
  onMissionSelect?: (mission: MissionWithTracking) => void;
  height?: string;
  selectedMissionId?: string;
  follow?: boolean;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({ 
  missions, 
  onMissionSelect, 
  height = "400px",
  selectedMissionId,
  follow = false,
}) => {
  const tokenMissing = !(import.meta as any).env?.VITE_MAPBOX_TOKEN;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  if (tokenMissing) {
    return (
      <Card className="relative overflow-hidden">
        <div style={{ height }} className="w-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground p-4 text-center">
            Aucun token Mapbox détecté. Définissez VITE_MAPBOX_TOKEN dans votre fichier .env puis relancez le serveur.
          </div>
        </div>
      </Card>
    );
  }

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566], // Paris center
      zoom: 10
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || isLoading) return;

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasValid = false;

    missions.forEach((mission) => {
      // Marqueur de position actuelle (bleu) si données de tracking
      if (
        mission.tracking?.latitude != null &&
        mission.tracking?.longitude != null
      ) {
        const currentMarker = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([mission.tracking.longitude, mission.tracking.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${mission.title}</h3>
                <p class="text-sm text-muted-foreground">Position actuelle</p>
                <p class="text-sm">Vitesse: ${mission.tracking.speed || 0} km/h</p>
                <p class="text-sm">Dernière MAJ: ${new Date(mission.tracking.last_update).toLocaleTimeString()}</p>
              </div>
            `)
          )
          .addTo(map.current!);

        markersRef.current.push(currentMarker);
        bounds.extend([mission.tracking.longitude, mission.tracking.latitude]);
        hasValid = true;
        currentMarker.getElement().addEventListener('click', () => onMissionSelect?.(mission));
      }
    });

    if (hasValid && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [missions, isLoading, onMissionSelect]);

  // Centrer sur la mission sélectionnée et éventuellement la suivre
  useEffect(() => {
    if (!map.current || isLoading || !selectedMissionId) return;
    const m = missions.find(x => x.id === selectedMissionId);
    if (!m?.tracking?.latitude || !m?.tracking?.longitude) return;
    map.current.flyTo({ center: [m.tracking.longitude, m.tracking.latitude], zoom: 13, essential: true });
  }, [selectedMissionId, isLoading, missions]);

  // Si follow est activé, recadrer à chaque update de la mission sélectionnée
  useEffect(() => {
    if (!map.current || isLoading || !follow || !selectedMissionId) return;
    const m = missions.find(x => x.id === selectedMissionId);
    if (!m?.tracking?.latitude || !m?.tracking?.longitude) return;
    map.current.easeTo({ center: [m.tracking.longitude, m.tracking.latitude], zoom: 13 });
  }, [missions, follow, selectedMissionId, isLoading]);

  return (
    <Card className="relative overflow-hidden">
      <div ref={mapContainer} style={{ height }} className="w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Chargement de la carte...
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};