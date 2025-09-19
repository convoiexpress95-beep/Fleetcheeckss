import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // legacy imports (à migrer progressivement)
import UserAvatar from '@/components/UserAvatar';
import { useToast } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Clock, Users, Euro, Car, Plus, Edit, Trash2, MessageCircle, Eye, AlertTriangle } from "lucide-react";

interface Ride {
  id: string;
  driver_id: string;
  departure: string;
  destination: string;
  departure_time: string;
  price: number;
  seats_total: number;
  seats_available: number;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  reservations?: Array<{
    id: string;
    passenger_id: string;
    seats: number;
    status: string;
    passenger: {
      full_name: string;
      avatar_url: string | null;
    };
  }>;
}

interface Reservation {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  status: string;
  price_at_booking: number;
  message: string | null;
  created_at: string;
  ride: {
    id: string;
    departure: string;
    destination: string;
    departure_time: string;
    price: number;
    driver_id: string;
  };
  driver: {
    full_name: string;
    avatar_url: string | null;
  };
}

const RTC_DEBUG = import.meta.env.VITE_RTC_DEBUG === '1';

const MyTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Charger mes trajets publiés
  const loadMyRides = async () => {
    if (!user) return;

    try {
      const { data: rides, error } = await supabase
        .from('rides')
        .select(`
          *,
          reservations:ride_reservations(
            id,
            passenger_id,
            seats,
            status,
            passenger:profiles!ride_reservations_passenger_id_fkey(full_name, avatar_url)
          )
        `)
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: true });

      if (error) throw error;
      
      if (RTC_DEBUG) console.log('[RTC] My rides loaded:', rides);
      setMyRides(rides as any || []);
    } catch (error) {
      console.error('Error loading my rides:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos trajets publiés',
        variant: 'destructive'
      });
    }
  };

  // Charger mes réservations
  const loadMyReservations = async () => {
    if (!user) return;

    try {
      const { data: reservations, error } = await supabase
        .from('ride_reservations')
        .select(`
          *,
          ride:rides(id, departure, destination, departure_time, price, driver_id),
          driver:profiles!rides_driver_id_fkey(full_name, avatar_url)
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (RTC_DEBUG) console.log('[RTC] My reservations loaded:', reservations);
      setMyReservations(reservations as any || []);
    } catch (error) {
      console.error('Error loading my reservations:', error);
      toast({
        title: 'Erreur', 
        description: 'Impossible de charger vos réservations',
        variant: 'destructive'
      });
    }
  };

  // Charger les données initiales et configurer realtime
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadMyRides(), loadMyReservations()]);
      setLoading(false);
    };

    loadData();

    // Écouter les changements en temps réel
    const ridesChannel = supabase
      .channel('my-rides-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: `driver_id=eq.${user.id}`
      }, (payload) => {
        if (RTC_DEBUG) console.log('[RTC] Ride change:', payload);
        
        if (payload.eventType === 'UPDATE') {
          setMyRides(prev => prev.map(ride => 
            ride.id === payload.new.id ? { ...ride, ...payload.new } : ride
          ));
        } else if (payload.eventType === 'DELETE') {
          setMyRides(prev => prev.filter(ride => ride.id !== payload.old.id));
        }
      })
      .subscribe();

    const reservationsChannel = supabase
      .channel('my-reservations-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'ride_reservations',
        filter: `passenger_id=eq.${user.id}`
      }, (payload) => {
        if (RTC_DEBUG) console.log('[RTC] Reservation change:', payload);
        loadMyReservations(); // Recharger pour avoir les données complètes avec joins
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ridesChannel);
      supabase.removeChannel(reservationsChannel);
    };
  }, [user]);

  // Supprimer un trajet
  const handleDeleteRide = async (rideId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) return;
    
    setLoadingAction(rideId);
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', rideId);

      if (error) throw error;
      
      toast({
        title: 'Trajet supprimé',
        description: 'Le trajet a été supprimé avec succès'
      });
      
      setMyRides(prev => prev.filter(ride => ride.id !== rideId));
    } catch (error: any) {
      console.error('Error deleting ride:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le trajet',
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Annuler une réservation
  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    
    setLoadingAction(reservationId);
    try {
      const { error } = await supabase
        .from('ride_reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (error) throw error;
      
      toast({
        title: 'Réservation annulée',
        description: 'Votre réservation a été annulée'
      });
      
      await loadMyReservations(); // Recharger les données
    } catch (error: any) {
      console.error('Error canceling reservation:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'annuler la réservation',
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(null);
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes trajets</h1>
            <p className="text-muted-foreground">Gérez vos trajets publiés et vos réservations</p>
          </div>
          <Button onClick={() => navigate("/convoiturage/publish")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Publier un trajet
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de vos trajets...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="published" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="published">Mes trajets publiés</TabsTrigger>
              <TabsTrigger value="reservations">Mes réservations</TabsTrigger>
            </TabsList>

          <TabsContent value="published" className="space-y-4 mt-6">
            {myRides.length === 0 ? (
              <Card className="glass-card border-border/50 shadow-card">
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun trajet publié</h3>
                  <p className="text-muted-foreground mb-4">Commencez à partager vos trajets avec la communauté</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Publier mon premier trajet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myRides.map((trip) => (
                <Card key={trip.id} className="glass-card border-border/50 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{trip.departure}</span>
                          </div>
                          <div className="w-6 h-px bg-border"></div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{trip.destination}</span>
                          </div>
                          {getStatusBadge(trip.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(trip.departure_time).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {trip.seats_available}/{trip.seats_total} places
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {trip.price}€
                          </div>
                        </div>

                        {trip.reservations && trip.reservations.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Passagers ({trip.reservations.length})</div>
                            <div className="flex items-center gap-2">
                              {trip.reservations.map((reservation) => (
                                <div key={reservation.id} className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={reservation.passenger.avatar_url || ''} />
                                    <AvatarFallback className="text-xs">
                                      {reservation.passenger.full_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">{reservation.passenger.full_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:w-auto">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/convoiturage/rides/${trip.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/convoiturage/edit-ride/${trip.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/convoiturage/messages/${trip.id}`)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Messages
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteRide(trip.id)}
                          disabled={loadingAction === trip.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {loadingAction === trip.id ? 'Suppression...' : 'Supprimer'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4 mt-6">
            {myReservations.length === 0 ? (
              <Card className="glass-card border-border/50 shadow-card">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
                  <p className="text-muted-foreground mb-4">Recherchez et réservez votre prochain trajet</p>
                  <Button>Rechercher un trajet</Button>
                </CardContent>
              </Card>
            ) : (
              myReservations.map((reservation) => (
                <Card key={reservation.id} className="glass-card border-border/50 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{reservation.ride.departure}</span>
                          </div>
                          <div className="w-6 h-px bg-border"></div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{reservation.ride.destination}</span>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(reservation.ride.departure_time).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(reservation.ride.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {reservation.price_at_booking}€
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            {/* Utilisation du composant unifié avec fallback */}
                            <UserAvatar src={reservation.driver.avatar_url || undefined} name={reservation.driver.full_name} />
                            <AvatarFallback>
                              {reservation.driver.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{reservation.driver.full_name}</div>
                            <div className="text-sm text-muted-foreground">Conducteur</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:w-auto">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/convoiturage/rides/${reservation.ride.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/convoiturage/messages/${reservation.ride.id}`)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contacter
                        </Button>
                        {(reservation.status === "pending" || reservation.status === "accepted") && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancelReservation(reservation.id)}
                            disabled={loadingAction === reservation.id}
                          >
                            {loadingAction === reservation.id ? 'Annulation...' : 'Annuler'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
