import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// Import relatif pour éviter problème de résolution alias dans certains contextes TS
import { FileAttachmentZone } from '../ui/FileAttachmentZone';
import { Mission, MissionStatus, Vehicle } from '@/lib/mission-types';
import { cn } from '@/lib/utils';
// Importer le nouveau schéma
import { newMissionFormSchema, type NewMissionFormValues } from './NewMissionForm';

// Utiliser le nouveau schéma
export const missionFormSchema = newMissionFormSchema;
export type MissionFormValues = NewMissionFormValues;

const defaultValues: MissionFormValues = {
  clientName: '',
  clientContact: {
    name: '',
    email: '',
    phone: ''
  },
  vehicle: {
    brand: '',
    model: '',
    licensePlate: '',
    category: 'VL',
    energy: 'Essence',
    image: undefined
  },
  departure: {
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    date: '',
    timeSlot: '08:00-18:00'
  },
  arrival: {
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    expectedDate: '',
    timeSlot: '08:00-18:00'
  },
  assignedDriver: undefined,
  options: {
    gpsTracking: true,
    departureInspection: false,
    arrivalInspection: false,
    roundTrip: false
  },
  notes: '',
  attachments: [],
  priority: 'Normale'
};

export interface StepMeta { step:number; missing:string[]; }
interface MissionFormProps {
  step: number;
  setStep: (n:number)=>void;
  onSubmitMission: (m:Mission)=>void;
  close: ()=>void;
  totalSteps: number;
  onStepMeta?: (meta:StepMeta[])=>void;
  highestVisited: number;
  onValuesChange?: (vals:MissionFormValues)=>void;
  initialValues?: Partial<MissionFormValues>;
}

