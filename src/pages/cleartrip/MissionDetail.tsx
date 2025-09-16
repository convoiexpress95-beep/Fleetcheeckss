import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ClearTripMissionDetail(){
  const { id } = useParams();
  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/cleartrip/missions" className="text-xs text-primary hover:underline">← Retour</Link>
        <h1 className="text-2xl font-bold">Mission #{id}</h1>
      </div>
      <p className="text-sm text-muted-foreground">Détails fictifs de la mission. Remplacer par des données réelles (Supabase) plus tard.</p>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-lg border border-border/50 p-4 bg-background/50">
          <div className="text-xs font-medium text-muted-foreground mb-1">Statut</div>
          <div className="font-semibold">En cours</div>
        </div>
        <div className="rounded-lg border border-border/50 p-4 bg-background/50">
          <div className="text-xs font-medium text-muted-foreground mb-1">Responsable</div>
          <div className="font-semibold">Utilisateur Demo</div>
        </div>
        <div className="rounded-lg border border-border/50 p-4 bg-background/50">
          <div className="text-xs font-medium text-muted-foreground mb-1">Créée le</div>
          <div className="font-semibold">2025-09-12</div>
        </div>
      </div>
    </div>
  );
}
