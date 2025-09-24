import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Clock, Users, Euro, Star, Phone, MessageCircle, Car, Shield, Snowflake, Music, CigaretteOff, Heart, Share2 } from "lucide-react";

import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useConvoiturage } from "@/hooks/useConvoiturage";
import { useToast } from "@/hooks";
import type { Ride } from "../../types/convoiturage";

const TripDetails = () => {
  const { id } = useParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const { reserveRide } = useConvoiturage();
  const { toast } = useToast();

  useEffect(()=>{
    let active = true;
    const load = async () => {
      const { data } = await supabase.from('rides').select('*').eq('id', id).maybeSingle() as { data: Ride | null };
      if (active) setRide(data);
    };
    if (id) load();
    const ch = supabase
      .channel(`rt:ride:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${id}` }, (payload:{ new?: Ride })=>{
        if(payload.new) setRide(payload.new);
      })
      .subscribe();
    return ()=>{ active = false; supabase.removeChannel(ch); };
  }, [id]);

  const trip = useMemo(()=>{
    if (!ride) return null;
    const date = new Date(ride.departure_time);
    const time = date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    return {
      id: ride.id,
      departure: ride.departure,
      destination: ride.destination,
      date: date.toLocaleDateString('fr-FR'),
      time,
      price: ride.price,
      availableSeats: ride.seats_available,
      totalSeats: ride.seats_total,
      driver: {
        name: 'Conducteur',
        rating: 5,
        reviews: 0,
        avatar: undefined,
        age: undefined,
        memberSince: undefined,
      },
      car: { model: ride.vehicle_model || '-', color: '-', year: undefined },
      options: ride.options || [],
      description: ride.description || '',
      pickupPoints: [],
    };
  }, [ride]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {!trip ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : (
        <>
        {/* En-tête du trajet */}
        <Card className="glass-card border border-border/50 shadow-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Informations du trajet */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-xl font-semibold">{trip.departure}</span>
                  </div>
                  <div className="w-8 h-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-xl font-semibold">{trip.destination}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{trip.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{trip.availableSeats} places disponibles</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {trip.options.map((option) => (
                    <Badge key={option} variant="secondary" className="flex items-center gap-1">
                      {option === "Climatisation" && <Snowflake className="w-3 h-3" />}
                      {option === "Musique autorisée" && <Music className="w-3 h-3" />}
                      {option === "Non-fumeur" && <CigaretteOff className="w-3 h-3" />}
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Prix et actions */}
              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary flex items-center gap-1">
                    <Euro className="w-6 h-6" />
                    {trip.price}
                  </div>
                  <div className="text-sm text-muted-foreground">par personne</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
  </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations détaillées */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points d'arrêt */}
            <Card className="glass-card border border-border/50 shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Points d'arrêt</h3>
                <div className="space-y-4">
                  {trip.pickupPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium">{point.location}</div>
                          <div className="text-sm text-muted-foreground">{point.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="glass-card border border-border/50 shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Description du trajet</h3>
                <p className="text-muted-foreground leading-relaxed">{trip.description}</p>
              </CardContent>
            </Card>

            {/* Véhicule */}
            <Card className="glass-card border border-border/50 shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Véhicule
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Car className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{trip.car.model}</div>
                    <div className="text-sm text-muted-foreground">
                      {trip.car.color} • {trip.car.year}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Réservation */}
          <div className="space-y-6">
            {/* Réservation */}
            <Card className="glass-card border border-border/50 shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Réserver</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Prix par personne</span>
                    <span className="font-semibold">{trip.price}€</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Places disponibles</span>
                    <span className="font-semibold text-primary">{trip.availableSeats}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{trip.price}€</span>
                  </div>

                  <Button size="lg" className="w-full" onClick={async ()=>{
                    try {
                      await reserveRide(trip.id, 1);
                      toast({ title: "Demande envoyée", description: "Votre réservation est en attente de confirmation." });
                    } catch (e: unknown) {
                      const msg = e instanceof Error ? e.message : "Impossible de réserver";
                      toast({ title: "Erreur", description: msg, variant: "destructive" });
                    }
                  }}>
                    Réserver ce trajet
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    Vous ne payez qu'après confirmation du conducteur
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default TripDetails;
