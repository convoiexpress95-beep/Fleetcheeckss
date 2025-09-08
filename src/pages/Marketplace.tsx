import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, MapPin, Clock, ArrowRight, Coins, Users } from 'lucide-react';
import VehicleImage from '@/components/VehicleImage';
import { mapVehicleTypeToBodyType } from '@/lib/utils';
import { useMissions } from '@/hooks/useMissions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { statusMappings } from '@/lib/mappings';

const Marketplace: React.FC = () => {
  // plus de barre de recherche textuelle
  // Filtres marketplace: recherche globale + villes départ/arrivée + type de véhicule
  const [vehType, setVehType] = useState<'all' | 'leger' | 'utilitaire' | 'poids_lourd'>(() => (localStorage.getItem('mp.vehicleGroup') as any) || 'all');
  const [departCity, setDepartCity] = useState(() => localStorage.getItem('mp.departCity') || '');
  const [arrivalCity, setArrivalCity] = useState(() => localStorage.getItem('mp.arrivalCity') || '');
  const [goMyWay, setGoMyWay] = useState<boolean>(() => {
    const v = localStorage.getItem('mp.goMyWay');
    return v === null ? true : v === '1';
  });
  const [pickupDate, setPickupDate] = useState<string>(() => localStorage.getItem('mp.pickupDate') || '');
  const [serviceType, setServiceType] = useState<'all' | 'convoyage' | 'transport'>(() => (localStorage.getItem('mp.serviceType') as any) || 'all');
  const [page, setPage] = useState(0);
  const dep = goMyWay ? departCity : '';
  const arr = goMyWay ? arrivalCity : '';
  const { data: missionsData, isLoading } = useMissions({ kind: 'marketplace', vehicleGroup: vehType, departCity: dep, arrivalCity: arr, pickupDate: pickupDate || undefined, serviceType: serviceType !== 'all' ? serviceType : undefined }, page, 10);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }}) => setUserId(user?.id || null));
  }, []);

  const missions = missionsData?.data || [];
  const total = missionsData?.count || 0;

  const onNext = () => setPage((p) => p + 1);
  const onPrev = () => setPage((p) => Math.max(0, p - 1));

  // Persist filters
  React.useEffect(() => { localStorage.setItem('mp.vehicleGroup', vehType); }, [vehType]);
  React.useEffect(() => { localStorage.setItem('mp.departCity', departCity); }, [departCity]);
  React.useEffect(() => { localStorage.setItem('mp.arrivalCity', arrivalCity); }, [arrivalCity]);
  React.useEffect(() => { localStorage.setItem('mp.goMyWay', goMyWay ? '1' : '0'); }, [goMyWay]);
  React.useEffect(() => { pickupDate ? localStorage.setItem('mp.pickupDate', pickupDate) : localStorage.removeItem('mp.pickupDate'); }, [pickupDate]);
  React.useEffect(() => { localStorage.setItem('mp.serviceType', serviceType); }, [serviceType]);

  const fmtCurrency = (n?: number | null) => {
    if (n == null || isNaN(Number(n))) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n));
  };

  // Dialog candidature
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMission, setApplyMission] = useState<any | null>(null);
  const [applyPrice, setApplyPrice] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const MIN_PRICE = 50;

  const submitApplication = async () => {
    try {
      const price = Number(applyPrice);
      if (!applyMission?.id) throw new Error('Mission manquante');
      if (!price || isNaN(price) || price < MIN_PRICE) throw new Error(`Prix minimum ${MIN_PRICE} €`);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Connexion requise');
      const { error } = await supabase.from('mission_applications').insert({
        mission_id: applyMission.id,
        applicant_user_id: user.id,
        message: applyMessage?.trim() || null,
        price_offer: price,
      });
      if (error) throw error;
      toast({ title: 'Candidature envoyée', description: 'Devis transmis au donneur.' });
      setApplyOpen(false);
      setApplyMission(null);
      setApplyPrice('');
      setApplyMessage('');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Action impossible', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/10 to-blue-900/10">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-900/30 to-blue-900/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 bg-gradient-royal rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Marketplace — mise en relation
              </h1>
              <p className="text-sm md:text-base text-white/70">Postez une mission et recevez des candidatures, ou trouvez votre prochaine mission.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary">
                <Link to="/marketplace/post">Poster une mission</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace/accepted">Missions validées</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres simplifiés (sans barre de recherche) */}
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap w-full">
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                  {([
                    { key: 'all', label: 'Tous véhicules' },
                    { key: 'leger', label: 'Léger' },
                    { key: 'utilitaire', label: 'Utilitaire' },
                    { key: 'poids_lourd', label: 'Poids lourd' },
                  ] as const).map(t => (
                    <Button key={t.key} size="sm" variant={vehType === t.key ? 'default' : 'ghost'} onClick={() => { setPage(0); setVehType(t.key as any); }}>
                      {t.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Ville départ (ou CP)" value={departCity} onChange={(e)=>{ setPage(0); setDepartCity(e.target.value); }} className="w-[180px]" />
                  <Input placeholder="Ville d'arrivée (ou CP)" value={arrivalCity} onChange={(e)=>{ setPage(0); setArrivalCity(e.target.value); }} className="w-[200px]" />
                  <Button type="button" variant={goMyWay ? 'default' : 'outline'} size="sm" onClick={()=>{ setPage(0); setGoMyWay(v=>!v); }}>Dans ma direction</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="date" value={pickupDate} onChange={(e)=>{ setPage(0); setPickupDate(e.target.value); }} className="w-[170px]" />
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                    {([
                      { key: 'all', label: 'Tous types' },
                      { key: 'convoyage', label: 'Convoyage' },
                      { key: 'transport', label: 'Transport' },
                    ] as const).map(t => (
                      <Button key={t.key} size="sm" variant={serviceType === t.key ? 'default' : 'ghost'} onClick={() => { setPage(0); setServiceType(t.key as any); }}>
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{total} résultat{total > 1 ? 's' : ''}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 0}>Précédent</Button>
            <Button variant="outline" size="sm" onClick={onNext} disabled={(missions.length < 10)}>Suivant</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading && (
            <div className="text-center text-muted-foreground py-8">Chargement…</div>
          )}
          {!isLoading && missions.map((m: any) => (
            <Card key={m.id} className="hover:border-primary/40 transition-colors overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-foreground">{m.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">Réf: {m.reference}</div>
                </div>
                <Badge>{statusMappings.mission[m.status as keyof typeof statusMappings['mission']] || m.status}</Badge>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 items-stretch">
                  <div className="rounded-lg bg-muted/30 border border-border p-2">
                    <VehicleImage
                      imagePath={m.vehicle_image_path || m.vehicle_model?.image_path}
                      bodyType={m.vehicle_body_type || m.vehicle_model?.body_type || mapVehicleTypeToBodyType(m.vehicle_type)}
                      alt={`${m.vehicle_brand || ''} ${m.vehicle_model_name || m.vehicle_model || ''}`.trim() || 'Véhicule'}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Enlèvement</div>
                      <div className="text-muted-foreground">{m.pickup_address || '—'}</div>
                      {m.pickup_date && (
                        <div className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(m.pickup_date).toLocaleString('fr-FR')}</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-2"><MapPin className="w-4 h-4 rotate-180" /> Livraison</div>
                      <div className="text-muted-foreground">{m.delivery_address || '—'}</div>
                      {m.delivery_date && (
                        <div className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(m.delivery_date).toLocaleString('fr-FR')}</div>
                      )}
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      {(m.vehicle_brand || m.vehicle_model_name || m.vehicle_model) && (
                        <Badge variant="secondary">{[m.vehicle_brand, m.vehicle_model_name || m.vehicle_model].filter(Boolean).join(' ')}</Badge>
                      )}
                      {(m.vehicle_body_type || m.vehicle_model?.body_type) && (
                        <Badge variant="outline">{m.vehicle_body_type || m.vehicle_model?.body_type}</Badge>
                      )}
                      {m.vehicle_type && (<Badge variant="outline">{m.vehicle_type}</Badge>)}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end gap-3 min-w-[190px]">
                    <div className="text-right space-y-1">
                      <div className="text-xs text-muted-foreground">Proposition donneur</div>
                      <div className="text-2xl font-bold flex items-center gap-2 justify-end"><Coins className="w-5 h-5 text-yellow-400" /> {fmtCurrency(m.donor_earning)}</div>
                      <div className="text-xs text-muted-foreground">Convoyeur</div>
                      <div className="text-lg font-semibold">{fmtCurrency(m.driver_earning)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="secondary">
                        <Link to={`/missions/${m.id}/edit`}>Détails</Link>
                      </Button>
                      {userId && m.created_by === userId && (
                        <MissionApplicationsButton mission={m} />
                      )}
                      <Dialog open={applyOpen} onOpenChange={(o)=>{ setApplyOpen(o); if(!o){ setApplyMission(null); } }}>
                        <DialogTrigger asChild>
                          <Button onClick={()=>{ setApplyMission(m); setApplyOpen(true); }}>
                            Candidater <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Envoyer un devis</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium">Prix proposé (€)</div>
                              <Input inputMode="numeric" type="number" min={MIN_PRICE} value={applyPrice} onChange={(e)=>setApplyPrice(e.target.value)} />
                              <div className="text-xs text-muted-foreground mt-1">Minimum {MIN_PRICE} €</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Message</div>
                              <Textarea value={applyMessage} onChange={(e)=>setApplyMessage(e.target.value)} placeholder="Détails, disponibilités, etc." />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={()=>setApplyOpen(false)}>Annuler</Button>
                            <Button onClick={submitApplication}>Envoyer</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && missions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">Aucune mission trouvée</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

// Bouton/Dialogue pour afficher et gérer les candidatures d'une mission
const MissionApplicationsButton: React.FC<{ mission: any }> = ({ mission }) => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mission_applications')
        .select('id, applicant_user_id, message, price_offer, status, created_at')
        .eq('mission_id', mission.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Chargement impossible', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { if (open) load(); }, [open]);

  const accept = async (id: string, applicant: string) => {
    try {
      const { error } = await supabase.from('mission_applications').update({ status: 'accepted' }).eq('id', id);
      if (error) throw error;
      // Optionnel: assigner le driver et passer en in_progress
      await supabase.from('missions').update({ driver_id: applicant, status: 'in_progress' }).eq('id', mission.id);
      toast({ title: 'Candidature acceptée' });
      load();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Action impossible', variant: 'destructive' });
    }
  };

  const reject = async (id: string) => {
    try {
      const { error } = await supabase.from('mission_applications').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Candidature refusée' });
      load();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Action impossible', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Users className="w-4 h-4 mr-1" /> Candidatures</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Candidatures pour {mission.reference}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {loading && <div className="text-sm text-muted-foreground">Chargement…</div>}
          {!loading && items.length === 0 && <div className="text-sm text-muted-foreground">Aucune candidature</div>}
          {!loading && items.map((a) => (
            <div key={a.id} className="border rounded p-2 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm">Prix: <span className="font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(a.price_offer || 0)}</span></div>
                {a.message && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{a.message}</div>}
                <div className="text-xs text-muted-foreground">Statut: {a.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={()=>accept(a.id, a.applicant_user_id)}>Accepter</Button>
                <Button size="sm" variant="outline" onClick={()=>reject(a.id)}>Refuser</Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
