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
  const rawToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined;
  const tokenEnv = (rawToken || '').trim();
  const tokenEnvInvalid = !!tokenEnv && !tokenEnv.startsWith('pk.');
  const [token, setToken] = useState<string>(tokenEnvInvalid ? '' : tokenEnv);
  const [loadingToken, setLoadingToken] = useState<boolean>(!token);
  const tokenMissing = !token;
  const tokenInvalidFormat = !!token && !token.startsWith('pk.'); // Mapbox JS nécessite un token public (pk.)
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const DEFAULT_CENTER: [number, number] = [2.2137, 46.2276]; // France
  const DEFAULT_ZOOM = 5;

  // Fallback: aller chercher un token public via l'Edge Function public-config
  useEffect(() => {
    if (token) { setLoadingToken(false); return; }
    let cancelled = false;
    const fetchToken = async () => {
      try {
        const base = (import.meta as any).env?.VITE_SUPABASE_URL || '';
        if (!base) { setLoadingToken(false); return; }
        const url = `${base}/functions/v1/public-config`;
        const res = await fetch(url);
        const json = await res.json().catch(() => ({}));
        const t = (json?.mapboxToken || '').trim();
        if (!cancelled && t && t.startsWith('pk.')) setToken(t);
      } catch (_) {
        // ignore
      } finally {
        if (!cancelled) setLoadingToken(false);
      }
    };
    fetchToken();
    return () => { cancelled = true; };
  }, [token]);

  const showFallback = tokenMissing || tokenInvalidFormat;

  useEffect(() => {
  if (!mapContainer.current || showFallback) return;

    // Initialize Mapbox
    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      map.current?.remove();
    };
  }, [token, showFallback]);

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
    } else {
      // Aucun point → centrage par défaut
      map.current.setCenter(DEFAULT_CENTER);
      map.current.setZoom(DEFAULT_ZOOM);
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

      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-muted-foreground p-4 text-center max-w-xl">
            {loadingToken ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement de la configuration…</span>
              </div>
            ) : (
              <>
                <p className="mb-2">
                  {tokenMissing
                    ? 'Aucun token Mapbox détecté.'
                    : 'Token Mapbox invalide: utilisez un token public (doit commencer par pk.)'}
                </p>
                <ul className="list-disc text-left ml-6 space-y-1">
                  <li>Créez un token public sur account.mapbox.com (scope public, restreint à votre domaine).</li>
                  <li>Ajoutez-le à votre environnement: VITE_MAPBOX_TOKEN=pk_…</li>
                  <li>En local: créez .env à la racine, puis redémarrez «npm run dev».</li>
                  <li>En prod (Vercel): ajoutez la variable d’environnement VITE_MAPBOX_TOKEN et redeployez.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {!showFallback && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Chargement de la carte...
            </span>
          </div>
        </div>
      )}

      {/* Placeholder si aucune donnée de tracking */}
      {!showFallback && !isLoading && (
        (!missions || missions.length === 0 || missions.every(m => !m.tracking || m.tracking.latitude == null || m.tracking.longitude == null)) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-background/80 text-xs text-muted-foreground shadow">
              En attente de position GPS…
            </div>
          </div>
        )
      )}
    </Card>
  );
};