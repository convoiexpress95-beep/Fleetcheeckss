import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FleetCheckWizard } from '@/components/FleetCheckWizard';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Page dédiée pour afficher le wizard d'inspection complet d'une mission.
// Résout le 404 sur /missions/:id/inspection (lien présent dans MissionsPremium).

interface MissionRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  description?: string;
  [k: string]: any;
}

export default function MissionInspectionPage() {
  const { id } = useParams();
  const [mission, setMission] = useState<MissionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) { setError('Identifiant manquant'); setLoading(false); return; }
      setLoading(true);
      try {
        const { data, error } = await supabase.from('missions').select('*').eq('id', id).single();
        if (!active) return;
        if (error) { setError(error.message); }
        else if (!data) { setError('Mission introuvable'); }
        else { setMission(data as MissionRow); }
      } catch (e: any) {
        if (active) setError(e.message || 'Erreur inattendue');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const currentStep = useMemo<'departure' | 'conveyance' | 'arrival' | 'costs'>(() => {
    if (!mission) return 'departure';
    switch (mission.status) {
      case 'pending': return 'departure';
      case 'inspection_start':
      case 'in_progress': return 'conveyance';
      case 'inspection_end': return 'arrival';
      case 'cost_validation': return 'costs';
      default: return 'departure';
    }
  }, [mission]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> Chargement de la mission…
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-lg">Inspection mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-destructive font-medium">{error || 'Mission introuvable'}</p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/missions"><ArrowLeft className="w-4 h-4 mr-1" />Retour missions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/missions"><ArrowLeft className="w-4 h-4 mr-1" />Retour</Link>
        </Button>
        <h1 className="text-2xl font-bold">Inspection – {mission.title}</h1>
      </div>
      {/* On réutilise le composant FleetCheckWizard en mode pleine page */}
      <FleetCheckWizard mission={mission} open={open} onOpenChange={setOpen} currentStep={currentStep} />
      {!open && (
        <div className="mt-6">
          <Button size="sm" onClick={() => setOpen(true)}>Rouvrir le wizard</Button>
        </div>
      )}
    </div>
  );
}
