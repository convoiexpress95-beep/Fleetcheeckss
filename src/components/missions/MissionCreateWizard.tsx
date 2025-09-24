import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { InsertSupabaseMission } from '@/hooks/useMissionSupabase';

type Step = 1 | 2 | 3 | 4;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (m: InsertSupabaseMission) => void;
  preAssignedContact?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Utilities
function combineDateTime(date: Date, time: Date) {
  const d = new Date(date);
  d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d.toISOString();
}

function extractCity(address: string): string {
  if (!address) return '';
  // naive extraction: take last comma-separated segment, else the whole string (trim)
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return address.trim();
  return parts[parts.length - 1];
}

export const MissionCreateWizard: React.FC<Props> = ({ open, onClose, onCreate, preAssignedContact }) => {
  const [step, setStep] = useState<Step>(1);

  // Step 1 – Base info
  const [titre, setTitre] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [modeleVehicule, setModeleVehicule] = useState('');

  // Step 2 – Itinerary
  const [adresseDepart, setAdresseDepart] = useState('');
  const [adresseArrivee, setAdresseArrivee] = useState('');

  // Step 3 – Planning
  const [dateDepart, setDateDepart] = useState<Date>(() => new Date());
  const [heureDepart, setHeureDepart] = useState<Date>(() => new Date());

  // Step 4 – Finalize
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');

  // Prefill title lightly from preAssignedContact when opening
  useEffect(() => {
    if (open && preAssignedContact && !titre) {
      const base = preAssignedContact.name || preAssignedContact.email?.split('@')[0] || '';
      if (base) setTitre(base);
    }
  }, [open, preAssignedContact, titre]);

  const canNext = useMemo(() => {
    if (step === 1) return titre.trim() !== '' && immatriculation.trim() !== '';
    if (step === 2) return adresseDepart.trim() !== '' && adresseArrivee.trim() !== '';
    if (step === 3) return true; // date/time always set
    return true;
  }, [step, titre, immatriculation, adresseDepart, adresseArrivee]);

  const resetState = () => {
    setStep(1);
    setTitre('');
    setImmatriculation('');
    setModeleVehicule('');
    setAdresseDepart('');
    setAdresseArrivee('');
    setDateDepart(new Date());
    setHeureDepart(new Date());
    setDescription('');
    setPrix('');
  };

  const submit = () => {
    const iso = combineDateTime(dateDepart, heureDepart);
    const vehicule = [modeleVehicule, immatriculation ? `(immat: ${immatriculation})` : '']
      .filter(Boolean).join(' ').trim() || undefined;
    const payload: InsertSupabaseMission = {
      titre: titre.trim() || 'Mission sans titre',
      ville_depart: extractCity(adresseDepart),
      ville_arrivee: extractCity(adresseArrivee),
      date_depart: iso,
      description: description ? description.trim() : undefined,
      prix_propose: prix ? Number(prix) : undefined,
      vehicule_requis: vehicule,
      statut: 'ouverte'
    };
    onCreate(payload);
    resetState();
    onClose();
  };

  const close = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>{ if(!o) close(); }}>
      <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-hidden p-0 bg-gray-950 border border-white/10">
        <DialogHeader className="px-6 pt-5 pb-2 border-b border-white/10">
          <DialogTitle className="text-white">Nouvelle mission</DialogTitle>
          <p className="text-xs text-gray-400">4 étapes simplifiées, comme sur mobile</p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {([1,2,3,4] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step>=s? 'bg-cyan-500 text-white':'bg-gray-800 text-gray-400'}`}>{s}</div>
                {i<3 && <div className={`flex-1 h-1 rounded ${step> s? 'bg-cyan-500':'bg-gray-800'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 140px)' }}>
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Titre *</label>
                <input className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="Ex: Transport BMW X5" value={titre} onChange={e=>setTitre(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Immatriculation *</label>
                <input className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white uppercase"
                  placeholder="AA-123-BB" value={immatriculation} onChange={e=>setImmatriculation(e.target.value.toUpperCase())} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Modèle véhicule</label>
                <input className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="Ex: Tesla Model 3 Long Range" value={modeleVehicule} onChange={e=>setModeleVehicule(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Adresse de départ *</label>
                <input className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="12 Rue de la Paix, Paris" value={adresseDepart} onChange={e=>setAdresseDepart(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Adresse d'arrivée *</label>
                <input className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="8 Place Bellecour, Lyon" value={adresseArrivee} onChange={e=>setAdresseArrivee(e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Date de départ</label>
                <input type="date" className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  value={dateDepart.toISOString().slice(0,10)}
                  onChange={(e)=>{
                    const [y,m,d] = e.target.value.split('-').map(Number);
                    const nd = new Date(dateDepart); nd.setFullYear(y, (m||1)-1, d||1); setDateDepart(nd);
                  }} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Heure</label>
                <input type="time" className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  value={`${String(heureDepart.getHours()).padStart(2,'0')}:${String(heureDepart.getMinutes()).padStart(2,'0')}`}
                  onChange={(e)=>{
                    const [hh,mm] = e.target.value.split(':').map(Number);
                    const nt = new Date(heureDepart); nt.setHours(hh||0, mm||0, 0, 0); setHeureDepart(nt);
                  }} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Notes</label>
                <textarea rows={4} className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="Instructions, remarques…" value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Prix proposé (€)</label>
                <input className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="ex: 850" inputMode="decimal" value={prix} onChange={e=>setPrix(e.target.value.replace(/[^0-9.,]/g,'').replace(',','.'))} />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-2 justify-between">
          <Button variant="ghost" onClick={close} className="text-gray-300 hover:text-white">Fermer</Button>
          <div className="flex items-center gap-2">
            {step>1 && (
              <Button variant="outline" onClick={()=>setStep((s)=> (Math.max(1, (s as number)-1) as Step))} className="border-gray-700 text-gray-200">Précédent</Button>
            )}
            {step<4 && (
              <Button onClick={()=> canNext && setStep((s)=> (Math.min(4, (s as number)+1) as Step))} disabled={!canNext} className={!canNext? 'opacity-60 cursor-not-allowed' : ''}>Suivant</Button>
            )}
            {step===4 && (
              <Button onClick={submit} className="bg-cyan-600 hover:bg-cyan-500 text-white">Créer la mission</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MissionCreateWizard;
 
