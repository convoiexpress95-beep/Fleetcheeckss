import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// On n'utilise plus le type Mission complet pour la création: on émet un InsertSupabaseMission directement
import type { InsertSupabaseMission } from '@/hooks/useMissionSupabase';
import { NewMissionForm, NewMissionStepMeta, NewMissionFormValues } from './NewMissionForm';
import { MissionPrintSummary } from './MissionPrintSummary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  FileText, 
  Download, 
  Save, 
  X, 
  Menu,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  User,
  Car,
  MapPin,
  Settings,
  Printer,
  Clock,
  Star
} from 'lucide-react';

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

export const MissionCreateDrawer: React.FC<Props> = ({ open, onClose, onCreate, preAssignedContact }) => {
  const [step,setStep]=useState(1);
  const [highestVisited,setHighestVisited]=useState(1);
  const [meta,setMeta]=useState<NewMissionStepMeta[]>([]);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [previewOpen,setPreviewOpen]=useState(false);
  const [latestValues,setLatestValues]=useState<NewMissionFormValues|undefined>(undefined);
  const [savedDraft, setSavedDraft] = useState(false);
  
  // Stable refs to prevent Radix UI loops
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);
  const onCreateRef = useRef(onCreate);
  
  // Update refs when props change
  React.useEffect(() => {
    openRef.current = open;
    onCloseRef.current = onClose;
    onCreateRef.current = onCreate;
  }, [open, onClose, onCreate]);
  
  // Valeurs initiales basées sur le contact pré-assigné
  const initialValues = useMemo(() => {
    if (!preAssignedContact) return undefined;
    return {
      assignedDriver: preAssignedContact.name
    };
  }, [preAssignedContact]);
  
  const dirty = useMemo(()=>{
    if(!latestValues) return false;
    try {
      const { clientName, vehicle } = latestValues;
      if(clientName || vehicle?.brand || vehicle?.licensePlate) return true;
      return false;
    } catch { return false; }
  },[latestValues]);
  
  const totalSteps=5;
  const onSetStep=useCallback((n:number)=>{ setStep(n); setHighestVisited(h=> n>h? n : h); },[]);
  
  // Use stable callbacks
  const close = useCallback(() => { 
    if (onCloseRef.current) onCloseRef.current(); 
  }, []);
  
  const onSubmitMission = useCallback((m: any) => { 
    // Conversion formulaire -> InsertSupabaseMission minimal
    const payload: InsertSupabaseMission = {
      titre: m?.clientName || m?.client?.name || 'Mission sans titre',
      ville_depart: m?.departureCity || m?.departure?.address?.city || '',
      ville_arrivee: m?.arrivalCity || m?.arrival?.address?.city || '',
      date_depart: m?.departureDate || m?.departure?.date || new Date().toISOString(),
      description: m?.notes || m?.description || undefined,
      prix_propose: m?.price ? Number(m.price) : undefined,
      vehicule_requis: [m?.vehicle?.brand, m?.vehicle?.model].filter(Boolean).join(' ').trim() || undefined,
      statut: 'ouverte'
    };
    if (onCreateRef.current) onCreateRef.current(payload); 
    close(); 
  }, [close]);
  
  // Enhanced auto-save functionality with premium feedback
  React.useEffect(() => {
    if (latestValues && dirty) {
      const saveTimeout = setTimeout(() => {
        try {
          const draftData = {
            values: latestValues,
            step: step,
            highestVisited: highestVisited,
            timestamp: Date.now()
          };
          localStorage.setItem('mission_drawer_draft', JSON.stringify(draftData));
          setSavedDraft(true);
          
          // Auto-hide success indicator
          setTimeout(() => setSavedDraft(false), 2000);
        } catch (error) {
          console.warn('Failed to auto-save draft:', error);
        }
      }, 2000);
      return () => clearTimeout(saveTimeout);
    }
  }, [latestValues, dirty, step, highestVisited]);

  // Enhanced draft loading on mount
  React.useEffect(() => {
    if (open) {
      try {
        const savedDraftData = localStorage.getItem('mission_drawer_draft');
        if (savedDraftData) {
          const draftData = JSON.parse(savedDraftData);
          const age = Date.now() - (draftData.timestamp || 0);
          
          // Only load drafts less than 7 days old
          if (age < 7 * 24 * 60 * 60 * 1000) {
            setLatestValues(draftData.values || draftData);
            if (draftData.step) setStep(draftData.step);
            if (draftData.highestVisited) setHighestVisited(draftData.highestVisited);
          } else {
            // Clean expired draft
            localStorage.removeItem('mission_drawer_draft');
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('mission_drawer_draft');
      }
    }
  }, [open]);

  const clearDraft = () => {
    localStorage.removeItem('mission_drawer_draft');
    setLatestValues(undefined);
    setStep(1);
    setHighestVisited(1);
  };
  
  const confirmingRef = useRef(false);
  const requestClose = useCallback(() => {
    // Cette fonction est maintenant utilisée uniquement par les boutons de fermeture internes
    if(!dirty){
      if (onCloseRef.current) onCloseRef.current();
      return;
    }
    if(confirmingRef.current) return;
    confirmingRef.current = true;
    const ok = window.confirm('Vous avez un brouillon non enregistré. Fermer quand même ?');
    confirmingRef.current = false;
    if(ok) {
      if (onCloseRef.current) onCloseRef.current();
    }
  }, [dirty]);
  
  const handleOpenChange = useCallback((next:boolean) => {
    // Si on essaie de fermer le dialog
    if(!next && openRef.current){
      // Si pas de modifications, fermer directement
      if(!dirty){
        if (onCloseRef.current) onCloseRef.current();
        return;
      }
      // Si des modifications, demander confirmation
      if(confirmingRef.current) return; // Éviter les boucles
      confirmingRef.current = true;
      const ok = window.confirm('Vous avez un brouillon non enregistré. Fermer quand même ?');
      confirmingRef.current = false;
      if(ok) {
        if (onCloseRef.current) onCloseRef.current();
      }
      // Si l'utilisateur annule, ne rien faire (le dialog reste ouvert)
    }
  }, [dirty]);
  
  React.useEffect(()=>{
    if(!open){
      setStep(1);
      setHighestVisited(1);
      setSidebarOpen(false);
      setPreviewOpen(false);
    }
  },[open]);

  const getStepIcon = (stepNumber: number) => {
    switch(stepNumber) {
      case 1: return User;
      case 2: return Car;
      case 3: return MapPin;
      case 4: return Settings;
      case 5: return FileText;
      default: return FileText;
    }
  };

  const getStepColor = (stepNumber: number, isActive: boolean, isCompleted: boolean, hasError: boolean) => {
    if (hasError) return 'from-red-500 to-pink-600';
    if (isCompleted) return 'from-emerald-500 to-teal-600';
    if (isActive) return 'from-cyan-500 to-blue-600';
    return 'from-gray-600 to-gray-700';
  };

  const handleExportPdf = async () => {
    if(!latestValues) return;
    setPreviewOpen(true);
    // attendre cycle render
    requestAnimationFrame(async ()=>{
      const el = document.getElementById('mission-print-preview');
      if(!el) return;
      const canvas = await html2canvas(el,{ scale:2, backgroundColor:'#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','mm','a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // margins
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let y = 10;
      if(imgHeight < pageHeight - 20){
        pdf.addImage(imgData,'PNG',10,y,imgWidth,imgHeight,'','FAST');
      } else {
        // multi-page
        let remaining = imgHeight;
        const pageCanvas = document.createElement('canvas');
        const ctx = pageCanvas.getContext('2d');
        if(ctx){
          const sliceHeightPx = canvas.width * (pageHeight - 20) / imgWidth; // portion in source pixels
          let offset = 0;
          while(remaining > 0){
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(sliceHeightPx, canvas.height - offset);
            ctx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
            ctx.drawImage(canvas,0,offset,pageCanvas.width,pageCanvas.height,0,0,pageCanvas.width,pageCanvas.height);
            const pageImg = pageCanvas.toDataURL('image/png');
            if(offset>0) pdf.addPage();
            pdf.addImage(pageImg,'PNG',10,10,imgWidth,(pageCanvas.height * imgWidth / pageCanvas.width),'','FAST');
            offset += sliceHeightPx;
            remaining -= (pageCanvas.height * imgWidth / pageCanvas.width);
          }
        } else {
          pdf.addImage(imgData,'PNG',10,10,imgWidth,imgHeight,'','FAST');
        }
      }
      pdf.save('mission-brouillon.pdf');
    });
  };

  const handleInlinePrint = () => {
    window.print(); // rely on print media; preview already visible
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[96vh] overflow-hidden p-0 border border-cyan-500/20 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Création de mission premium</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Premium Sidebar */}
          <aside className={`relative z-30 lg:static w-80 max-w-full shrink-0 border-r border-white/10 px-6 py-6 flex flex-col gap-4 overflow-y-auto bg-gray-950/80 backdrop-blur-xl transition-transform duration-300 ease-out ${sidebarOpen? 'translate-x-0':'-translate-x-full'} lg:translate-x-0`}> 
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Mission Premium</span>
              </div>
              <button 
                type="button" 
                className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800/50" 
                onClick={()=>setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-300">Progression</span>
                <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">
                  {computePercent(meta,totalSteps)}%
                </Badge>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800/50 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" 
                  style={{width: computePercent(meta,totalSteps)+'%'}} 
                />
              </div>
              {savedDraft && (
                <div className="flex items-center gap-1 mt-2">
                  <Save className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Sauvegardé automatiquement</span>
                </div>
              )}
            </div>
            
            {/* Steps Navigation */}
            <nav className="flex flex-col gap-2 mt-2">
              {Array.from({length:totalSteps},(_,i)=>{
                const s=i+1; 
                const mItem=meta.find(mm=>mm.step===s); 
                const missing = 0; // Simplifié pour l'instant
                const visited = highestVisited>=s;
                const active = s===step;
                const complete = visited && missing===0 && s!==step;
                const error = visited && missing>0 && !active;
                const nextAllowed = s<=highestVisited+1;
                const StepIcon = getStepIcon(s);
                
                return (
                  <div key={s} className="relative">
                    <button
                      type="button"
                      disabled={!nextAllowed}
                      onClick={()=> nextAllowed && (onSetStep(s), setSidebarOpen(false))}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        active 
                          ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 shadow-lg' 
                          : complete
                            ? 'border-emerald-400/50 bg-emerald-500/5 hover:bg-emerald-500/10'
                            : error
                              ? 'border-red-400/50 bg-red-500/5 hover:bg-red-500/10'
                              : 'border-gray-600/30 bg-gray-800/30 hover:bg-gray-700/30 hover:border-gray-500/50'
                      } ${!nextAllowed? 'opacity-40 cursor-default':''}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r ${getStepColor(s, active, complete, error)}`}>
                        {complete ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : error ? (
                          <AlertCircle className="w-6 h-6 text-white" />
                        ) : (
                          <StepIcon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-medium ${active ? 'text-cyan-300' : 'text-gray-300'}`}>
                          {stepTitle(s)}
                        </span>
                        <span className={`text-xs ${active ? 'text-gray-300' : 'text-gray-500'}`}>
                          Étape {s}/{totalSteps}
                        </span>
                        {missing > 0 && (
                          <Badge className="mt-1 bg-red-500/20 text-red-200 border-red-500/30 text-xs">
                            {missing} champ{missing > 1 ? 's' : ''} requis
                          </Badge>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Draft Actions */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDraft}
                  className="flex-1 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                  disabled={!dirty}
                >
                  Effacer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  className="flex-1 bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  disabled={!latestValues}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Aperçu
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Premium Header */}
            <header className="sticky top-0 z-20 px-6 py-4 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  className="lg:hidden p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50" 
                  onClick={()=>setSidebarOpen(o=>!o)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      {stepTitle(step)}
                    </h1>
                    <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">
                      {step}/{totalSteps}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {getStepDescription(step)}
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportPdf}
                    className="text-gray-400 hover:text-white"
                    disabled={!latestValues}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={requestClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 lg:py-8">
              <NewMissionForm 
                step={step} 
                setStep={onSetStep} 
                onSubmitMission={onSubmitMission}
                close={close} 
                totalSteps={totalSteps} 
                onStepMeta={setMeta} 
                highestVisited={highestVisited} 
                onValuesChange={setLatestValues}
                initialValues={initialValues}
              />
            </div>

            {/* Preview Overlay */}
            {previewOpen && latestValues && (
              <div className="absolute inset-0 z-40 bg-gray-950/90 backdrop-blur-xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-semibold text-white">Aperçu Mission</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleInlinePrint}
                      className="bg-blue-500/10 border-blue-500/30 text-blue-300"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimer
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleExportPdf}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={()=>setPreviewOpen(false)}
                      className="bg-red-500/10 border-red-500/30 text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div id="mission-print-preview" className="bg-white text-gray-900 shadow-2xl max-w-4xl mx-auto rounded-xl border border-gray-200 p-8">
                    <div className="border-b border-gray-200 pb-6 mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mission - Résumé</h1>
                      <p className="text-gray-600">Brouillon généré le {new Date().toLocaleString()}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 text-sm">
                      <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-cyan-600" />
                          Informations Mission
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <p><strong>Client :</strong> {latestValues.clientName||'Non défini'}</p>
                          <p><strong>Contact :</strong> {latestValues.clientContact?.name || 'Non défini'}</p>
                          <p><strong>Catégorie :</strong> {latestValues.vehicle?.category || 'Non définie'}</p>
                          <p><strong>Départ prévu :</strong> {latestValues.departure?.date || 'Non défini'}</p>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          Véhicule
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <p><strong>Véhicule :</strong> {latestValues.vehicle?.brand || 'Non défini'} {latestValues.vehicle?.model || ''}</p>
                          <p><strong>Plaque :</strong> {latestValues.vehicle?.licensePlate || 'Non définie'}</p>
                          {latestValues.vehicle?.image && (
                            <div className="mt-2">
                              <img src={latestValues.vehicle.image} alt="Véhicule" className="w-20 h-12 object-cover rounded" />
                            </div>
                          )}
                        </div>
                      </section>

                      <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          Départ
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <p><strong>Adresse :</strong> {latestValues.departure?.address?.street || 'Non définie'}</p>
                          <p><strong>Ville :</strong> {latestValues.departure?.address?.postalCode || ''} {latestValues.departure?.address?.city || 'Non définie'}</p>
                          <p><strong>Contact :</strong> {latestValues.departure?.contact?.phone || 'Non défini'}</p>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-orange-600" />
                          Arrivée
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <p><strong>Adresse :</strong> {latestValues.arrival?.address?.street || 'Non définie'}</p>
                          <p><strong>Ville :</strong> {latestValues.arrival?.address?.postalCode || ''} {latestValues.arrival?.address?.city || 'Non définie'}</p>
                          <p><strong>Contact :</strong> {latestValues.arrival?.contact?.phone || 'Non défini'}</p>
                        </div>
                      </section>
                    </div>

                    <section className="mt-8">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" />
                        Assignation & Options
                      </h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p><strong>Assigné à :</strong> {latestValues.assignedDriver || 'Non assigné'}</p>
                        <p><strong>Priorité :</strong> {latestValues.priority || 'Normale'}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {latestValues.options?.gpsTracking && <Badge className="bg-green-100 text-green-800">Suivi GPS</Badge>}
                          {latestValues.options?.departureInspection && <Badge className="bg-blue-100 text-blue-800">Inspection départ</Badge>}
                          {latestValues.options?.arrivalInspection && <Badge className="bg-blue-100 text-blue-800">Inspection arrivée</Badge>}
                        </div>
                      </div>
                    </section>

                    {latestValues.notes && (
                      <section className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm">{latestValues.notes}</pre>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-20 bg-gray-950/60 backdrop-blur-sm" 
            onClick={()=>setSidebarOpen(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
function getStepDescription(step: number): string {
  switch (step) {
    case 1: return 'Informations du client et contact principal';
    case 2: return 'Détails du véhicule à transporter';
    case 3: return 'Adresses de départ et d\'arrivée';
    case 4: return 'Services et options complémentaires';
    case 5: return 'Notes et pièces jointes';
    default: return '';
  }
}

function getStepIcon(step: number) {
  switch (step) {
    case 1: return User;
    case 2: return Car;
    case 3: return MapPin;
    case 4: return Settings;
    case 5: return FileText;
    default: return Star;
  }
}

function getStepColor(step: number, active: boolean, complete: boolean, error: boolean): string {
  if (active) return 'from-cyan-400 via-blue-500 to-blue-600 shadow-lg shadow-cyan-500/30';
  if (complete) return 'from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30';
  if (error) return 'from-red-400 to-red-600 shadow-lg shadow-red-500/30';
  return 'from-gray-600 to-gray-700';
}

function stepTitle(step:number){
  switch(step){
    case 1: return 'Infos Mission';
    case 2: return 'Véhicule';
    case 3: return 'Trajet';
    case 4: return 'Assignation';
    case 5: return 'Confirmation';
    default: return `Étape ${step}`;
  }
}

function computePercent(meta:NewMissionStepMeta[], total:number){
  if(!meta.length) return 0;
  const completed = meta.filter(m=>m.isComplete).length;
  return Math.min(100, Math.round((completed/total)*100));
}

function handlePrint(values?:NewMissionFormValues){
  if(!values) return;
  const win = window.open('', '_blank','noopener,noreferrer,width=900,height=1200');
  if(!win) return;
  const doc = win.document;
  doc.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>Résumé mission</title><style>${printStyles()}</style></head><body>`);
  doc.write(`<h1>Résumé mission (brouillon)</h1>`);
  doc.write(`<div class="section"><h2>Mission</h2><p><strong>${escapeHtml(values.clientName)}</strong><br/>Catégorie: ${values.vehicle.category}</p></div>`);
  doc.write(`<div class="section"><h2>Véhicule</h2><p>${escapeHtml(values.vehicle.brand)} ${escapeHtml(values.vehicle.model)} — ${escapeHtml(values.vehicle.licensePlate)}</p></div>`);
  doc.write(`<div class="grid">`);
  doc.write(`<div><h3>Départ</h3><p>${escapeHtml(values.departure.address.street)}<br/>${escapeHtml(values.departure.address.postalCode)} ${escapeHtml(values.departure.address.city)} (${escapeHtml(values.departure.address.country)})<br/>Contact: ${escapeHtml(values.departure.contact.phone)}</p></div>`);
  doc.write(`<div><h3>Arrivée</h3><p>${escapeHtml(values.arrival.address.street)}<br/>${escapeHtml(values.arrival.address.postalCode)} ${escapeHtml(values.arrival.address.city)} (${escapeHtml(values.arrival.address.country)})<br/>Contact: ${escapeHtml(values.arrival.contact.phone)}</p></div>`);
  doc.write(`</div>`);
  doc.write(`<div class="section"><h2>Options & priorité</h2><p>Priorité: ${values.priority}<br/><span class="muted">GPS: ${values.options.gpsTracking?'Oui':'Non'} | Insp. départ: ${values.options.departureInspection?'Oui':'Non'} | Insp. arrivée: ${values.options.arrivalInspection?'Oui':'Non'}</span></p></div>`);
  if(values.assignedDriver){ doc.write(`<div class="section"><h2>Affectation</h2><p>${escapeHtml(values.assignedDriver)}</p></div>`); }
  if(values.notes){ doc.write(`<div class="section"><h2>Notes</h2><pre class="notes">${escapeHtml(values.notes)}</pre></div>`); }
  if(values.attachments?.length){ doc.write(`<div class="section"><h2>Documents attachés</h2><ul>${values.attachments.map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul></div>`); }
  doc.write(`<footer>Généré le ${new Date().toLocaleString()}</footer>`);
  doc.write(`<script>window.onload=()=>{ window.print(); };</script>`);
  doc.write(`</body></html>`);
  doc.close();
}

function escapeHtml(str:string){
  return str?.replace(/[&<>"] /g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',' ' :' ' } as any)[c]) || '';
}

function printStyles(){
  return `body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;padding:24px;color:#0f172a;background:#fff;font-size:13px;}h1{font-size:22px;margin:0 0 16px;font-weight:600;}h2{font-size:14px;margin:24px 0 8px;font-weight:600;border-bottom:1px solid #e2e8f0;padding-bottom:4px;}h3{font-size:13px;margin:12px 0 4px;font-weight:600;}p{margin:0 0 4px;line-height:1.4;}ul{margin:4px 0 0 18px;padding:0;}li{margin:2px 0;}footer{margin-top:32px;font-size:11px;color:#475569;border-top:1px solid #e2e8f0;padding-top:8px;}pre.notes{background:#f1f5f9;border:1px solid #e2e8f0;padding:8px;border-radius:4px;white-space:pre-wrap;font-size:12px;}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-top:8px}.muted{color:#64748b;font-size:11px}.section{margin-top:12px}`;
}
