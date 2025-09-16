import MissionHeader from '@/components/missions/MissionHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MissionKPIs } from '@/components/missions/MissionKPIs';
import { MissionFilters } from '@/components/missions/MissionFilters';
import { MissionTable } from '@/components/missions/MissionTable';
import { MissionCreateDrawer } from '@/components/missions/MissionCreateDrawer';
import { useMissionStore } from '@/hooks/useMissionStore';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ALLOW_STATUS_CHANGE } from '@/lib/mission-policy';

const MissionsPage = () => {
  const { viewMode, setViewMode, filtered, pageItems, pageCount, page, setPage, addMission, filters, setFilters, updateMissionStatus, removeMission, sort, toggleSort } = useMissionStore();
  const [loading, setLoading] = useState(true); // simulé
  const [search] = useSearchParams();
  const [open, setOpen] = useState(false);
  // Wizard avancé supprimé
  const [compact, setCompact] = useState(false);
  
  // Détecter les paramètres URL pour pré-remplir le formulaire avec un contact assigné
  const preAssignedContact = useMemo(() => {
    const assignedTo = search.get('assigned_to');
    const contactId = search.get('assigned_contact_id');
    const contactName = search.get('assigned_contact_name');
    const contactEmail = search.get('assigned_contact_email');
    
    if (assignedTo === 'contact' && contactId) {
      return {
        id: contactId,
        name: contactName || contactEmail?.split('@')[0] || '',
        email: contactEmail || ''
      };
    }
    return null;
  }, [search]);

  // Ouvrir automatiquement le drawer si un contact est pré-assigné
  useEffect(() => {
    if (preAssignedContact && !open) {
      setOpen(true);
    }
  }, [preAssignedContact, open]);

  // Sync viewMode with URL parameter on mount
  // (Vue kanban supprimée)
  const items = viewMode==='list'? pageItems : filtered;
  useEffect(()=>{ const t = setTimeout(()=> setLoading(false), 600); return ()=> clearTimeout(t); },[]);
  const exportCsv = () => {
    if(!filtered.length) return;
    const headers = ['ID','Client','Véhicule','Départ','Arrivée','Statut','Date départ'];
    const rows = filtered.map(m => [m.id, m.client.name, `${m.vehicle.brand} ${m.vehicle.model}`, m.departure.address.city, m.arrival.address.city, m.status, new Date(m.departure.date).toLocaleDateString('fr-FR')]);
    const csv = [headers, ...rows].map(r=> r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `missions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  // Garde basique si hook store casse (évite écran blanc total)
  if(!Array.isArray(filtered)) {
    return <div className="p-6 text-sm text-red-400">Store missions indisponible</div>;
  }

  return (
    <ErrorBoundary>
    <div className={`p-6 max-w-7xl mx-auto ${compact?'density-compact':''}`}>
  <MissionHeader compact={compact} onToggleCompact={()=>setCompact(c=>!c)} count={filtered.length} viewMode={'list'} onToggleView={()=>{}} onCreate={()=>{ setOpen(true); }} />
  {/* Bouton de bascule wizard retiré */}
      <MissionKPIs missions={filtered} activeFilters={filters.status} onQuickFilter={(payload)=>{
        if(payload==='ALL') setFilters(f=>({...f, status:[]}));
        else setFilters(f=>({...f, status:payload}));
      }} />
      <MissionFilters filters={filters} onChange={setFilters} />

      {loading && (
        <div className="mt-4 space-y-4" aria-label="Chargement des missions">
          <div className="glass-card rounded-xl h-12 animate-pulse bg-white/5" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({length: viewMode==='list'?6:9}).map((_,i)=>(
              <div key={i} className="glass rounded-lg p-4 animate-pulse flex flex-col gap-3">
                <div className="h-3 w-1/3 bg-white/10 rounded" />
                <div className="h-3 w-2/3 bg-white/10 rounded" />
                <div className="flex gap-2">
                  <div className="h-3 w-10 bg-white/10 rounded" />
                  <div className="h-3 w-14 bg-white/10 rounded" />
                </div>
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <MissionTable missions={items} onStatusChange={ALLOW_STATUS_CHANGE? (id,s)=>updateMissionStatus(id,s) : undefined} onExportCsv={exportCsv} onRemove={id=>removeMission(id)} sortField={sort.field} sortDir={sort.dir} onToggleSort={(f)=>toggleSort(f as any)} />
      )}

      {!loading && !items.length && (
        <div className="mt-12 text-center space-y-4" role="status" aria-live="polite">
          {filtered.length===0 && (filters.search || filters.status.length) ? (
            <>
              <p className="text-sm text-muted-foreground/70">Aucun résultat avec les filtres actuels.</p>
              <button onClick={()=> setFilters(f=>({...f, search:'', status:[]}))} className="text-xs underline text-teal-300 hover:text-teal-200">Réinitialiser les filtres</button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground/70">Aucune mission encore créée.</p>
              <button onClick={()=>{ setOpen(true); }} className="btn-turquoise text-xs px-3 py-2 rounded-md">Créer une première mission</button>
            </>
          )}
        </div>
      )}
      {viewMode==='list' && pageCount>1 && (
        <div className="flex justify-end mt-4 gap-2 text-sm">
          <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded border disabled:opacity-40">Préc.</button>
          <span className="px-2">Page {page+1}/{pageCount}</span>
          <button disabled={page+1===pageCount} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border disabled:opacity-40">Suiv.</button>
        </div>
      )}
  <MissionCreateDrawer 
    open={open} 
    onClose={() => setOpen(false)} 
    onCreate={(m) => addMission(m)}
    preAssignedContact={preAssignedContact}
  />
    </div>
    </ErrorBoundary>
  );
};
export default MissionsPage;