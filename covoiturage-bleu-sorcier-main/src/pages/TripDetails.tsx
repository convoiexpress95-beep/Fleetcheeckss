import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Euro, 
  Star,
  Phone,
  MessageCircle,
  Car,
  Shield,
  Snowflake,
  Music,
  Cigarette,
  CigaretteOff,
  Heart,
  Share2
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useRide, useReserveRide } from "@/hooks/useRides";
import { useRideMessages } from "@/hooks/useRideMessages";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRideParticipants } from "@/hooks/useRideParticipants";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ride = useRide(id);
  const reserve = useReserveRide();
  const { messages, send } = useRideMessages(id);
  const [chat, setChat] = useState("");
  const [seats, setSeats] = useState(1);
  const { driver, reservations, actionLoading, actAccept, actReject, actCancel, currentUserId } = useRideParticipants(id);
  const dt = useMemo(()=>{
    const raw = ride.data?.departure_time;
    if(!raw) return null;
    if(/\d{2}:\d{2}(:\d{2})?$/.test(raw)) return { date: '', time: raw.slice(0,5) };
    const d = new Date(raw);
    return { date: d.toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' }), time: d.toLocaleTimeString('fr-FR',{ hour:'2-digit', minute:'2-digit' }) };
  }, [ride.data?.departure_time]);

  const [phone, setPhone] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du trajet */}
          <Card className="glass backdrop-blur-lg border border-border/50 shadow-card mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Informations du trajet */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-xl font-semibold text-foreground">
                        {ride.data?.departure || '...'}
                      </span>
                    </div>
                    <div className="w-8 h-px bg-border"></div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-xl font-semibold text-foreground">
                        {ride.data?.destination || '...'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{dt?.date || ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{dt?.time || ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{ride.data?.seats_available ?? '—'} places disponibles</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {(ride.data?.options||[]).map((option) => (
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
                      {ride.data?.price ?? '—'}
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
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Points d'arrêt
                  </h3>
                  <div className="space-y-2">
                    {Array.isArray(ride.data?.route) && ride.data!.route.length > 0 ? (
                      ride.data!.route.map((stop, idx)=> (
                        <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{stop}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Aucun arrêt intermédiaire renseigné</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Description du trajet
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {ride.data?.description || '—'}
                  </p>
                </CardContent>
              </Card>

              {/* Véhicule */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Véhicule
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{ride.data?.vehicle_model || '—'}</div>
                      <div className="text-sm text-muted-foreground">(à compléter)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat simple */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Messages</h3>
                  <div className="space-y-3 max-h-64 overflow-auto pr-2">
                    {messages.map(m => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium">{m.sender_id === user?.id ? 'Moi' : m.sender_id.slice(0,8)}</span>
                        <span className="text-muted-foreground"> • {new Date(m.created_at).toLocaleString('fr-FR')}</span>
                        <div className="text-foreground">{m.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input placeholder="Votre message..." value={chat} onChange={(e)=>setChat(e.target.value)} />
                    <Button onClick={async()=>{
                      try{
                        if(!id) return;
                        if(!user){ navigate('/login'); return; }
                        if(!chat.trim()) return;
                        await send(chat, user.id);
                        setChat('');
                      }catch(e: unknown){
                        const msg = (e instanceof Error && e.message) ? e.message : 'Envoi impossible';
                        alert(msg);
                      }
                    }}>Envoyer</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Passagers */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Passagers</h3>
                  {reservations.length === 0 && (
                    <div className="text-sm text-muted-foreground">Aucune réservation</div>
                  )}
                  <div className="space-y-3">
                    {reservations.map(r => {
                      const isDriver = driver && driver.user_id === currentUserId;
                      const isPassenger = r.passenger_id === currentUserId;
                      return (
                        <div key={r.id} className="flex items-center justify-between gap-4 p-2 rounded border border-border/40">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={r.passenger?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{(r.passenger?.display_name||r.passenger_id).slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{r.passenger?.display_name || r.passenger_id.slice(0,8)}</span>
                              <span className="text-xs text-muted-foreground">{r.seats} place(s) • {r.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isDriver && r.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" disabled={!!actionLoading} onClick={()=>actAccept(r.id, driver!.user_id)}>Accepter</Button>
                                <Button size="sm" variant="outline" disabled={!!actionLoading} onClick={()=>actReject(r.id, driver!.user_id)}>Refuser</Button>
                              </>
                            )}
                            {isPassenger && ['pending','accepted'].includes(r.status) && (
                              <Button size="sm" variant="outline" className="text-destructive" disabled={!!actionLoading} onClick={()=>actCancel(r.id, currentUserId!)}>Annuler</Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profil du conducteur et réservation */}
            <div className="space-y-6">
              {/* Profil du conducteur */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Conducteur
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                      <AvatarImage src={driver?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">{(driver?.display_name || driver?.user_id || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{driver?.display_name || driver?.user_id || '—'}</div>
                      <div className="text-sm text-muted-foreground">Conducteur</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Profil vérifié</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={async()=>{
                      if(!id) return;
                      if(!user){ navigate('/login'); return; }
                      const { data, error } = await supabase.rpc('reveal_driver_contact', { p_ride_id: id });
                      if(error){
                        alert(error.message || "Impossible d'afficher le contact");
                        return;
                      }
                      setPhone(data || '');
                    }}>
                      <Phone className="w-4 h-4" />
                      {phone ? phone : 'Voir le contact (1 crédit)'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Réservation */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Réserver
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Prix par personne</span>
                      <span className="font-semibold text-foreground">{ride.data?.price ?? '—'}€</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Places disponibles</span>
                      <span className="font-semibold text-primary">{ride.data?.seats_available ?? '—'}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">{ride.data?.price ? (ride.data.price * seats) : '—'}€</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Input type="number" min={1} max={ride.data?.seats_available || 1} value={seats} onChange={(e)=>setSeats(Math.max(1, Math.min(Number(e.target.value||1), Number(ride.data?.seats_available||1))))} className="w-24" />
                      <Button variant="hero" size="lg" className="flex-1" onClick={async()=>{
                        if(!id) return;
                        if(!user){ navigate('/login'); return; }
                        if(!ride.data) return;
                        await reserve.mutateAsync({
                          ride_id: id,
                          passenger_id: user.id,
                          seats: seats,
                          price_at_booking: ride.data.price,
                          message: chat || undefined,
                        });
                      }}>
                        Réserver ce trajet
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <div>La réservation est réglée en crédits dans l’app.</div>
                      <div>Le trajet se paye en espèces entre le voyageur et le conducteur.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;