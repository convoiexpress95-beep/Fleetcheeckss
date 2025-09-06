import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateMission } from '@/hooks/useMissions';
import { useMyContacts } from '@/hooks/useContacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Building2, User, MapPin, Clock, Users, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import MissionRecap from '@/components/MissionRecap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NewMission = () => {
  const navigate = useNavigate();
  const createMission = useCreateMission();
  const [params] = useSearchParams();
  const { data: contacts } = useMyContacts();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickup_address: '',
    delivery_address: '',
    pickup_contact_name: '',
    pickup_contact_phone: '',
    pickup_contact_email: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    delivery_contact_email: '',
    pickup_date: '',
    pickup_time: '',
    delivery_date: '',
    delivery_time: '',
    vehicle_type: '',
  license_plate: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    assigned_to: 'self',
    assigned_contact_id: '',
    // revenus retirés du wizard (demandé)
  });
  const [confirmCredit, setConfirmCredit] = useState(false);

  // Pré-remplir depuis querystring (depuis Contacts: Créer mission)
  const prefillAssigned = useMemo(() => ({
    assigned_to: params.get('assigned_to') || undefined,
    assigned_contact_id: params.get('assigned_contact_id') || undefined,
  }), [params]);
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...(prefillAssigned.assigned_to ? { assigned_to: prefillAssigned.assigned_to as 'self' | 'contact' } : {}),
      ...(prefillAssigned.assigned_contact_id ? { assigned_contact_id: prefillAssigned.assigned_contact_id } : {}),
    }));
  }, [prefillAssigned]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Empêche la soumission avant la dernière étape (Enter ou clic involontaire)
      if (wizardStep < steps.length) {
        setWizardStep((s) => Math.min(steps.length, s + 1));
        return;
      }
  const { assigned_to, assigned_contact_id, pickup_time, delivery_time, ...missionData } = formData;

      // Résoudre driver_id si assignation à un contact
      let driverUserId: string | null = null;
      if (assigned_to === 'contact') {
        if (!assigned_contact_id) {
          toast({ title: 'Assignation manquante', description: 'Veuillez sélectionner un contact.', variant: 'destructive' });
          return;
        }
        const { data: contactRow, error: contactErr } = await supabase
          .from('contacts')
          .select('invited_user_id,status')
          .eq('id', assigned_contact_id)
          .eq('user_id', user?.id || '')
          .maybeSingle();
        if (contactErr) throw contactErr;
        if (!contactRow?.invited_user_id || contactRow.status !== 'accepted') {
          toast({
            title: 'Assignation impossible',
            description: "Ce contact n'a pas encore de compte ou l'invitation n'est pas acceptée.",
            variant: 'destructive',
          });
          return;
        }
        driverUserId = contactRow.invited_user_id;
      }
      
      // Combine date and time fields into proper timestamps
      const combineDateTime = (date: string, time: string) => {
        if (!date) return null;
        if (!time) return new Date(date).toISOString();
        
        const dateObj = new Date(date);
        const [hours, minutes] = time.split(':');
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateObj.toISOString();
      };
      
      // Map assignment logic to driver_id and combine date/time
      const submissionData = {
        ...missionData,
        // normalize empty strings to null for optional fields
        description: missionData.description || null,
        pickup_address: missionData.pickup_address || null,
        delivery_address: missionData.delivery_address || null,
        pickup_contact_name: missionData.pickup_contact_name || null,
        pickup_contact_phone: missionData.pickup_contact_phone || null,
        pickup_contact_email: missionData.pickup_contact_email || null,
        delivery_contact_name: missionData.delivery_contact_name || null,
        delivery_contact_phone: missionData.delivery_contact_phone || null,
        delivery_contact_email: missionData.delivery_contact_email || null,
        vehicle_brand: missionData.vehicle_brand || null,
        vehicle_model: missionData.vehicle_model || null,
        license_plate: missionData.license_plate || null,
        vehicle_year: missionData.vehicle_year ? Number(missionData.vehicle_year) : null,
        driver_id: assigned_to === 'self' ? null : driverUserId,
        pickup_date: combineDateTime(formData.pickup_date, formData.pickup_time),
        delivery_date: combineDateTime(formData.delivery_date, formData.delivery_time)
      };
      
      await createMission.mutateAsync(submissionData);
      navigate('/missions');
    } catch (error) {
      console.error('Error creating mission:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Wizard État des lieux
  const [wizardStep, setWizardStep] = useState(1);
  const steps = [
    { id: 1, label: "Infos mission" },
    { id: 2, label: "Logistique" },
    { id: 3, label: "Assignation" },
    { id: 4, label: "Récapitulatif" },
  ];
  const progress = (wizardStep - 1) / (steps.length - 1) * 100;

  const nextStep = () => setWizardStep(s => Math.min(steps.length, s + 1));
  const prevStep = () => setWizardStep(s => Math.max(1, s - 1));
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && wizardStep < steps.length) {
      e.preventDefault();
      nextStep();
    }
  };

  // Export PDF du récapitulatif
  const recapRef = React.useRef<HTMLDivElement>(null);
  const handleDownloadPdf = async () => {
    if (!recapRef.current) return;
    const canvas = await html2canvas(recapRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 0;

    if (imgHeight < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Multi-page si nécessaire
      let remaining = imgHeight;
      let y = 0;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight, undefined, 'FAST');
        remaining -= pageHeight;
        y -= pageHeight;
        if (remaining > 0) pdf.addPage();
      }
    }
    pdf.save(`mission-recap-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-blue-900/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-gradient-cosmic rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <Button variant="ghost" size="sm" asChild className="glass-card text-foreground border-border hover:bg-accent/10">
            <Link to="/missions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux missions
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Nouvelle Mission Premium
            </h1>
            <p className="text-foreground/80">
              Créez une nouvelle mission de transport avec style
            </p>
          </div>
        </div>

        <Card className="glass-card border-white/10 hover:scale-[1.02] transition-all duration-500 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Informations de la mission
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Remplissez les détails de votre mission de transport
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Barre de progression du wizard */}
            <div className="mb-6">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-cosmic rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 grid grid-cols-4 text-xs text-muted-foreground">
                {steps.map((s) => (
                  <div key={s.id} className={`text-center ${wizardStep === s.id ? 'text-foreground font-semibold' : ''}`}>{s.label}</div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
              {/* Informations générales */}
              {wizardStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-cosmic rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    📌 Informations générales
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de la mission *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Convoyage Renault Clio Lyon → Paris"
                      required
                      className="glass-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description / Notes</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Instructions, particularités, contraintes..."
                      rows={3}
                      className="glass-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_type">Type de véhicule *</Label>
                      <Select value={formData.vehicle_type} onValueChange={(value) => handleSelectChange('vehicle_type', value)}>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          <SelectItem value="leger">🚗 Véhicule léger</SelectItem>
                          <SelectItem value="utilitaire">🚐 Utilitaire</SelectItem>
                          <SelectItem value="poids_lourd">🚛 Poids lourd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_plate">Immatriculation</Label>
                      <Input
                        id="license_plate"
                        name="license_plate"
                        value={formData.license_plate}
                        onChange={handleChange}
                        placeholder="AB-123-CD"
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_brand">Marque</Label>
                      <Input
                        id="vehicle_brand"
                        name="vehicle_brand"
                        value={formData.vehicle_brand}
                        onChange={handleChange}
                        placeholder="Renault, Peugeot..."
                        className="glass-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle_model">Modèle</Label>
                      <Input
                        id="vehicle_model"
                        name="vehicle_model"
                        value={formData.vehicle_model}
                        onChange={handleChange}
                        placeholder="Clio, 308..."
                        className="glass-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle_year">Année</Label>
                      <Input
                        id="vehicle_year"
                        name="vehicle_year"
                        value={formData.vehicle_year}
                        onChange={handleChange}
                        placeholder="2020"
                        type="number"
                        className="glass-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Détails logistiques */}
              {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-sunset rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                    📌 Détails logistiques
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Départ */}
                  <div className="space-y-4 p-4 rounded-lg border border-white/15 bg-background/90">
                    <h4 className="font-semibold text-green-200 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      Point de départ
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pickup_address">Adresse de départ *</Label>
                      <Input
                        id="pickup_address"
                        name="pickup_address"
                        value={formData.pickup_address}
                        onChange={handleChange}
                        placeholder="123 Rue de la République, Lyon"
                        className="glass-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup_contact_name">Contact de départ</Label>
                      <Input
                        id="pickup_contact_name"
                        name="pickup_contact_name"
                        value={formData.pickup_contact_name}
                        onChange={handleChange}
                        placeholder="Nom du contact"
                        className="glass-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_contact_phone">Téléphone</Label>
                        <Input id="pickup_contact_phone" name="pickup_contact_phone" value={formData.pickup_contact_phone} onChange={handleChange} placeholder="06 12 34 56 78" className="glass-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_contact_email">Email</Label>
                        <Input id="pickup_contact_email" name="pickup_contact_email" value={formData.pickup_contact_email} onChange={handleChange} placeholder="contact@email.com" type="email" className="glass-input" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_date">Date de départ</Label>
                        <Input id="pickup_date" name="pickup_date" value={formData.pickup_date} onChange={handleChange} type="date" className="glass-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_time">Heure de départ</Label>
                        <Input id="pickup_time" name="pickup_time" value={formData.pickup_time} onChange={handleChange} type="time" className="glass-input" />
                      </div>
                    </div>
                  </div>

                  {/* Arrivée */}
                  <div className="space-y-4 p-4 rounded-lg border border-white/15 bg-background/90">
                    <h4 className="font-semibold text-red-200 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      Point d'arrivée
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="delivery_address">Adresse d'arrivée *</Label>
                      <Input id="delivery_address" name="delivery_address" value={formData.delivery_address} onChange={handleChange} placeholder="456 Avenue des Champs, Paris" className="glass-input" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery_contact_name">Contact d'arrivée</Label>
                      <Input id="delivery_contact_name" name="delivery_contact_name" value={formData.delivery_contact_name} onChange={handleChange} placeholder="Nom du contact" className="glass-input" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_contact_phone">Téléphone</Label>
                        <Input id="delivery_contact_phone" name="delivery_contact_phone" value={formData.delivery_contact_phone} onChange={handleChange} placeholder="06 12 34 56 78" className="glass-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_contact_email">Email</Label>
                        <Input id="delivery_contact_email" name="delivery_contact_email" value={formData.delivery_contact_email} onChange={handleChange} placeholder="contact@email.com" type="email" className="glass-input" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_date">Date d'arrivée</Label>
                        <Input id="delivery_date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} type="date" className="glass-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_time">Heure d'arrivée</Label>
                        <Input id="delivery_time" name="delivery_time" value={formData.delivery_time} onChange={handleChange} type="time" className="glass-input" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Informations opérationnelles */}
              {wizardStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-royal rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    📌 Assignation de la mission
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assigner la mission à :</Label>
                    <Select value={formData.assigned_to} onValueChange={(value) => handleSelectChange('assigned_to', value)}>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Choisir l'assignation" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="self">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Me l'assigner
                          </div>
                        </SelectItem>
                        <SelectItem value="contact">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Assigner à un contact
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.assigned_to === 'contact' && (
                    <div className="space-y-2">
                      <Label>Sélectionner un contact :</Label>
                      <Select value={formData.assigned_contact_id} onValueChange={(value) => handleSelectChange('assigned_contact_id', value)}>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Choisir un contact" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          {contacts?.data?.filter(c => c.status === 'accepted').map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                {contact.name || contact.email}
                              </div>
                            </SelectItem>
                          ))}
                          {(!contacts?.data?.length || contacts.data.filter(c => c.status === 'accepted').length === 0) && (
                            <SelectItem value="none" disabled>
                              Aucun contact disponible
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {formData.assigned_to === 'contact' && (!contacts?.data?.length || contacts.data.filter(c => c.status === 'accepted').length === 0) && (
                        <p className="text-sm text-yellow-200 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Ajoutez des contacts depuis la section "Contacts" pour pouvoir assigner des missions.
                        </p>
                       )}
                     </div>
                   )}
                 </div>
               </div>
              )}

              {/* Étape État des lieux retirée */}

              {/* Revenus retirés du formulaire principal */}

              {/* Étape 4: Récapitulatif + Export PDF */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Récapitulatif</h3>
                    <Button type="button" onClick={handleDownloadPdf} className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">
                      <Download className="w-4 h-4 mr-2" /> Télécharger le PDF
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl">
                    <MissionRecap data={formData as any} innerRef={recapRef} />
                  </div>

                  {/* Confirmation coût de création */}
                  <div className="p-4 rounded-lg border border-yellow-400/30 bg-yellow-500/10 text-yellow-100">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">💳</div>
                      <div className="space-y-1">
                        <div className="font-semibold">Confirmation de création</div>
                        <div className="text-sm opacity-90">La création de cette mission coûte 1 crédit. Confirmez pour continuer.</div>
                        <label className="flex items-center gap-2 mt-2">
                          <Checkbox id="confirmCredit" checked={confirmCredit} onCheckedChange={(v) => setConfirmCredit(!!v)} />
                          <span className="text-sm">J'accepte la consommation de 1 crédit pour créer cette mission.</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-8 border-t border-white/10">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" asChild className="glass-card text-foreground border-border hover:bg-accent/10">
                    <Link to="/missions">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Annuler
                    </Link>
                  </Button>
                </div>
                <div className="flex gap-2">
                  {wizardStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>Étape précédente</Button>
                  )}
                  {wizardStep < steps.length ? (
                    <Button type="button" className="bg-gradient-cosmic" onClick={nextStep}>Étape suivante</Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createMission.isPending || !formData.title || !formData.vehicle_type || !confirmCredit}
                      className="bg-gradient-cosmic hover:scale-105 transition-all duration-300 glow-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createMission.isPending ? 'Création en cours...' : 'Créer la mission'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewMission;