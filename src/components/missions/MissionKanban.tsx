import { Mission, MissionStatus } from '@/lib/mission-types';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { ALLOW_STATUS_CHANGE } from '@/lib/mission-policy';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getMissionStatusStyle } from '@/lib/mission-status-colors';

interface Props { missions: Mission[]; onStatusChange?: (id:string, status:MissionStatus)=>void }

const ORDER: MissionStatus[] = ['En attente','En cours','En retard','Livrée','Annulée'];

function KanbanCard({ mission, onClick }:{ mission:Mission; onClick:()=>void }){
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: mission.id});
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging?0.5:1 };
  const statusStyle = getMissionStatusStyle(mission.status);
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`focus-premium relative text-left rounded-lg border p-3 bg-gradient-to-b from-background/40 to-background/10 hover:border-border outline-none transition text-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg ${statusStyle.cardBorder}`}
      role="option"
      aria-label={`Mission ${mission.client.name} ${mission.departure.address.city} vers ${mission.arrival.address.city}`}
    >
      <div className="flex justify-between mb-1"><span className="font-medium">{mission.client.name}</span><span className="font-mono text-[10px] opacity-70">{mission.id}</span></div>
      <div className="opacity-80">{mission.vehicle.brand} {mission.vehicle.model}</div>
  <div className="mt-1 text-[10px] opacity-60 flex items-center gap-1"> <span className={`inline-block w-2 h-2 rounded-full ${statusStyle.dot}`} /> {mission.departure.address.city} → {mission.arrival.address.city}</div>
    </button>
  );
}

export const MissionKanban: React.FC<Props> = ({ missions, onStatusChange }) => {
  const [internal,setInternal]=useState<Mission[]>(missions);
  // Sync when missions prop changes (basic)
  if(internal!==missions && missions.length!==internal.length){ setInternal(missions); }

  const grouped = useMemo(()=>{
    const map: Record<string, Mission[]> = {};
    ORDER.forEach(s=> map[s]=[]);
    internal.forEach(m=>{ if(!map[m.status]) map[m.status]=[]; map[m.status].push(m); });
    return map;
  },[internal]);
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor,{activationConstraint:{ distance:5 }}));

  const handleDragEnd = (e:DragEndEvent)=>{
    if(!ALLOW_STATUS_CHANGE) return; // drag ignoré
    const {over, active} = e; if(!over) return; // dropped outside
    const overCol = over.data.current?.column as MissionStatus | undefined; // drop target column id
    if(!overCol) return;
    setInternal(prev=> prev.map(m=> m.id===active.id ? {...m, status: overCol, updatedAt:new Date().toISOString()} : m));
    if(onStatusChange) onStatusChange(String(active.id), overCol);
  };

  return <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <div className={`grid gap-4 md:grid-cols-3 xl:grid-cols-5 ${!ALLOW_STATUS_CHANGE ? 'opacity-95':''}`} role="list" aria-label="Tableau Kanban des missions">
      {ORDER.map(status => (
        <SortableContext key={status} items={grouped[status].map(m=>m.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3" role="group" aria-label={`Colonne ${status}`}> 
            <div className="flex items-center justify-between" aria-live="off">
              <h4 className="text-sm font-semibold" id={`col-${status}`}>{status}</h4>
              <Badge variant="outline" className="text-xs px-2" aria-label={`${grouped[status].length} missions`}>{grouped[status].length}</Badge>
            </div>
            <div className="flex flex-col gap-2 min-h-[120px]" data-column={status} role="listbox" aria-labelledby={`col-${status}`}> 
              {grouped[status].map(m => <KanbanCard key={m.id} mission={m} onClick={()=>navigate(`/missions/${m.id}`)} />)}
              {grouped[status].length===0 && <div className="text-muted-foreground/40 text-xs italic">Vide</div>}
            </div>
          </div>
        </SortableContext>
      ))}
    </div>
  </DndContext>;
};
