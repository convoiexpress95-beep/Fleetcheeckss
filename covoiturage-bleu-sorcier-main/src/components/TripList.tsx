import { TripCard } from "./TripCard";
import { useMemo } from "react";
import { useRidesList } from "@/hooks/useRides";

export function TripList() {
  // TODO: recevoir les filtres depuis SearchForm via contexte/props si besoin
  const { data, isLoading } = useRidesList(undefined, 30);

  const trips = useMemo(() => {
    return (data || []).map((r) => {
      const dt = (() => {
        try { return new Date(r.departure_time); } catch { return null; }
      })();
      const departureTime = dt ? dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
      const duration = r.duration_minutes ? `${Math.floor(r.duration_minutes/60)}h ${r.duration_minutes%60}min` : "";
      const availableSeats = typeof r.seats_available === 'number' ? r.seats_available : r.seats_total; 
      const driverName = r.driver_profile?.display_name || 'Conducteur';
      return {
        id: r.id,
        departure: r.departure,
        destination: r.destination,
        departureTime,
        duration,
        price: Number(r.price || 0),
        availableSeats,
        route: Array.isArray(r.route) ? r.route : [],
        driver: {
          id: r.driver_id,
          name: driverName,
          avatar: r.driver_profile?.avatar_url || undefined,
          rating: 5,
          reviewCount: 0,
          isVerified: !!r.driver_profile?.is_convoyeur_confirme,
        },
      };
    });
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Trajets disponibles
        </h2>
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'Chargement…' : `${trips.length} trajets trouvés`}
        </div>
      </div>
      
      <div className="space-y-4">
        {!isLoading && trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}