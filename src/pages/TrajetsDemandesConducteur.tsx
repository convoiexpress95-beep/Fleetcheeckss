import React from 'react';
import { listDriverRequests, acceptJoinRequest, refuseJoinRequest, TrajetJoinRequestRow, expireRequestsAtDeparture } from '@/services/trajetDemands';
import { supabase } from '@/integrations/supabase/client';
import { listTrajets, remainingSeats, isFull } from '@/services/trajetsPartages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrajetLite { id: string; ville_depart: string; ville_arrivee: string; nb_places: number; participants: string[] | null; date_heure: string }

const TrajetsDemandesConducteur: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<TrajetJoinRequestRow[]>([]);
  const [trajetsMap, setTrajetsMap] = React.useState<Record<string, TrajetLite>>({});
  const [loading, setLoading] = React.useState(false);
  const [acting, setActing] = React.useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const reqs = await listDriverRequests(user.id, 'pending');
      setRequests(reqs);
      // Récupérer trajets associés (simple fetch global puis filtrage map)
      const rows = await listTrajets(300);
      const map: Record<string, TrajetLite> = {};
      rows.forEach(r => { map[r.id] = { id: r.id, ville_depart: r.ville_depart, ville_arrivee: r.ville_arrivee, nb_places: r.nb_places, participants: r.participants, date_heure: r.date_heure }; });
      setTrajetsMap(map);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Chargement demandes impossible', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, [user]);

  // Realtime: écouter toutes les demandes 'pending' pour ce convoyeur
  React.useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`trajet_requests_driver_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trajet_join_requests',
        filter: `convoyeur_id=eq.${user.id}`
      }, (payload: any) => {
        const row = payload.new || payload.old;
        if (!row) return;
        // Si nouveau pending, on reload minimal; si status changé (accepted/refused/expired), retirer si présent
        setRequests(prev => {
          const exists = prev.find(r => r.id === row.id);
            if (payload.eventType === 'INSERT') {
              if (row.status === 'pending' && !exists) return [row, ...prev];
              return prev;
            }
            if (payload.eventType === 'UPDATE') {
              if (exists) {
                if (row.status !== 'pending') {
                  return prev.filter(r => r.id !== row.id);
                } else {
                  return prev.map(r => r.id === row.id ? { ...r, ...row } : r);
                }
              } else if (row.status === 'pending') {
                return [row, ...prev];
              }
              return prev;
            }
            return prev;
        });
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Déclenche expiration à l'ouverture (meilleur effort) - non bloquant
  React.useEffect(() => {
    (async () => {
      try { await expireRequestsAtDeparture(); } catch { /* silencieux */ }
    })();
  }, []);

  const onExpireClick = async () => {
    try {
      await expireRequestsAtDeparture();
      // retirer localement celles qui ont expiré (reload pour simplicité)
      load();
      toast({ title: 'Expiration exécutée', description: 'Les demandes arrivées à l\'heure de départ ont été expirées.' });
    } catch (e: any) {
      toast({ title: 'Erreur expiration', description: e.message || 'Impossible de forcer l\'expiration', variant: 'destructive' });
    }
  };

  const handle = async (req: TrajetJoinRequestRow, accept: boolean) => {
    setActing(req.id);
    try {
      if (accept) {
        await acceptJoinRequest(req);
        toast({ title: 'Passager accepté', description: 'Le passager est ajouté au trajet.' });
      } else {
        await refuseJoinRequest(req);
        toast({ title: 'Demande refusée', description: 'Crédits remboursés au passager.' });
      }
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (e: any) {
      console.error(e);
      if (e?.message === 'CREDITS_CONDUCTEUR_INSUFFISANTS') {
        toast({ title: 'Crédits insuffisants', description: 'Rechargez pour accepter un passager.', variant: 'destructive' });
      } else {
        toast({ title: 'Erreur', description: e.message || 'Action impossible', variant: 'destructive' });
      }
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Demandes passagers en attente</h1>
        <button
          onClick={onExpireClick}
          className="text-xs text-muted-foreground hover:text-foreground transition"
          title="Forcer l'expiration des demandes arrivées à l'heure de départ"
        >Expiration départ ↻</button>
      </div>
      {loading ? <div className="text-muted-foreground">Chargement…</div> : (
        requests.length === 0 ? <div className="text-muted-foreground">Aucune demande en attente.</div> : (
          <Card>
            <CardContent className="p-4 space-y-3">
              {requests.map(req => {
                const trajet = trajetsMap[req.trajet_id];
                const seatsLeft = trajet ? remainingSeats(trajet as any) : '?';
                return (
                  <div key={req.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="text-sm">
                      <div className="font-medium">Trajet: {trajet ? `${trajet.ville_depart} → ${trajet.ville_arrivee}` : req.trajet_id}</div>
                      <div className="text-xs text-muted-foreground">Créée: {new Date(req.created_at).toLocaleString()} • Places restantes: {seatsLeft}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={acting===req.id} onClick={() => handle(req, true)}>Accepter</Button>
                      <Button size="sm" variant="destructive" disabled={acting===req.id} onClick={() => handle(req, false)}>Refuser</Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default TrajetsDemandesConducteur;