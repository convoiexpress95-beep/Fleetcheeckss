import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Euro, 
  Car,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Eye
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import type { RideRow } from "@/hooks/useRides";
import { useRideReservationActions } from "@/hooks/useRideReservationActions";

type RideReservationRow = {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  price_at_booking: number;
  created_at: string;
};
type PublishedRide = RideRow & { reservations: RideReservationRow[] };
type MyReservation = RideReservationRow & { ride?: RideRow };

const MyTrips = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState<PublishedRide[]>([]);
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const { accept, reject, cancel, loading: actLoading } = useRideReservationActions();

  useEffect(()=>{
    let cancelled = false;
    (async()=>{
      if(!user){ setLoading(false); return; }
      setLoading(true);
      try{
        // Mes trajets publiés
        const rRides = await supabase.from('rides').select('*').eq('driver_id', user.id).order('departure_time', { ascending: false });
        const rides = (rRides.data||[]) as RideRow[];
        const rideIds = rides.map(r=>r.id);
        let resByRide: Record<string, RideReservationRow[]> = {};
        if(rideIds.length){
          const rRes = await supabase.from('ride_reservations').select('id, ride_id, passenger_id, seats, status, created_at, price_at_booking').in('ride_id', rideIds);
          const arr = (rRes.data||[]) as RideReservationRow[];
          resByRide = arr.reduce<Record<string, RideReservationRow[]>>((acc, r)=>{ (acc[r.ride_id] ||= []).push(r); return acc; }, {});
        }
        const withAgg: PublishedRide[] = rides.map(r => ({
          ...(r as RideRow),
          reservations: resByRide[r.id] || [],
        }));

        // Mes réservations
        const rMine = await supabase.from('ride_reservations').select('id, ride_id, seats, status, price_at_booking, created_at').eq('passenger_id', user.id).order('created_at', { ascending: false });
        const myRes = (rMine.data||[]) as RideReservationRow[];
        let rideMap: Record<string, RideRow> = {};
        if(myRes.length){
          const ids = Array.from(new Set(myRes.map(r=>r.ride_id)));
          const rR = await supabase.from('rides').select('*').in('id', ids);
          rideMap = Object.fromEntries(((rR.data||[]) as RideRow[]).map((r: RideRow)=>[r.id, r]));
        }
        const resWithRide: MyReservation[] = myRes.map(r => ({ ...r, ride: rideMap[r.ride_id] }));

        if(!cancelled){
          setPublished(withAgg);
          setReservations(resWithRide);
        }
      } finally {
        if(!cancelled) setLoading(false);
      }
    })();
    return ()=>{ cancelled = true; };
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Actif</Badge>;
      case "confirmed":
        return <Badge variant="default" className="bg-green-500">Confirmé</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "completed":
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Mes trajets
              </h1>
              <p className="text-muted-foreground">
                Gérez vos trajets publiés et vos réservations
              </p>
            </div>
            <Button variant="hero" className="flex items-center gap-2" asChild>
              <Link to="/publish">
                <Plus className="w-4 h-4" />
                Publier un trajet
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="published" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="published">Mes trajets publiés</TabsTrigger>
              <TabsTrigger value="reservations">Mes réservations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="published" className="space-y-4 mt-6">
              {(published.length === 0 && !loading) ? (
                <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                  <CardContent className="p-8 text-center">
                    <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucun trajet publié
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez à partager vos trajets avec la communauté
                    </p>
                    <Button variant="hero" asChild>
                      <Link to="/publish">
                        <Plus className="w-4 h-4 mr-2" />
                        Publier mon premier trajet
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                published.map((trip) => {
                  const dt = (()=>{ try{ return new Date(trip.departure_time); }catch{ return null; } })();
                  const date = dt ? dt.toLocaleDateString('fr-FR') : '';
                  const time = dt ? dt.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '';
                  const availableSeats = typeof trip.seats_available === 'number' ? trip.seats_available : trip.seats_total;
                  return (
                  <Card key={trip.id} className="glass backdrop-blur-lg border border-border/50 shadow-card hover-glow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">{trip.departure}</span>
                            </div>
                            <div className="w-6 h-px bg-border"></div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">{trip.destination}</span>
                            </div>
                            {getStatusBadge(trip.status)}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {availableSeats}/{trip.seats_total} places
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="w-4 h-4" />
                              {trip.price}€
                            </div>
                          </div>

                          {(trip.reservations?.length || 0) > 0 && (
                            <div>
                              <div className="text-sm font-medium text-foreground mb-2">
                                Passagers ({trip.reservations.length})
                              </div>
                              <div className="flex items-center gap-2">
                                {trip.reservations.map((reservation: RideReservationRow) => (
                                  <div key={reservation.id} className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={undefined} />
                                      <AvatarFallback className="text-xs">
                                        {"P"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                      {reservation.passenger_id?.slice(0,6)}…
                                    </span>
                                    {reservation.status === 'pending' && (
                                      <div className="flex items-center gap-1">
                                        <Button variant="outline" size="sm" disabled={!!actLoading} onClick={async ()=>{
                                          const { error } = await accept(reservation.id, user!.id);
                                          if(!error){
                                            setPublished(prev => prev.map(pr => pr.id === trip.id ? { ...pr, reservations: pr.reservations.map(r => r.id === reservation.id ? { ...r, status: 'accepted' } : r) } : pr));
                                          }
                                        }}>✓</Button>
                                        <Button variant="outline" size="sm" disabled={!!actLoading} onClick={async ()=>{
                                          const { error } = await reject(reservation.id, user!.id);
                                          if(!error){
                                            setPublished(prev => prev.map(pr => pr.id === trip.id ? { ...pr, reservations: pr.reservations.map(r => r.id === reservation.id ? { ...r, status: 'rejected' } : r) } : pr));
                                          }
                                        }}>✕</Button>
                                      </div>
                                    )}
                                    {reservation.status === 'accepted' && (
                                      <Button variant="outline" size="sm" disabled={!!actLoading} onClick={async ()=>{
                                        const { error } = await cancel(reservation.id, user!.id);
                                        if(!error){
                                          setPublished(prev => prev.map(pr => pr.id === trip.id ? { ...pr, reservations: pr.reservations.map(r => r.id === reservation.id ? { ...r, status: 'cancelled' } : r) } : pr));
                                        }
                                      }}>Annuler</Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 lg:w-auto">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/trip/${trip.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/messages`}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Messages
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );})
              )}
            </TabsContent>
            
            <TabsContent value="reservations" className="space-y-4 mt-6">
              {(reservations.length === 0 && !loading) ? (
                <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucune réservation
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Recherchez et réservez votre prochain trajet
                    </p>
                    <Button variant="hero">
                      Rechercher un trajet
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                reservations.map((reservation: MyReservation) => {
                  const ride = reservation.ride;
                  const dt = (()=>{ try{ return new Date(ride?.departure_time); }catch{ return null; } })();
                  const date = dt ? dt.toLocaleDateString('fr-FR') : '';
                  const time = dt ? dt.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '';
                  return (
                  <Card key={reservation.id} className="glass backdrop-blur-lg border border-border/50 shadow-card hover-glow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">{ride?.departure}</span>
                            </div>
                            <div className="w-6 h-px bg-border"></div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">{ride?.destination}</span>
                            </div>
                            {getStatusBadge(reservation.status)}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="w-4 h-4" />
                              {reservation.price_at_booking}€
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={undefined} />
                              <AvatarFallback>
                                {"C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">Conducteur</div>
                              <div className="text-sm text-muted-foreground">
                                Trajet
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:w-auto">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/trip/${ride?.id}`}> 
                            <Eye className="w-4 h-4 mr-2" />
                            Détails
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/messages`}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacter
                            </Link>
                          </Button>
                          {['pending','accepted'].includes(reservation.status) && (
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={!!actLoading} onClick={async ()=>{
                              const { error } = await cancel(reservation.id, user!.id);
                              if(!error){
                                setReservations(prev => prev.map(r => r.id === reservation.id ? { ...r, status: 'cancelled' } : r));
                              }
                            }}>
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );})
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;