import MissionHeader from '@/components/missions/MissionHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MissionKPIs } from '@/components/missions/MissionKPIs';
import { MissionFilters } from '@/components/missions/MissionFilters';
import { MissionTable } from '@/components/missions/MissionTable';
import { MissionCreateDrawer } from '@/components/missions/MissionCreateDrawer';
import { useMissionSupabase, SupabaseMission } from '@/hooks/useMissionSupabase';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const MissionsPage = () => {
  const { 
    viewMode, 
    setViewMode, 
    filtered, 
    pageItems, 
    pageCount, 
    page, 
    setPage, 
    addMission, 
    filters, 
    setFilters, 
    updateMissionStatus, 
    removeMission, 
    sort, 
    toggleSort,
    loading,
    missions
  } = useMissionSupabase();
  
  const [search] = useSearchParams();
  const [open, setOpen] = useState(false);
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
  // useEffect for loading removed - now handled by useMissionSupabase
  const exportCsv = () => {
    if(!filtered.length) return;
    const headers = ['ID','Titre','Véhicule','Départ','Arrivée','Statut','Date départ'];
    const rows = filtered.map(m => [m.id, m.titre || 'N/A', m.vehicule_requis || 'N/A', m.ville_depart, m.ville_arrivee, m.statut, new Date(m.date_depart).toLocaleDateString('fr-FR')]);
    const csv = [headers, ...rows].map(r=> r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `missions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  // Mappe le statut UI vers le statut Supabase
  const handleStatusChange = (id: string, status: 'En attente'|'En cours'|'En retard'|'Livrée'|'Annulée') => {
    // Conversion des anciens statuts vers les nouveaux
    const statusMap: { [key: string]: string } = {
      'En attente': 'ouverte',
      'En cours': 'en_negociation', // 'En cours' peut être en_negociation ou attribuee
      'En retard': 'en_negociation',
      'Livrée': 'terminee',
      'Annulée': 'annulee'
    };
    const supabaseStatus = statusMap[status] || 'ouverte';
    updateMissionStatus(id, supabaseStatus as any);
  };

  // Plus d'adaptateur: les composants consomment désormais SupabaseMission directement

  // Plus de conversion locale: le drawer fournit désormais directement InsertSupabaseMission

  return (
    <ErrorBoundary>
    <div className={`p-6 max-w-7xl mx-auto ${compact?'density-compact':''}`}>
  <MissionHeader compact={compact} onToggleCompact={()=>setCompact(c=>!c)} count={filtered.length} viewMode={'list'} onToggleView={()=>{}} onCreate={()=>{ setOpen(true); }} />
  {/* Bouton de bascule wizard retiré */}
            {(() => {
              const activeUi: Array<'En attente'|'En cours'|'Livrée'|'Annulée'|'En retard'> = (filters.status || []).map(s => s==='terminee' ? 'Livrée' : s==='annulee' ? 'Annulée' : s==='en_negociation' || s==='attribuee' ? 'En cours' : 'En attente');
              return (
            <MissionKPIs 
              missions={filtered as SupabaseMission[]} 
              activeFilters={activeUi} 
              onQuickFilter={(payload: any)=>{
                if (payload === 'ALL') {
                  setFilters({ ...filters, status: [] });
                } else {
                  // Map UI → supabase
                  const mapped = (payload as string[]).map(s => 
                    s==='Livrée' ? 'terminee' : s==='Annulée' ? 'annulee' : s==='En cours' ? 'en_negociation' : 'ouverte'
                  );
                  setFilters({ ...filters, status: mapped });
                }
              }} 
            />);
            })()}
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
        <MissionTable 
          missions={pageItems as SupabaseMission[]} 
          onStatusChange={handleStatusChange} 
          onExportCsv={exportCsv} 
          onRemove={id => removeMission(id)} 
          sortField={sort.field} 
          sortDir={sort.dir} 
          onToggleSort={toggleSort} 
        />
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
    onCreate={addMission}
    preAssignedContact={preAssignedContact}
  />
    </div>
    </ErrorBoundary>
  );
};
export default MissionsPage;