import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, CheckCircle2 } from 'lucide-react';

const AcceptedMarketplaceMissions: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['marketplace-accepted'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Connexion requise');
      const { data, error } = await supabase
        .from('mission_applications')
        .select(`id, status, price_offer, mission:missions!inner(id, title, pickup_address, delivery_address, reference, kind)`) // inner join, filter kind below
        .eq('status', 'accepted')
        .eq('mission.kind', 'marketplace')
        .eq('mission.created_by', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Missions validées (Marketplace)</h1>
        <p className="text-sm text-muted-foreground">Vos missions du marketplace acceptées par un convoyeur.</p>
      </div>
      {isLoading && <div className="text-muted-foreground">Chargement…</div>}
      {error && <div className="text-destructive">{(error as any).message}</div>}
      {!isLoading && !error && (
        <div className="grid gap-4">
          {data?.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune mission validée</CardContent></Card>
          )}
          {data?.map((row: any) => (
            <Card key={row.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{row.mission?.title || 'Mission'}</CardTitle>
                <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-5 h-5" /> Acceptée</div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5" /> {row.mission?.pickup_address || '—'}</div>
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 rotate-180" /> {row.mission?.delivery_address || '—'}</div>
                <div className="text-xs text-muted-foreground">Réf: {row.mission?.reference}</div>
                {row.price_offer != null && <div className="text-sm">Devis accepté: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(row.price_offer)}</div>}
                <div className="pt-2">
                  <Button variant="secondary" onClick={()=>{ /* future: lien vers suivi */ }}>Voir détails</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedMarketplaceMissions;
