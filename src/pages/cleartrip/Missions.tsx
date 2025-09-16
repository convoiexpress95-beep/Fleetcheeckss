import React from 'react';
import { Link } from 'react-router-dom';

const demoMissions = [
  { id: 'a1', title: 'Inspection dépôt nord', status: 'planifiée' },
  { id: 'b2', title: 'Livraison urgente client X', status: 'en cours' },
  { id: 'c3', title: 'Collecte retour matériel', status: 'terminée' },
];

export default function ClearTripMissions(){
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ClearTrip - Missions</h1>
        <div className="text-xs text-muted-foreground">(données de démonstration)</div>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border/50 bg-background/40 backdrop-blur-sm">
        {demoMissions.map(m => (
          <li key={m.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
            <div>
              <div className="font-medium text-sm">{m.title}</div>
              <div className="text-[11px] uppercase tracking-wide text-foreground/60">{m.status}</div>
            </div>
            <Link to={`/cleartrip/missions/${m.id}`} className="text-primary text-xs font-medium hover:underline">Ouvrir</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
