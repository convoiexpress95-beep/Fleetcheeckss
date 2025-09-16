import { Button } from '@/components/ui/button';
import { MissionStatus } from '@/lib/mission-types';
import { MissionFiltersState } from '@/hooks/useMissionStore';
import { useState, useEffect } from 'react';

const ALL_STATUSES: MissionStatus[] = ['En attente','En cours','Livrée','Annulée','En retard']; // conservé mais non affiché

interface Props {
  filters: MissionFiltersState;
  onChange: (f: MissionFiltersState)=>void;
}
export const MissionFilters: React.FC<Props> = ({ filters, onChange }) => {
  // Barre recherche & badges retirés (doublon avec nouveaux quick filters)
  const reset = () => onChange({ ...filters, search:'', status:[], client:[], convoyeur:[], dateFrom:undefined, dateTo:undefined });
  return (
    <div className="flex justify-end mb-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>Reset</Button>
        <Button variant="outline" size="sm" disabled>Export CSV</Button>
      </div>
    </div>
  );
};
