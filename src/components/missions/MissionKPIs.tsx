import { Mission, MissionStatus } from '@/lib/mission-types';
import { useMemo } from 'react';
import { getMissionStatusStyle } from '@/lib/mission-status-colors';

interface Props { missions: Mission[]; activeFilters: MissionStatus[]; onQuickFilter: (single: MissionStatus[] | 'ALL')=>void }

// Ordre sans 'En retard' (retiré à la demande)
const ORDER: MissionStatus[] = ['En attente','En cours','Livrée','Annulée'];

export const MissionKPIs: React.FC<Props> = ({ missions, activeFilters, onQuickFilter }) => {
  const counts = useMemo(()=>{
    const map: Record<string, number> = { ALL: missions.length };
    ORDER.forEach(s=> map[s]= missions.filter(m=>m.status===s).length);
    return map;
  },[missions]);
  const isAll = activeFilters.length===0;
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={()=>onQuickFilter('ALL')}
        className={`relative overflow-hidden px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all backdrop-blur focus-premium
        ${isAll? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_6px_22px_-4px_rgba(0,220,200,0.55)]':'glass opacity-80 hover:opacity-100'}
        `}
      >
        <span className="relative z-10">Toutes</span>
        <span className="ml-2 text-[11px] font-medium inline-block bg-black/20 text-white/90 px-2 py-0.5 rounded-md shadow-inner">{counts.ALL}</span>
        {isAll && <span className="absolute inset-0 bg-white/30 mix-blend-overlay animate-pulse opacity-20" />}
      </button>
      {ORDER.map(s=>{
        const active = activeFilters.includes(s) && activeFilters.length===1;
        const st = getMissionStatusStyle(s);
        // On réutilise la classe badge comme base visuelle pour cohérence
        return (
          <button
            key={s}
            onClick={()=>onQuickFilter([s])}
            className={`relative inline-flex items-center gap-1 rounded-xl text-sm font-medium px-4 py-2 focus-premium transition-all border ${st.badge} ${active? 'ring-1 ring-teal-300/60 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_16px_-2px_rgba(0,200,255,0.4)]':'opacity-80 hover:opacity-100 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_14px_-2px_rgba(0,200,255,0.25)]'}`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${st.dot}`} />
            {s}
            <span className="ml-2 text-[11px] px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner">{counts[s]}</span>
          </button>
        );
      })}
    </div>
  );
};
export default MissionKPIs;
