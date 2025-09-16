import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mission, MissionStatus } from '@/lib/mission-types';

/* Wizard multi-étapes minimal (draft localStorage) */
interface Props { open:boolean; onClose:()=>void; onCreate:(m:Mission)=>void; }
interface DraftStep1 { clientName:string; contactEmail:string; }
interface DraftStep2 { vehicleBrand:string; vehicleModel:string; license:string; }
interface DraftStep3 { depCity:string; arrCity:string; depDate:string; arrDate:string; }
interface Draft extends DraftStep1, DraftStep2, DraftStep3 { priority:'Normale'|'Urgente'; inspections:boolean; }
const draftKey = 'mission_wizard_draft_v1';

export const MissionCreateWizard: React.FC<Props> = ({open,onClose,onCreate}) => {
  const [step,setStep]=useState(1);
  const [draft,setDraft]=useState<Draft>({clientName:'',contactEmail:'',vehicleBrand:'',vehicleModel:'',license:'',depCity:'',arrCity:'',depDate:'',arrDate:'',priority:'Normale',inspections:false});
  useEffect(()=>{ if(open){ const raw=localStorage.getItem(draftKey); if(raw){ try{ setDraft(JSON.parse(raw)); }catch{} } } else { setStep(1);} },[open]);
  useEffect(()=>{ if(open) localStorage.setItem(draftKey, JSON.stringify(draft)); },[draft,open]);

  const update = (p:Partial<Draft>)=>setDraft(d=>({...d,...p}));
  const canNext = ()=>{
    if(step===1) return draft.clientName.length>1 && /@/.test(draft.contactEmail);
    if(step===2) return draft.vehicleBrand && draft.vehicleModel && draft.license.length>4;
    if(step===3) return draft.depCity && draft.arrCity && draft.depDate && draft.arrDate;
    return true;
  };
  const resetDraft=()=>{ localStorage.removeItem(draftKey); setDraft({clientName:'',contactEmail:'',vehicleBrand:'',vehicleModel:'',license:'',depCity:'',arrCity:'',depDate:'',arrDate:'',priority:'Normale',inspections:false}); };
  const submit=()=>{
    const now=new Date().toISOString();
    const mission: Mission = {
      id: 'M-'+Math.random().toString(36).slice(2,8).toUpperCase(),
      client:{ name:draft.clientName, contact:{ name:draft.clientName+' Contact', email:draft.contactEmail, phone:'+3300000000'}},
      vehicle:{ brand:draft.vehicleBrand, model:draft.vehicleModel, licensePlate:draft.license, category:'VL', energy:'Essence'},
      departure:{ address:{ street:'', city:draft.depCity, postalCode:'', country:'France'}, contact:{ name:'', email:draft.contactEmail, phone:''}, date:draft.depDate, timeSlot:'08:00-10:00'},
      arrival:{ address:{ street:'', city:draft.arrCity, postalCode:'', country:'France'}, contact:{ name:'', email:draft.contactEmail, phone:''}, expectedDate:draft.arrDate, timeSlot:'15:00-17:00'},
      status:'En attente' as MissionStatus, priority:draft.priority, distance:0, estimatedDuration:0,
      options:{ gpsTracking:true, departureInspection:draft.inspections, arrivalInspection:draft.inspections, roundTrip:false },
      createdAt:now, updatedAt:now
    };
    onCreate(mission); resetDraft(); onClose();
  };
  const close=()=>{ onClose(); };

  return <Dialog open={open} onOpenChange={o=>!o && close()}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader><DialogTitle>Nouvelle mission {step}/3</DialogTitle></DialogHeader>
      <div className="min-h-[260px] py-2 space-y-6">
        {step===1 && <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Client *</label>
            <Input value={draft.clientName} onChange={e=>update({clientName:e.target.value})} placeholder="Nom client" />
          </div>
            <div>
            <label className="text-sm font-medium">Email contact *</label>
            <Input value={draft.contactEmail} onChange={e=>update({contactEmail:e.target.value})} placeholder="contact@client.fr" />
          </div>
        </div>}
        {step===2 && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Marque *</label><Input value={draft.vehicleBrand} onChange={e=>update({vehicleBrand:e.target.value})} /></div>
          <div><label className="text-sm font-medium">Modèle *</label><Input value={draft.vehicleModel} onChange={e=>update({vehicleModel:e.target.value})} /></div>
          <div><label className="text-sm font-medium">Immat. *</label><Input value={draft.license} onChange={e=>update({license:e.target.value.toUpperCase()})} /></div>
        </div>}
        {step===3 && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Ville départ *</label><Input value={draft.depCity} onChange={e=>update({depCity:e.target.value})} /></div>
          <div><label className="text-sm font-medium">Ville arrivée *</label><Input value={draft.arrCity} onChange={e=>update({arrCity:e.target.value})} /></div>
          <div><label className="text-sm font-medium">Date départ *</label><Input type="date" value={draft.depDate} onChange={e=>update({depDate:e.target.value})} /></div>
          <div><label className="text-sm font-medium">Date arrivée *</label><Input type="date" value={draft.arrDate} onChange={e=>update({arrDate:e.target.value})} /></div>
          <div className="col-span-full flex items-center gap-3">
            <input id="insp" type="checkbox" checked={draft.inspections} onChange={e=>update({inspections:e.target.checked})} />
            <label htmlFor="insp" className="text-sm">Activer inspections départ & arrivée</label>
          </div>
        </div>}
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2 text-xs text-muted-foreground">
          <button className="underline" onClick={resetDraft}>Réinitialiser</button>
          <button className="underline" onClick={()=>{localStorage.removeItem(draftKey);}}>Suppression brouillon</button>
        </div>
        <div className="flex gap-2">
          {step>1 && <Button variant="ghost" onClick={()=>setStep(s=>s-1)}>Retour</Button>}
          {step<3 && <Button disabled={!canNext()} onClick={()=>setStep(s=>s+1)}>Suivant</Button>}
          {step===3 && <Button disabled={!canNext()} onClick={submit}>Créer</Button>}
        </div>
      </div>
    </DialogContent>
  </Dialog>;
};
