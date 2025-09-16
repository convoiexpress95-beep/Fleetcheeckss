import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { missionsMock } from '@/lib/mission-mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { MissionStatus } from '@/lib/mission-types';
import { getMissionStatusStyle } from '@/lib/mission-status-colors';

interface StatusEvent { status: MissionStatus; at: string; note?: string }

// Simple mapping for colors (could be replaced by design tokens)
const statusTone: Record<MissionStatus,string> = {
  'En attente':'bg-amber-500/15 text-amber-600 border-amber-500/30',
  'En cours':'bg-blue-500/15 text-blue-600 border-blue-500/30',
  'En retard':'bg-red-500/15 text-red-600 border-red-500/30',
  'Livrée':'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  'Annulée':'bg-gray-500/15 text-gray-600 border-gray-500/30'
};

const MissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mission = useMemo(()=> missionsMock.find(m=>m.id === id),[id]);
  const [history, setHistory] = useState<StatusEvent[]>([]);
  const liveRef = useRef<HTMLDivElement|null>(null);

  // Seed history with synthetic events (for demo) based on mission timestamps
  useEffect(()=>{
    if(!mission) return;
    // create a deterministic progression for demo purposes
    const base: StatusEvent[] = [];
    const createdAt = mission.createdAt || mission.departure.date;
    base.push({status: 'En attente', at: createdAt});
    if(mission.status !== 'En attente'){
      base.push({status: 'En cours', at: mission.updatedAt || mission.departure.date});
    }
    if(mission.status === 'En retard'){
      base.push({status: 'En retard', at: mission.updatedAt || mission.departure.date});
    }
    if(mission.status === 'Livrée'){
      base.push({status: 'Livrée', at: mission.arrival.expectedDate});
    }
    if(mission.status === 'Annulée'){
      base.push({status: 'Annulée', at: mission.updatedAt || new Date().toISOString()});
    }
    // Deduplicate consecutive
    const cleaned = base.filter((e,i,a)=> i===0 || a[i-1].status!==e.status);
    setHistory(cleaned);
  },[mission]);

  useEffect(()=>{ // announce last event for screen readers
    if(!liveRef.current || !history.length) return; 
    const last = history[history.length-1];
    liveRef.current.textContent = `Statut: ${last.status} à ${new Date(last.at).toLocaleString('fr-FR')}`;
  },[history]);

  if(!mission) return <div className="p-10 text-center text-muted-foreground" role="alert">Mission introuvable</div>;
  const style = getMissionStatusStyle(mission.status);
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8" aria-labelledby="mission-title">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 id="mission-title" className="text-2xl font-bold tracking-tight">
            <span className="sr-only">Mission client </span>{mission.client.name} • {mission.vehicle.brand} {mission.vehicle.model}
          </h1>
          <p className="text-xs text-muted-foreground font-mono" aria-label="Identifiant mission">{mission.id}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <Badge variant="outline" className={`${style.badge} border`}>{mission.status}</Badge>
          <Button variant="secondary" onClick={()=>navigate(-1)} aria-label="Revenir à la liste"><ArrowLeft className="w-4 h-4 mr-1"/>Retour</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <section aria-labelledby="itinerary-heading" className="glass rounded-lg p-4 focus-premium" tabIndex={0}>
            <h2 id="itinerary-heading" className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Itinéraire</h2>
            <div className="flex flex-col gap-1 text-xs">
              <div><span className="font-medium">Trajet:</span> {mission.departure.address.city} → {mission.arrival.address.city}</div>
              <div>Départ: {new Date(mission.departure.date).toLocaleString('fr-FR')}</div>
              <div>Arrivée estimée: {new Date(mission.arrival.expectedDate).toLocaleString('fr-FR')}</div>
            </div>
          </section>

            <section aria-labelledby="vehicle-heading" className="glass rounded-lg p-4 focus-premium" tabIndex={0}>
              <h2 id="vehicle-heading" className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Véhicule</h2>
              <ul className="text-xs space-y-1">
                <li><span className="font-medium">Modèle:</span> {mission.vehicle.brand} {mission.vehicle.model}</li>
                <li><span className="font-medium">Énergie:</span> {mission.vehicle.energy}</li>
                <li><span className="font-medium">Plaque:</span> {mission.vehicle.licensePlate}</li>
              </ul>
            </section>

            <section aria-labelledby="options-heading" className="glass rounded-lg p-4 focus-premium" tabIndex={0}>
              <h2 id="options-heading" className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Options</h2>
              <ul className="text-xs space-y-1 list-disc ml-4">
                <li>Tracking GPS: {mission.options.gpsTracking? 'Oui':'Non'}</li>
                <li>Inspection départ: {mission.options.departureInspection? 'Oui':'Non'}</li>
                <li>Inspection arrivée: {mission.options.arrivalInspection? 'Oui':'Non'}</li>
                <li>Aller / Retour: {mission.options.roundTrip? 'Oui':'Non'}</li>
              </ul>
            </section>

            <section aria-labelledby="notes-heading" className="glass rounded-lg p-4 focus-premium" tabIndex={0}>
              <h2 id="notes-heading" className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Notes</h2>
              <p className="text-xs whitespace-pre-line opacity-80">{mission.notes || 'Aucune note'}</p>
            </section>
        </div>
        <aside className="space-y-6" aria-label="Panneau latéral mission">
          <section aria-labelledby="status-timeline-heading" className="glass rounded-lg p-4">
            <h2 id="status-timeline-heading" className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Historique Statuts</h2>
            <ol className="relative border-l border-border/40 pl-4 text-xs space-y-4" aria-live="polite">
              {history.map((ev,i)=>{
                const last = i===history.length-1;
                return (
                  <li key={i} className="ml-0" aria-current={last? 'step': undefined}>
                    <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border border-border/40 ${last? 'bg-primary/60':'bg-muted'}`} />
                    <div className="flex flex-col gap-0.5">
                      <span className={`inline-flex w-fit items-center gap-1 rounded border px-2 py-0.5 font-medium ${statusTone[ev.status]}`}>{ev.status}</span>
                      <time className="opacity-60" dateTime={ev.at}>{new Date(ev.at).toLocaleString('fr-FR')}</time>
                    </div>
                  </li>
                );
              })}
              {!history.length && <li className="text-muted-foreground">Aucun évènement</li>}
            </ol>
          </section>
          <section aria-labelledby="meta-heading" className="glass rounded-lg p-4 text-xs space-y-2">
            <h2 id="meta-heading" className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Métadonnées</h2>
            <div><span className="font-medium">Créée:</span> {mission.createdAt? new Date(mission.createdAt).toLocaleString('fr-FR'):'—'}</div>
            <div><span className="font-medium">MAJ:</span> {mission.updatedAt? new Date(mission.updatedAt).toLocaleString('fr-FR'):'—'}</div>
            <div><span className="font-medium">Distance:</span> {mission.distance} km</div>
            <div><span className="font-medium">Durée estimée:</span> {mission.estimatedDuration} min</div>
          </section>
          <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
        </aside>
      </div>
    </div>
  );
};
export default MissionDetail;
