import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface Mission {
  id: string;
  titre: string;
  statut: string;
  ville_depart: string;
  ville_arrivee: string;
}

export default function ClearTripMissions(){
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_missions')
        .select('id, titre, statut, ville_depart, ville_arrivee')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setMissions(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading missions:', err);
      setError('Erreur lors du chargement des missions');
      // Données de fallback en cas d'erreur
      setMissions([
        { id: 'demo-a1', titre: 'Inspection dépôt nord', statut: 'planifiée', ville_depart: 'Paris', ville_arrivee: 'Lyon' },
        { id: 'demo-b2', titre: 'Livraison urgente client X', statut: 'en cours', ville_depart: 'Lyon', ville_arrivee: 'Marseille' },
        { id: 'demo-c3', titre: 'Collecte retour matériel', statut: 'terminée', ville_depart: 'Marseille', ville_arrivee: 'Nice' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'ouverte':
      case 'planifiée':
        return 'text-blue-600';
      case 'en_cours':
      case 'en cours':
        return 'text-orange-600';
      case 'terminée':
        return 'text-green-600';
      case 'annulée':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ClearTrip - Missions</h1>
        <div className="text-xs text-muted-foreground">
          {loading ? 'Chargement...' : error ? '(données de démonstration)' : `${missions.length} missions`}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Chargement des missions...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-700">{error} - Affichage des données de démonstration</span>
        </div>
      ) : null}
      
      <ul className="divide-y divide-border rounded-md border border-border/50 bg-background/40 backdrop-blur-sm">
        {missions.map(m => (
          <li key={m.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
            <div>
              <div className="font-medium text-sm">{m.titre}</div>
              <div className={`text-[11px] uppercase tracking-wide ${getStatusColor(m.statut)}`}>
                {m.statut}
              </div>
              {m.ville_depart && m.ville_arrivee && (
                <div className="text-xs text-muted-foreground mt-1">
                  {m.ville_depart} → {m.ville_arrivee}
                </div>
              )}
            </div>
            <Link to={`/cleartrip/missions/${m.id}`} className="text-primary text-xs font-medium hover:underline">Ouvrir</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
