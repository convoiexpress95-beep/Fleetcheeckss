import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useRideMessages } from "@/hooks/useRideMessages";

type RideLite = { id: string; departure: string; destination: string; departure_time: string };
type LastMsg = { ride_id: string; content: string; created_at: string };
type ReservationLite = { ride_id: string };

export default function Messages(){
  const { user } = useAuth();
  const [rideIds, setRideIds] = useState<string[]>([]);
  const [rides, setRides] = useState<Record<string, RideLite>>({});
  const [lastByRide, setLastByRide] = useState<Record<string, LastMsg | undefined>>({});
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const { messages, send } = useRideMessages(selectedRideId || undefined);

  useEffect(()=>{
    if(!user) return;
    (async()=>{
      // Rides où je suis conducteur
      const rDriver = await supabase.from('rides').select('id, departure, destination, departure_time').eq('driver_id', user.id);
      const driverRides = (rDriver.data||[]) as RideLite[];

      // Rides où je suis passager
  const rRes = await supabase.from('ride_reservations').select('ride_id').eq('passenger_id', user.id);
  const reservedRideIds = new Set<string>(((rRes.data||[]) as ReservationLite[]).map(x=> x.ride_id));

      // Charger les rides des réservations
      let reservedRides: RideLite[] = [];
      if(reservedRideIds.size){
        const ids = Array.from(reservedRideIds);
        const rRides = await supabase.from('rides').select('id, departure, destination, departure_time').in('id', ids);
        reservedRides = (rRides.data||[]) as RideLite[];
      }

      const allRides = [...driverRides, ...reservedRides];
      const ids = Array.from(new Set(allRides.map(r=>r.id)));
      setRideIds(ids);
      setRides(Object.fromEntries(allRides.map(r=>[r.id, r])));

      // Charger les derniers messages par trajet
      if(ids.length){
        const rMsgs = await supabase
          .from('ride_messages')
          .select('ride_id, content, created_at')
          .in('ride_id', ids)
          .order('created_at', { ascending: false });
        const latest: Record<string, LastMsg> = {};
        for(const row of (rMsgs.data||[]) as LastMsg[]){
          if(!latest[row.ride_id]) latest[row.ride_id] = row;
        }
        setLastByRide(latest);
      }
    })();
  }, [user]);

  const conversations = useMemo(()=>{
    return rideIds.map(id => ({
      id,
      trip: rides[id],
      last: lastByRide[id]
    }));
  }, [rideIds, rides, lastByRide]);

  const formatTime = (iso?: string) => {
    if(!iso) return '';
    try{ return new Date(iso).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }); }catch{ return ''; }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass backdrop-blur-lg border border-border/50 shadow-card lg:col-span-1">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Rechercher un trajet..." className="pl-10" />
                  </div>
                </div>
                <ScrollArea className="h-[600px]">
                  <div className="p-2">
                    {conversations.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">Aucune conversation. Réservez un trajet ou publiez-en un pour démarrer.</div>
                    )}
                    {conversations.map(conv => (
                      <div key={conv.id}
                           className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedRideId===conv.id? 'bg-muted':''}`}
                           onClick={()=> setSelectedRideId(conv.id)}>
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>{(conv.trip?.departure||'?').slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {conv.trip?.departure} → {conv.trip?.destination}
                              </h3>
                              <span className="text-xs text-muted-foreground">{formatTime(conv.last?.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{conv.trip?.departure} → {conv.trip?.destination}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate ${conv.last ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {conv.last?.content || 'Aucun message'}
                              </p>
                              {!!conv.last && <Badge className="w-2 h-2 p-0 bg-primary" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-lg border border-border/50 shadow-card lg:col-span-2">
              {selectedRideId ? (
                <CardContent className="p-0 flex flex-col h-[600px]">
                  <div className="p-4 border-b border-border/50">
                    <div className="font-semibold text-foreground">
                      {rides[selectedRideId]?.departure} → {rides[selectedRideId]?.destination}
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map(m => (
                        <div key={m.id}>
                          <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString('fr-FR')}</div>
                          <div className="text-sm text-foreground">{m.content}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Tapez votre message..." value={draft} onChange={(e)=>setDraft(e.target.value)} onKeyDown={async (e)=>{
                        if(e.key==='Enter'){
                          if(!user || !selectedRideId) return;
                          try{ await send(draft, user.id); setDraft(''); }catch(err: unknown){ const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: string }).message || 'Envoi impossible') : 'Envoi impossible'; alert(msg); }
                        }
                      }} className="flex-1" />
                      <Button onClick={async()=>{
                        if(!user || !selectedRideId) return;
                        try{ await send(draft, user.id); setDraft(''); }catch(err: unknown){ const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: string }).message || 'Envoi impossible') : 'Envoi impossible'; alert(msg); }
                      }} disabled={!draft.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="flex items-center justify-center h-[600px]">
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                    <p>Choisissez un trajet pour afficher les messages.</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}