// Résumé collant
const StickySummary: React.FC<{values:MissionFormValues; step:number}> = ({values, step}) => {
  return (
    <div className="hidden lg:flex flex-col text-xs gap-2 p-3 rounded-md glass sticky top-2 max-h-[calc(100vh-140px)] overflow-y-auto border border-white/10 shadow-inner">
      <div className="font-semibold text-[11px] tracking-wide uppercase opacity-70">Résumé</div>
      <div className="space-y-1">
        <div><span className="font-medium">Client:</span> {values.clientName||'—'}</div>
        <div className="text-muted-foreground">{values.clientContact.name}</div>
        <div className="text-muted-foreground">Catégorie: {values.vehicle.category}</div>
      </div>
      <div className="border-t border-white/10 pt-1">
        <div className="font-medium">Véhicule</div>
        <div>{values.vehicle.brand} {values.vehicle.model}</div>
        <div className="text-muted-foreground">{values.vehicle.licensePlate}</div>
      </div>
      <div className="border-t border-white/10 pt-1">
        <div className="font-medium">Départ</div>
        <div>{values.departure.address.city} • {values.departure.date || '—'}</div>
      </div>
      <div className="border-t border-white/10 pt-1">
        <div className="font-medium">Arrivée</div>
        <div>{values.arrival.address.city}</div>
      </div>
      <div className="border-t border-white/10 pt-1 flex flex-wrap gap-1">
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{values.priority}</span>
        {values.options.gpsTracking && <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">GPS</span>}
        {values.options.departureInspection && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Inspect D</span>}
        {values.options.arrivalInspection && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Inspect A</span>}
      </div>
      {step > 3 && (
        <div className="border-t border-white/10 pt-1">
          <div className="font-medium">Assignation</div>
          <div>{values.assignedDriver || '—'}</div>
        </div>
      )}
  <div className="mt-2 text-[10px] italic opacity-70">Étape {step}/5</div>
    </div>
  );
};

export const MissionForm: React.FC<MissionFormProps> = ({ step, setStep, onSubmitMission, close, totalSteps, onStepMeta, onValuesChange, initialValues }) => {
  const draftKey='mission_form_draft_v2';
  const finalDefaultValues = useMemo(() => ({
    ...defaultValues,
    ...initialValues
  }), [initialValues]);
  const methods = useForm<MissionFormValues>({ defaultValues: finalDefaultValues, resolver: zodResolver(missionFormSchema) as any, mode:'onBlur' });
  const { handleSubmit, watch, formState:{ errors } } = methods;
  const values = watch();
  // Mode simple: pas d'auto-détection
  // Time pickers (découplés du storage principal)
  const [depStart,setDepStart]=useState('');
  const [depEnd,setDepEnd]=useState('');
  const [arrStart,setArrStart]=useState('');
  const [arrEnd,setArrEnd]=useState('');

  // Charger brouillon
  useEffect(()=>{
    try { const raw = localStorage.getItem(draftKey); if(raw){ const parsed = JSON.parse(raw); methods.reset(parsed); const tsD = parsed?.departure?.timeSlot||''; const tsA = parsed?.arrival?.timeSlot||''; if(/.+-.+/.test(tsD)){ const [s,e]=tsD.split('-'); setDepStart(s); setDepEnd(e);} if(/.+-.+/.test(tsA)){ const [s,e]=tsA.split('-'); setArrStart(s); setArrEnd(e);} } } catch{}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  // Sauvegarde brouillon (debounce simple)
  useEffect(()=>{ const id=setTimeout(()=>{ localStorage.setItem(draftKey, JSON.stringify(values)); },400); return ()=>clearTimeout(id); },[values]);

  // Sync times vers timeSlot
  useEffect(()=>{ if(depStart && depEnd) methods.setValue('departure.timeSlot', `${depStart}-${depEnd}`, { shouldValidate:true }); },[depStart,depEnd,methods]);
  useEffect(()=>{ if(arrStart && arrEnd) methods.setValue('arrival.timeSlot', `${arrStart}-${arrEnd}`, { shouldValidate:true }); },[arrStart,arrEnd,methods]);

  const goNext = () => { if(step < totalSteps) setStep(step+1); };
  const goPrev = () => { if(step > 1) setStep(step-1); };

  const submitFinal = (vals:MissionFormValues) => {
    const now = new Date().toISOString();
    const mission: Mission = {
      id: 'M-'+Math.random().toString(36).slice(2,8).toUpperCase(),
      client: { name: vals.clientName, contact: vals.clientContact },
      vehicle: vals.vehicle,
      departure: vals.departure,
      arrival: vals.arrival,
      status: 'En attente' as MissionStatus,
      priority: vals.priority,
      distance: 0,
      estimatedDuration: 0,
      options: vals.options,
      notes: vals.notes,
      attachments: vals.attachments,
      createdAt: now,
      updatedAt: now,
    };
    if(vals.assignedDriver){ mission.assignedTo = { id: 'U-'+Math.random().toString(36).slice(2,8), name: vals.assignedDriver }; }
    onSubmitMission(mission);
  };

  // (aucune logique supplémentaire)

  const errorMsg = (path: string) => {
    const seg = (path as string).split('.');
    let cur: any = errors;
    for(const s of seg){ if(!cur) break; cur = cur[s as any]; }
    if(!cur) return null; if(cur.message) return String(cur.message); return null;
  };

  // Champs requis par étape (steps 5 & 6 sans requis)
  const requiredMap: Record<number,string[]> = {
    1:['clientName','clientContact.name','clientContact.email','clientContact.phone'],
    2:['vehicle.brand','vehicle.model','vehicle.licensePlate','vehicle.category','vehicle.energy'],
    3:[
      'departure.address.street','departure.address.city','departure.address.postalCode','departure.address.country','departure.date','departure.timeSlot',
      'departure.contact.name','departure.contact.email','departure.contact.phone',
      'arrival.address.street','arrival.address.city','arrival.address.postalCode','arrival.address.country','arrival.expectedDate','arrival.timeSlot','arrival.contact.name','arrival.contact.email','arrival.contact.phone'
    ],
  4:['priority']
  };
  const getVal=(path:string)=> path.split('.').reduce((acc:any,k)=>acc?acc[k]:undefined, values as any);
  const meta: StepMeta[] = Array.from({length:totalSteps},(_,i)=>{
    const s=i+1; const req = requiredMap[s]||[]; const missing = req.filter(p=>{
      const v=getVal(p); if(v===0) return false; return v===undefined || v===null || v==='';
    });
    return { step:s, missing };
  });
  // Diff méta via ref pour éviter déclenchements en boucle (JSON.stringify chaque render)
  const lastMetaRef = useRef<string>('');
  useEffect(()=>{
    const str = JSON.stringify(meta);
    if(str !== lastMetaRef.current){
      lastMetaRef.current = str;
      onStepMeta?.(meta);
    }
  },[meta, onStepMeta]);
  // Propagation valeurs : éviter boucle due à nouvelle référence watch() à chaque render
  const lastValsHashRef = useRef<string>('');
  useEffect(()=>{
    try {
      const hash = JSON.stringify(values);
      if(hash !== lastValsHashRef.current){
        lastValsHashRef.current = hash;
        onValuesChange?.(values);
      }
    } catch {
      // en cas d'erreur de sérialisation, fallback une seule notification
      if(!lastValsHashRef.current){
        onValuesChange?.(values);
        lastValsHashRef.current = 'sent';
      }
    }
  },[values, onValuesChange]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitFinal)} className="flex flex-col xl:flex-row gap-8 xl:gap-10" aria-labelledby={`mission-step-tab-${step}`}>
        <div className="flex-1 space-y-12 md:space-y-14" id={`mission-step-panel-${step}`} role="tabpanel" aria-describedby={`mission-step-desc-${step}`} aria-live="polite">
          {/* Étape 1 */}
          {step===1 && <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-2 wizard-section" aria-label="Client et contact">
            <h3 className="wizard-step-header" id="mission-step-desc-1">1. Client & contact</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium">Client *</label>
                <Input {...methods.register('clientName')} placeholder="Nom client" />
                {errorMsg('clientName') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('clientName')}</p>}
              </div>
              <div>
                <label className="text-xs font-medium">Contact - Nom *</label>
                <Input {...methods.register('clientContact.name')} placeholder="Nom contact" />
                {errorMsg('clientContact.name') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('clientContact.name')}</p>}
              </div>
              <div>
                <label className="text-xs font-medium">Contact - Email *</label>
                <Input type="email" {...methods.register('clientContact.email')} placeholder="email@ex.fr" />
                {errorMsg('clientContact.email') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('clientContact.email')}</p>}
              </div>
              <div>
                <label className="text-xs font-medium">Contact - Téléphone *</label>
                <Input {...methods.register('clientContact.phone')} placeholder="+33..." />
                {errorMsg('clientContact.phone') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('clientContact.phone')}</p>}
              </div>
            </div>
          </div>}
          {/* Étape 2 */}
          {step===2 && <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-2 wizard-section" aria-label="Véhicule">
            <h3 className="wizard-step-header" id="mission-step-desc-2">2. Véhicule</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-medium">Marque *</label>
                <Input {...methods.register('vehicle.brand')} placeholder="Ex: Renault" />
                {errorMsg('vehicle.brand') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('vehicle.brand')}</p>}
              </div>
              <div>
                <label className="text-xs font-medium">Modèle *</label>
                <Input {...methods.register('vehicle.model')} placeholder="Ex: Clio" />
                {errorMsg('vehicle.model') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('vehicle.model')}</p>}
              </div>
              <div>
                <label className="text-xs font-medium">Immatriculation *</label>
                <Input {...methods.register('vehicle.licensePlate')} placeholder="AA-123-AA" onBlur={(e)=>{ const up=e.target.value.toUpperCase(); if(up!==e.target.value) methods.setValue('vehicle.licensePlate', up,{shouldDirty:true}); }} />
                {errorMsg('vehicle.licensePlate') && <p className="text-[11px] text-rose-400 mt-1">{errorMsg('vehicle.licensePlate')}</p>}
              </div>
              <div>
                <label className="text-xs font-medium">Catégorie *</label>
                <select className="input w-full bg-background/60 border" {...methods.register('vehicle.category')}>
                  <option value="VL">VL</option>
                  <option value="VU">VU</option>
                  <option value="PL">PL</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Énergie *</label>
                <select className="input w-full bg-background/60 border" {...methods.register('vehicle.energy')}>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Électrique">Électrique</option>
                  <option value="Hybride">Hybride</option>
                </select>
              </div>
            </div>
          </div>}
          {/* Étape 3 */}
          {step===3 && <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-2 wizard-section" aria-label="Itinéraire">
            <h3 className="wizard-step-header" id="mission-step-desc-3">3. Itinéraire</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3 bg-background/40 p-4 rounded-md border border-white/10">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">Départ</p>
                <Input {...methods.register('departure.address.street')} placeholder="Rue" />
                <Input {...methods.register('departure.address.city')} placeholder="Ville" />
                <div className="flex gap-3">
                  <Input {...methods.register('departure.address.postalCode')} placeholder="CP" className="flex-1" />
                  <Input {...methods.register('departure.address.country')} placeholder="Pays" className="flex-1" />
                </div>
                <Input type="date" {...methods.register('departure.date')} />
                <div className="flex gap-2 items-center">
                  <input type="time" className="input w-full bg-background/60 border rounded px-2 py-1 text-xs" value={depStart} onChange={e=>setDepStart(e.target.value)} />
                  <span className="text-xs opacity-60">→</span>
                  <input type="time" className="input w-full bg-background/60 border rounded px-2 py-1 text-xs" value={depEnd} onChange={e=>setDepEnd(e.target.value)} />
                </div>
                <input type="hidden" {...methods.register('departure.timeSlot')} />
                {errorMsg('departure.timeSlot') && <p className="text-[11px] text-rose-400 -mt-1">{errorMsg('departure.timeSlot')}</p>}
                <Input {...methods.register('departure.contact.name')} placeholder="Contact nom" />
                <Input type="email" {...methods.register('departure.contact.email')} placeholder="Contact email" />
                <Input {...methods.register('departure.contact.phone')} placeholder="Contact téléphone" />
              </div>
              <div className="space-y-3 bg-background/40 p-4 rounded-md border border-white/10">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">Arrivée</p>
                <Input {...methods.register('arrival.address.street')} placeholder="Rue" />
                <Input {...methods.register('arrival.address.city')} placeholder="Ville" />
                <div className="flex gap-3">
                  <Input {...methods.register('arrival.address.postalCode')} placeholder="CP" className="flex-1" />
                  <Input {...methods.register('arrival.address.country')} placeholder="Pays" className="flex-1" />
                </div>
                <Input type="date" {...methods.register('arrival.expectedDate')} />
                <div className="flex gap-2 items-center">
                  <input type="time" className="input w-full bg-background/60 border rounded px-2 py-1 text-xs" value={arrStart} onChange={e=>setArrStart(e.target.value)} />
                  <span className="text-xs opacity-60">→</span>
                  <input type="time" className="input w-full bg-background/60 border rounded px-2 py-1 text-xs" value={arrEnd} onChange={e=>setArrEnd(e.target.value)} />
                </div>
                <input type="hidden" {...methods.register('arrival.timeSlot')} />
                {errorMsg('arrival.timeSlot') && <p className="text-[11px] text-rose-400 -mt-1">{errorMsg('arrival.timeSlot')}</p>}
                <Input {...methods.register('arrival.contact.name')} placeholder="Contact nom" />
                <Input type="email" {...methods.register('arrival.contact.email')} placeholder="Contact email" />
                <Input {...methods.register('arrival.contact.phone')} placeholder="Contact téléphone" />
              </div>
            </div>
          </div>}
          {/* Étape 4 (Affectation & options) */}
          {step===4 && <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-2 wizard-section" aria-label="Affectation et options">
            <h3 className="wizard-step-header" id="mission-step-desc-4">4. Affectation & options</h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 p-4 rounded-xl border border-white/10 bg-background/40 backdrop-blur-sm wizard-gradient-border">
                  <p className="text-xs font-semibold text-muted-foreground">Affectation</p>
                  <Input {...methods.register('assignedDriver')} placeholder="Nom du chauffeur / opérateur" />
                </div>
                <div className="space-y-3 p-4 rounded-xl border border-white/10 bg-background/40 wizard-gradient-border">
                  <p className="text-xs font-semibold text-muted-foreground">Options</p>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" {...methods.register('options.gpsTracking')} /> GPS tracking</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" {...methods.register('options.departureInspection')} /> Inspection départ</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" {...methods.register('options.arrivalInspection')} /> Inspection arrivée</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" {...methods.register('options.roundTrip')} /> Aller-retour</label>
                </div>
              </div>
            </div>
          </div>}
          {/* Étape 5 (Notes & pièces jointes) */}
          {step===5 && <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-2 wizard-section" aria-label="Notes et pièces jointes">
            <h3 className="wizard-step-header" id="mission-step-desc-5">5. Notes & pièces jointes</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium">Notes</label>
                <Textarea rows={4} {...methods.register('notes')} placeholder="Instructions, risques, consignes..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Pièces jointes (fichiers ou URLs)</label>
                <FileAttachmentZone value={values.attachments} onChange={(arr)=>methods.setValue('attachments', arr as any, { shouldDirty:true })} />
              </div>
            </div>
          </div>}

          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={close}>Annuler</Button>
            <div className="flex gap-2">
              {step>1 && <Button type="button" variant="secondary" onClick={goPrev}>Retour</Button>}
              {step<totalSteps && <Button type="button" className="btn-turquoise" onClick={goNext}>Suivant</Button>}
              {step===totalSteps && <Button type="submit" className="btn-turquoise shadow-lg shadow-cyan-500/25">Créer mission</Button>}
            </div>
          </div>
        </div>
        <StickySummary values={values} step={step} />
      </form>
    </FormProvider>
  );
};

// Sous composant pour gérer les attachments dynamiques
const AttachmentFields: React.FC = () => {
  const form = useFormContextSafe();
  const values = form.getValues('attachments') || [];
  const update = (arr:string[])=> form.setValue('attachments', arr as any, { shouldDirty:true});
  return (
    <div className="space-y-2">
      {values.map((val,idx)=>(
        <div key={idx} className="flex gap-2">
          <Input value={val} onChange={e=>{ const copy=[...values]; copy[idx]=e.target.value; update(copy); }} placeholder="https://..." />
          <Button type="button" variant="ghost" size="icon" onClick={()=>{ const copy=[...values]; copy.splice(idx,1); update(copy); }}>✕</Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={()=>update([...values,''])}>Ajouter une pièce</Button>
    </div>
  );
};

// Helper pour éviter les erreurs d'import circulaire
function useFormContextSafe(){
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return React.useContext((FormProvider as any).Context) as ReturnType<typeof useForm<MissionFormValues>>;
}
