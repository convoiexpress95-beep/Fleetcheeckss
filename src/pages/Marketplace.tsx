import React, { useMemo, useState } from 'react';
import { Store, Send, EyeOff, Filter, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CreditsDisplay } from '@/components/CreditsDisplay';
import ChatDrawer from '@/components/ChatDrawer';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type MarketMission = {
  id: string;
  created_by: string;
  convoyeur_id: string | null;
  titre: string;
  description: string | null;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string | null;
  prix_propose: number | null;
  statut: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | null;
  created_at: string | null;
};

type MarketDevis = {
  id: string;
  mission_id: string;
  convoyeur_id: string;
  prix_propose: number;
  message: string | null;
  statut: 'envoye' | 'accepte' | 'refuse' | null;
  created_at: string | null;
};

const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<MarketMission[] | null>(null);
  const [myQuotes, setMyQuotes] = useState<MarketDevis[]>([]);
  const [receivedQuotes, setReceivedQuotes] = useState<MarketDevis[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);
  const [quoteOpenFor, setQuoteOpenFor] = useState<MarketMission | null>(null);
  const [saving, setSaving] = useState(false);
  const [chatOpen, setChatOpen] = useState<{ missionId: string; ownerId: string; convoyeurId: string } | null>(null);
  const [publishForm, setPublishForm] = useState({
    titre: '',
    description: '',
  ville_depart: '',
  ville_arrivee: '',
    date_depart: '',
    prix_propose: '',
  });
  const [quoteForm, setQuoteForm] = useState({ montant: '', message: '' });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_missions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setItems((data || []) as unknown as MarketMission[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchItems();
  }, []);

  // Fetch quotes: mine and received for my missions
  React.useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const [{ data: mine, error: e1 }, { data: myMissions, error: e2 }] = await Promise.all([
          supabase.from('marketplace_devis').select('*').eq('convoyeur_id', user.id).order('created_at', { ascending: false }).limit(200),
          supabase.from('marketplace_missions').select('id').eq('created_by', user.id).limit(500),
        ]);
        if (e1) throw e1; if (e2) throw e2;
        setMyQuotes((mine || []) as unknown as MarketDevis[]);
        const ids = (myMissions || []).map((m: any) => m.id);
        if (ids.length) {
          const { data: recv, error: e3 } = await supabase.from('marketplace_devis').select('*').in('mission_id', ids).order('created_at', { ascending: false }).limit(500);
          if (e3) throw e3;
          setReceivedQuotes((recv || []) as unknown as MarketDevis[]);
        } else {
          setReceivedQuotes([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [user]);

  // Build a mission map for displaying titles for quotes
  const missionMap = React.useMemo(() => {
    const map = new Map<string, MarketMission>();
    (items || []).forEach((m) => map.set(m.id, m));
    return map;
  }, [items]);

  // Unread counters for specialized notifications
  const queryClient = useQueryClient();
  const { data: unreadQuotes = 0 } = useQuery({
    queryKey: ['notif-unread-quotes'],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .eq('type', 'marketplace_quote');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['notif-unread-messages'],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .eq('type', 'marketplace_message');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Realtime refresh for unread counters
  React.useEffect(() => {
    if (!user) return;
    const ch = supabase.channel('rt-notif-marketplace').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['notif-unread-quotes'] });
        queryClient.invalidateQueries({ queryKey: ['notif-unread-messages'] });
      }
    );
    ch.subscribe();
    return () => { ch.unsubscribe(); };
  }, [user, queryClient]);

  // Mark quote notifications as read when viewing marketplace (owner context)
  React.useEffect(() => {
    if (!user) return;
    (async () => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('type', 'marketplace_quote')
        .eq('read', false);
      queryClient.invalidateQueries({ queryKey: ['notif-unread-quotes'] });
    })();
  }, [user, queryClient]);

  const filtered = useMemo(() => {
    let list = (items || []).slice();
    const ql = q.trim().toLowerCase();
    if (ql) {
      list = list.filter((m) =>
        [m.titre, m.ville_depart, m.ville_arrivee].some((v) => (v || '').toLowerCase().includes(ql))
      );
    }
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(min)) list = list.filter((m) => (m.prix_propose ?? Infinity) >= min);
    if (!Number.isNaN(max)) list = list.filter((m) => (m.prix_propose ?? 0) <= max);
    return list;
  }, [items, q, minPrice, maxPrice]);

  const onPublish = () => setPublishOpen(true);

  const handlePublishSubmit = async () => {
    if (!user) {
      toast({ title: 'Authentification requise', description: 'Connectez-vous pour publier une mission.', variant: 'destructive' });
      return;
    }
    const { titre, ville_depart, ville_arrivee, date_depart } = publishForm;
    if (!titre.trim() || !ville_depart.trim() || !ville_arrivee.trim() || !date_depart) {
      toast({ title: 'Champs requis', description: 'Titre, ville de départ, ville d\'arrivée et date de départ sont obligatoires.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // Publication ouverte à tous les utilisateurs, sans coût en crédits
      const { error: insertErr } = await supabase.from('marketplace_missions').insert({
        created_by: user.id,
        convoyeur_id: null,
        titre: publishForm.titre.trim(),
        description: publishForm.description.trim() || null,
        ville_depart: publishForm.ville_depart.trim(),
        ville_arrivee: publishForm.ville_arrivee.trim(),
        date_depart: new Date(publishForm.date_depart).toISOString(),
        prix_propose: publishForm.prix_propose ? Number(publishForm.prix_propose) : null,
        statut: 'ouverte',
        contact_visible: false,
      });
      if (insertErr) throw insertErr;

      toast({ title: 'Mission publiée', description: 'Votre mission est visible sur le marketplace.' });
      setPublishOpen(false);
  setPublishForm({ titre: '', description: '', ville_depart: '', ville_arrivee: '', date_depart: '', prix_propose: '' });
      fetchItems();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: e.message || 'Impossible de publier la mission.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const onSendQuote = (m: MarketMission) => {
    setQuoteOpenFor(m);
    setQuoteForm({ montant: '', message: '' });
  };

  const handleQuoteSubmit = async () => {
    if (!user || !quoteOpenFor) return;
    const montantNum = Number(quoteForm.montant);
    if (!Number.isFinite(montantNum) || montantNum <= 0) {
      toast({ title: 'Montant invalide', description: 'Entrez un montant valide supérieur à 0.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data: ok, error: creditErr } = await supabase.rpc('consume_credit', {
        _user_id: user.id,
        _mission_id: quoteOpenFor.id,
        _credits: 1,
        _type: 'marketplace_quote',
        _description: `Devis pour ${quoteOpenFor.titre}`
      });
      if (creditErr || !ok) throw new Error('Crédits insuffisants ou action refusée.');

      const { error: insertErr } = await supabase.from('marketplace_devis').insert({
        mission_id: quoteOpenFor.id,
        convoyeur_id: user.id,
        prix_propose: montantNum,
        message: quoteForm.message.trim() || null,
        statut: 'envoye'
      });
      if (insertErr) throw insertErr;

      toast({ title: 'Devis envoyé', description: 'Votre devis a été transmis au donneur.' });
      setQuoteOpenFor(null);
      setQuoteForm({ montant: '', message: '' });
  // Ouvrir le chat immédiatement
  setChatOpen({ missionId: quoteOpenFor.id, ownerId: quoteOpenFor.created_by, convoyeurId: user.id });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: e.message || 'Impossible d\'envoyer le devis.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Accept a quote: set mission assigned, contact visible; mark this devis accepted and others refused
  const handleAcceptQuote = async (dv: MarketDevis) => {
    if (!user) return;
    setSaving(true);
    try {
      // 1) Assign mission to this convoyeur and reveal contacts
      {
        const { error } = await supabase
          .from('marketplace_missions')
          .update({ convoyeur_id: dv.convoyeur_id, statut: 'attribuee', contact_visible: true })
          .eq('id', dv.mission_id);
        if (error) throw error;
      }

      // 2) Accept this devis
      {
        const { error } = await supabase
          .from('marketplace_devis')
          .update({ statut: 'accepte' })
          .eq('id', dv.id);
        if (error) throw error;
      }

      // 3) Refuse others for same mission
      {
        const { error } = await supabase
          .from('marketplace_devis')
          .update({ statut: 'refuse' })
          .eq('mission_id', dv.mission_id)
          .neq('id', dv.id);
        if (error) throw error;
      }

      toast({ title: 'Devis accepté', description: 'Le convoyeur sélectionné est affecté à la mission. Les contacts sont visibles.' });
      // Refresh lists
      fetchItems();
      // re-fetch quotes
      if (user) {
        const [{ data: mine }, { data: myMissions }] = await Promise.all([
          supabase.from('marketplace_devis').select('*').eq('convoyeur_id', user.id).order('created_at', { ascending: false }).limit(200),
          supabase.from('marketplace_missions').select('id').eq('created_by', user.id).limit(500),
        ]);
        setMyQuotes((mine || []) as any);
        const ids = (myMissions || []).map((m: any) => m.id);
        if (ids.length) {
          const { data: recv } = await supabase.from('marketplace_devis').select('*').in('mission_id', ids).order('created_at', { ascending: false }).limit(500);
          setReceivedQuotes((recv || []) as any);
        } else setReceivedQuotes([]);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: e.message || 'Impossible d\'accepter le devis.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Refuse a quote (owner decision)
  const handleRefuseQuote = async (dv: MarketDevis) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('marketplace_devis')
        .update({ statut: 'refuse' })
        .eq('id', dv.id);
      if (error) throw error;
      toast({ title: 'Devis refusé', description: 'Le transporteur en sera informé.' });
      // Refresh received quotes list
      const { data: myMissions } = await supabase.from('marketplace_missions').select('id').eq('created_by', user.id).limit(500);
      const ids = (myMissions || []).map((m: any) => m.id);
      if (ids.length) {
        const { data: recv } = await supabase.from('marketplace_devis').select('*').in('mission_id', ids).order('created_at', { ascending: false }).limit(500);
        setReceivedQuotes((recv || []) as any);
      } else setReceivedQuotes([]);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: e.message || 'Impossible de refuser le devis.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent">Marketplace</h1>
            <p className="text-muted-foreground">Publiez des missions, envoyez des devis (1 crédit)</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <CreditsDisplay variant="compact" />
            <Link to="/messages" className="text-sm underline">
              Messages {unreadMessages ? <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{unreadMessages}</span> : null}
            </Link>
            <Button onClick={onPublish}>Publier une mission</Button>
          </div>
        </div>

  <Card className="glass-card border-border/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtres</span>
              </div>
              <Input placeholder="Lieu / mot-clé" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
              <Input placeholder="Prix min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-32" />
              <Input placeholder="Prix max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-32" />
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground py-8">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucune mission</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border rounded-lg p-3 bg-card">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{m.titre}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {m.ville_depart} → {m.ville_arrivee} • {m.date_depart ? new Date(m.date_depart).toLocaleString() : '-'} • {m.prix_propose ? `${m.prix_propose.toFixed(2)} €` : '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onSendQuote(m)}>
                        <Send className="w-4 h-4 mr-1" /> Envoyer devis
                      </Button>
                      {user && (
                        <Button size="sm" variant="secondary" onClick={() => setChatOpen({ missionId: m.id, ownerId: m.created_by, convoyeurId: user.id })}>
                          Discuter
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" disabled title="Visible après acceptation">
                        <EyeOff className="w-4 h-4 mr-1" /> Voir contacts
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devis reçus (missions que j'ai publiées) */}
        {user && (
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="font-semibold flex items-center gap-2">Devis reçus {unreadQuotes ? <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{unreadQuotes}</span> : null}</div>
              {receivedQuotes.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun devis reçu pour vos missions.</div>
              ) : (
                <div className="space-y-2">
                  {receivedQuotes.map((dv) => {
                    const mission = missionMap.get(dv.mission_id);
                    return (
                      <div key={dv.id} className="flex items-center justify-between border rounded-lg p-3 bg-card">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{mission?.titre || 'Mission'}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {dv.prix_propose?.toFixed(2)} € • statut: {dv.statut || '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleAcceptQuote(dv)} disabled={saving || dv.statut === 'accepte'}>
                            <Check className="w-4 h-4 mr-1" /> Accepter
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRefuseQuote(dv)} disabled={saving || dv.statut === 'refuse'}>
                            <X className="w-4 h-4 mr-1" /> Refuser
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setChatOpen({ missionId: dv.mission_id, ownerId: mission?.created_by || user!.id, convoyeurId: dv.convoyeur_id })}>
                            Discuter
                          </Button>
                          <a className="text-sm underline" href={`/profile/${dv.convoyeur_id}`} onClick={(e) => e.stopPropagation()}>Voir profil</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mes devis (ceux que j'ai envoyés) */}
        {user && (
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="font-semibold">Mes devis</div>
              {myQuotes.length === 0 ? (
                <div className="text-sm text-muted-foreground">Vous n'avez envoyé aucun devis.</div>
              ) : (
                <div className="space-y-2">
                  {myQuotes.map((dv) => {
                    const mission = missionMap.get(dv.mission_id);
                    return (
                      <div key={dv.id} className="flex items-center justify-between border rounded-lg p-3 bg-card">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{mission?.titre || 'Mission'}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {dv.prix_propose?.toFixed(2)} € • statut: {dv.statut || '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Optionnel: annuler un devis tant qu'il n'est pas accepté */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {/* Dialogue Publication */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Publier une mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre *" value={publishForm.titre} onChange={(e) => setPublishForm({ ...publishForm, titre: e.target.value })} />
            <Textarea placeholder="Description" value={publishForm.description} onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Ville de départ *" value={publishForm.ville_depart} onChange={(e) => setPublishForm({ ...publishForm, ville_depart: e.target.value })} />
              <Input placeholder="Ville d'arrivée *" value={publishForm.ville_arrivee} onChange={(e) => setPublishForm({ ...publishForm, ville_arrivee: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="datetime-local" placeholder="Date de départ" value={publishForm.date_depart} onChange={(e) => setPublishForm({ ...publishForm, date_depart: e.target.value })} />
              <Input type="number" placeholder="Prix proposé (€)" value={publishForm.prix_propose} onChange={(e) => setPublishForm({ ...publishForm, prix_propose: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPublishOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handlePublishSubmit} disabled={saving}>{saving ? 'Publication…' : 'Publier'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue Devis */}
      <Dialog open={!!quoteOpenFor} onOpenChange={(open) => !open && setQuoteOpenFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Envoyer un devis (1 crédit){quoteOpenFor ? ` — ${quoteOpenFor.titre}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="number" placeholder="Montant (€) *" value={quoteForm.montant} onChange={(e) => setQuoteForm({ ...quoteForm, montant: e.target.value })} />
            <Textarea placeholder="Message" value={quoteForm.message} onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setQuoteOpenFor(null)} disabled={saving}>Annuler</Button>
            <Button onClick={handleQuoteSubmit} disabled={saving}>{saving ? 'Envoi…' : 'Envoyer (1 crédit)'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {chatOpen && (
        <ChatDrawer
          missionId={chatOpen.missionId}
          ownerId={chatOpen.ownerId}
          convoyeurId={chatOpen.convoyeurId}
          open={!!chatOpen}
          onOpenChange={(o) => !o ? setChatOpen(null) : void 0}
        />
      )}
    </div>
  );
};

export default Marketplace;
