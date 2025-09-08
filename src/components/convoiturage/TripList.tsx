import { TripCard, Trip } from "@/components/convoiturage/TripCard";
import { useConvoiturage, type SearchParams } from "@/hooks/useConvoiturage";
import { useToast } from "@/hooks/use-toast";

export function TripList({ filters }: { filters?: SearchParams }) {
  const { rides, loading, reserveRide } = useConvoiturage(filters);
  const { toast } = useToast();

  const trips: Trip[] = (rides || []).map((r) => ({
    id: r.id,
    departure: r.departure,
    destination: r.destination,
    departureTime: new Date(r.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    duration: r.duration_minutes ? `${Math.floor(r.duration_minutes/60)}h ${r.duration_minutes%60}min` : '-',
    price: Number(r.price),
    availableSeats: r.seats_available,
    route: r.route || [],
    driver: {
      id: r.driver_id,
      name: 'Conducteur',
      avatar: undefined,
      rating: 5,
      reviewCount: 0,
      isVerified: true,
    },
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Trajets disponibles
        </h2>
        <div className="text-sm text-muted-foreground">
          {loading ? 'Chargement…' : `${trips.length} trajets trouvés`}
        </div>
      </div>
      
      <div className="space-y-4">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onReserve={async () => {
              try {
                await reserveRide(trip.id, 1);
                toast({ title: "Demande envoyée", description: "Votre réservation est en attente de confirmation." });
              } catch (e: any) {
                toast({ title: "Erreur", description: e?.message || "Impossible de réserver", variant: "destructive" });
              }
            }}
          />
        ))}
        {!loading && trips.length === 0 && (
          <div className="text-sm text-muted-foreground">Aucun trajet pour le moment.</div>
        )}
      </div>
    </div>
  );
}
