import React, { useMemo, useState } from 'react';
import { Route as RouteIcon, Users, Filter, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { listTrajets, remainingSeats, isFull, publishTrajet } from '@/services/trajetsPartages';
import { requestJoinTrajet, listPassengerRequests } from '@/services/trajetDemands';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { CreditsDisplay } from '@/components/CreditsDisplay';

type Trajet = {
  id: string;
  convoyeur_id: string;
  ville_depart: string;
  ville_arrivee: string;
  date_heure: string;
  nb_places: number;
  prix_par_place: number | null;
  participants: string[] | null;
  created_at: string | null;
  start_lat?: number | null;
  start_lng?: number | null;
  end_lat?: number | null;
  end_lng?: number | null;
};

const TrajetsPartages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<Trajet[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromCoord, setFromCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoord, setToCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishForm, setPublishForm] = useState({
    ville_depart: '',
    ville_arrivee: '',
    date_heure: '',
    nb_places: 1,
    prix_par_place: '',
    notes: ''
  });
  // Statut des demandes de l'utilisateur pour chaque trajet: pending | accepted | refused | expired
  const [requestStatuses, setRequestStatuses] = useState<Record<string, 'pending' | 'accepted' | 'refused' | 'expired'>>({});
  const [creditsRefreshToken, setCreditsRefreshToken] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const rows = await listTrajets(100);
      setItems(rows as Trajet[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchItems();
  }, []);

  // Charger demandes existantes pour marquer statuts en attente / refusés / etc.
  React.useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const reqs = await listPassengerRequests(user.id);
        const map: Record<string, 'pending' | 'accepted' | 'refused' | 'expired'> = {};
        for (const r of reqs) map[r.trajet_id] = r.status;
        setRequestStatuses(map);
      } catch (e) {
        console.warn('Chargement demandes passager échoué', e);
      }
    })();
  }, [user]);

  // Realtime: suivi des changements sur les demandes de l'utilisateur
  React.useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`trajet_requests_passenger_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trajet_join_requests',
        filter: `passenger_id=eq.${user.id}`
      }, (payload: any) => {
        setRequestStatuses(prev => {
          const next = { ...prev };
          const row = (payload.new || payload.old);
            // payload.new existe pour INSERT & UPDATE; pour DELETE on garderait ancien statut (rare car RLS interdit delete)
          if (payload.eventType === 'DELETE') return next; // pas censé arriver
          if (row?.trajet_id && row?.status) {
            next[row.trajet_id] = row.status;
          }
          return next;
        });
      });
    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        // Optionnel: console.debug('Realtime demandes abonné');
      }
    });
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371; // km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  const filtered = useMemo(() => {
    let list = (items || []).slice();
    const ql = q.trim().toLowerCase();
    if (ql) list = list.filter((t) => [t.ville_depart, t.ville_arrivee].some((v) => (v || '').toLowerCase().includes(ql)));
    const fl = from.trim().toLowerCase();
    const tl = to.trim().toLowerCase();
    if (fl) list = list.filter((t) => (t.ville_depart || '').toLowerCase().includes(fl));
    if (tl) list = list.filter((t) => (t.ville_arrivee || '').toLowerCase().includes(tl));

    // Proximité si coordonnées dispo + recherche géocodée lancée
    const MAX_KM = 60; // rayon de correspondance simple
    const withScore = list.map((t) => {
      let score = 0;
      let ok = true;
      if (fromCoord && t.start_lat != null && t.start_lng != null) {
        const d = haversineKm(fromCoord, { lat: t.start_lat, lng: t.start_lng });
        if (Number.isFinite(d)) {
          score += d;
          if (d > MAX_KM) ok = false;
        }
      }
      if (toCoord && t.end_lat != null && t.end_lng != null) {
        const d2 = haversineKm(toCoord, { lat: t.end_lat, lng: t.end_lng });
        if (Number.isFinite(d2)) {
          score += d2;
          if (d2 > MAX_KM) ok = false;
        }
      }
      return { t, ok, score: Number.isFinite(score) ? score : 999999 };
    });
    const filtered = withScore.filter((x) => x.ok).sort((a, b) => a.score - b.score).map((x) => x.t);
    // Si aucun résultat avec coords, retomber sur filtre texte
    return filtered.length ? filtered : list;
  }, [items, q, from, to, fromCoord, toCoord]);

  const geocodeCity = async (query: string) => {
    const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';
    if (!token) throw new Error('Token Mapbox manquant');
    const useProxy = (import.meta as any).env?.VITE_USE_MAPBOX_PROXY === '1';
    const base = useProxy ? '/mapbox' : 'https://api.mapbox.com';
    const url = `${base}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&language=fr&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Échec géocodage');
    const json = await res.json();
    const feat = json.features?.[0];
    if (!feat) throw new Error('Lieu introuvable');
    const [lng, lat] = feat.center || [];
    if (typeof lat !== 'number' || typeof lng !== 'number') throw new Error('Coordonnées invalides');
    return { lat, lng };
  };

  const handleSearch = async () => {
    try {
      let fc: { lat: number; lng: number } | null = null;
      let tc: { lat: number; lng: number } | null = null;
      if (from.trim()) fc = await geocodeCity(from.trim());
      if (to.trim()) tc = await geocodeCity(to.trim());
      setFromCoord(fc);
      setToCoord(tc);
      if (!fc && !tc) {
        toast({ title: 'Recherche texte', description: 'Affinée avec les champs Départ/Arrivée.', variant: 'default' });
      } else {
        toast({ title: 'Recherche mise à jour', description: 'Tri par proximité activé.', variant: 'default' });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Géocodage', description: e.message || 'Impossible de géocoder la requête.', variant: 'destructive' });
    }
  };

  const onPublish = () => setPublishOpen(true);

  const handlePublishSubmit = async () => {
    if (!user) {
      toast({ title: 'Authentification requise', description: 'Connectez-vous pour publier un trajet.', variant: 'destructive' });
      return;
    }
    const { ville_depart, ville_arrivee, date_heure, nb_places } = publishForm;
    if (!ville_depart.trim() || !ville_arrivee.trim() || !date_heure) {
      toast({ title: 'Champs requis', description: 'Départ, arrivée et date/heure sont obligatoires.', variant: 'destructive' });
      return;
    }
    if (nb_places < 1) {
      toast({ title: 'Places invalides', description: 'Le nombre de places doit être au moins 1.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await publishTrajet({
        convoyeur_id: user.id,
        ville_depart: publishForm.ville_depart.trim(),
        ville_arrivee: publishForm.ville_arrivee.trim(),
        date_heure: publishForm.date_heure,
        nb_places: Number(nb_places),
        prix_par_place: publishForm.prix_par_place ? Number(publishForm.prix_par_place) : null,
        description: publishForm.notes || undefined,
      });
      toast({ title: 'Trajet publié', description: 'Votre trajet est visible pour les autres convoyeurs.' });
      setPublishOpen(false);
      setPublishForm({ ville_depart: '', ville_arrivee: '', date_heure: '', nb_places: 1, prix_par_place: '', notes: '' });
      fetchItems();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: e.message || 'Impossible de publier le trajet.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const onJoin = async (t: Trajet) => {
    if (!user) {
      toast({ title: 'Authentification requise', description: 'Connectez-vous pour rejoindre un trajet.', variant: 'destructive' });
      return;
    }
    if ((t.participants || []).includes(user.id)) return; // déjà inscrit
    if (requestStatuses[t.id] === 'pending') return; // déjà en attente
    if (isFull(t as any)) {
      toast({ title: 'Trajet complet', description: 'Plus de place disponible.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await requestJoinTrajet(t.id);
      setRequestStatuses(prev => ({ ...prev, [t.id]: 'pending' }));
      setCreditsRefreshToken(x => x + 1); // déclenche refresh CreditsDisplay
      toast({ title: 'Demande en attente', description: 'En attente d’acceptation du conducteur.' });
    } catch (e: any) {
      console.error(e);
      if (e?.message === 'CREDITS_INSUFFISANTS') {
        toast({ title: 'Crédits insuffisants', description: 'Il vous faut au moins 2 crédits pour réserver.', variant: 'destructive' });
      } else {
        toast({ title: 'Erreur', description: e.message || 'Impossible de créer la demande.', variant: 'destructive' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center">
            <RouteIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent">Trajets partagés</h1>
            <p className="text-muted-foreground">Optimisez les retours à vide • Publication et adhésion gratuites</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <CreditsDisplay variant="compact" refreshSignal={creditsRefreshToken} />
            <Button onClick={onPublish}><Plus className="w-4 h-4 mr-1" /> Publier trajet</Button>
          </div>
        </div>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtres</span>
              </div>
              <Input placeholder="Ville ou itinéraire" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
              <Input placeholder="Départ" value={from} onChange={(e) => setFrom(e.target.value)} className="w-48" />
              <Input placeholder="Arrivée" value={to} onChange={(e) => setTo(e.target.value)} className="w-48" />
              <Button variant="secondary" onClick={handleSearch}>Rechercher</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Astuce: renseignez Départ/Arrivée puis cliquez Rechercher pour un tri par proximité (&lt;= 60 km) si le trajet a des coordonnées.
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground py-8">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucun trajet pour le moment</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((t) => {
                  const seatsLeft = remainingSeats(t as any);
                  const already = (t.participants || []).includes(user?.id || '__');
                  const full = seatsLeft === 0 || isFull(t as any);
                  const status = requestStatuses[t.id];
                  const pending = status === 'pending';
                  return (
                    <div key={t.id} className={`flex items-center justify-between border rounded-lg p-3 bg-card ${full ? 'opacity-70' : ''}`}>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate flex items-center gap-2">
                          <span>{t.ville_depart} → {t.ville_arrivee}</span>
                          {full && <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wide">Complet</span>}
                          {!already && status && status !== 'pending' && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded uppercase tracking-wide ${
                                status === 'accepted' ? 'bg-green-100 text-green-700' :
                                status === 'refused' ? 'bg-yellow-100 text-yellow-700' :
                                status === 'expired' ? 'bg-gray-200 text-gray-700' : ''
                              }`}
                            >
                              {status === 'accepted' ? 'Accepté' : status === 'refused' ? 'Refusé' : status === 'expired' ? 'Expiré' : ''}
                            </span>
                          )}
                          {pending && <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">En attente</span>}
                        </div>
                        <div className="text-sm text-muted-foreground truncate flex flex-wrap gap-2 items-center">
                          <span>{new Date(t.date_heure).toLocaleString()}</span>
                          <span>• {t.nb_places} places</span>
                          <span>• Restant: {seatsLeft}</span>
                          <span>• {t.prix_par_place ? `${t.prix_par_place.toFixed(2)} € / place` : '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={already ? 'secondary' : pending ? 'secondary' : status === 'refused' || status === 'expired' ? 'outline' : 'outline'}
                          disabled={already || full || saving || pending || status === 'refused' || status === 'expired' || status === 'accepted'}
                          onClick={() => onJoin(t)}
                        >
                          <Users className="w-4 h-4 mr-1" /> {already ? 'Inscrit' : full ? 'Complet' : pending ? 'En attente' : status === 'refused' ? 'Refusé' : status === 'expired' ? 'Expiré' : status === 'accepted' ? 'Accepté' : 'Demander'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogue Publication Trajet */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Publier un trajet (gratuit)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Ville de départ *" value={publishForm.ville_depart} onChange={(e) => setPublishForm({ ...publishForm, ville_depart: e.target.value })} />
              <Input placeholder="Ville d'arrivée *" value={publishForm.ville_arrivee} onChange={(e) => setPublishForm({ ...publishForm, ville_arrivee: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="datetime-local" placeholder="Date & heure *" value={publishForm.date_heure} onChange={(e) => setPublishForm({ ...publishForm, date_heure: e.target.value })} />
              <Input type="number" min={1} placeholder="Nombre de places *" value={publishForm.nb_places} onChange={(e) => setPublishForm({ ...publishForm, nb_places: Number(e.target.value || 1) })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="number" placeholder="Prix / place (€)" value={publishForm.prix_par_place} onChange={(e) => setPublishForm({ ...publishForm, prix_par_place: e.target.value })} />
              <Textarea placeholder="Notes" value={publishForm.notes} onChange={(e) => setPublishForm({ ...publishForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPublishOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handlePublishSubmit} disabled={saving}>{saving ? 'Publication…' : 'Publier'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrajetsPartages;
