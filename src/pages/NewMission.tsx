import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateMission } from '@/hooks/useMissions';
import { useMyContacts } from '@/hooks/useContacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Car, Truck, Building2, User, MapPin, Clock, Users } from 'lucide-react';
import { useVehicleModels } from '@/hooks/useVehicleModels';
import VehicleImage from '@/components/VehicleImage';
import VehicleImagePicker from '@/components/VehicleImagePicker';
import { useToast } from '@/hooks/use-toast';

const NewMission = () => {
  const navigate = useNavigate();
  const createMission = useCreateMission();
  const { data: contacts } = useMyContacts();
  const { data: vehicleModels = [] } = useVehicleModels();
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const { toast } = useToast();
  
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
  vehicle_model_id: '',
  vehicle_body_type: '',
  vehicle_image_path: '',
    vehicle_year: '',
    assigned_to: 'self',
    assigned_contact_id: '',
    donor_earning: '',
    driver_earning: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.vehicle_image_path) {
        toast({ title: 'Image requise', description: 'Veuillez choisir une image du véhicule (catalog/...)' });
        return;
      }
      const { assigned_to, assigned_contact_id, pickup_time, delivery_time, ...missionData } = formData;
      
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
  vehicle_model_id: missionData.vehicle_model_id || null,
  vehicle_body_type: missionData.vehicle_body_type || null,
  vehicle_image_path: missionData.vehicle_image_path || null,
  license_plate: missionData.license_plate || null,
        vehicle_year: missionData.vehicle_year ? Number(missionData.vehicle_year) : null,
        donor_earning: missionData.donor_earning ? Number(missionData.donor_earning) : null,
        driver_earning: missionData.driver_earning ? Number(missionData.driver_earning) : null,
        driver_id: assigned_to === 'self' ? null : (assigned_contact_id || null),
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations générales */}
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
                    {/* Image véhicule */}
                    <div className="space-y-2 md:col-span-3">
                      <Label>Image du véhicule (85 images catalogue)</Label>
                      <div className="flex items-start gap-4">
                        <div className="w-48">
                          <VehicleImage imagePath={formData.vehicle_image_path || undefined} bodyType={formData.vehicle_body_type || undefined} alt="Prévisualisation" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant="outline" onClick={() => setImagePickerOpen(true)}>Choisir dans le catalogue</Button>
                          <Input
                            placeholder="ex: catalog/peugeot_208.webp"
                            value={formData.vehicle_image_path}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_image_path: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">Les 85 images doivent être téléversées dans Supabase Storage (bucket 'vehicle-assets', dossier 'catalog').</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label>Modèle (catalogue)</Label>
                      <Select value={formData.vehicle_model_id} onValueChange={(v) => setFormData(prev => ({ ...prev, vehicle_model_id: v }))}>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Sélectionner un modèle (facultatif)" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20 max-h-64 overflow-auto">
                          {vehicleModels.map((vm: any) => (
                            <SelectItem key={vm.id} value={vm.id}>{vm.make} {vm.model}{vm.generation ? ` • ${vm.generation}` : ''} ({vm.body_type})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Choisissez un modèle pour afficher l'image correspondante dans le marketplace.</p>
                    </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_body_type">Type carrosserie</Label>
                      <Select value={formData.vehicle_body_type} onValueChange={(v) => setFormData(prev => ({ ...prev, vehicle_body_type: v }))}>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="berline, suv, utilitaire…" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          {['berline','suv','utilitaire','hatchback','break','monospace','pickup','camion','moto','autre'].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails logistiques */}
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
                  <div className="space-y-4 p-4 glass-card rounded-lg border-white/10">
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
                        <Input
                          id="pickup_contact_phone"
                          name="pickup_contact_phone"
                          value={formData.pickup_contact_phone}
                          onChange={handleChange}
                          placeholder="06 12 34 56 78"
                          className="glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_contact_email">Email</Label>
                        <Input
                          id="pickup_contact_email"
                          name="pickup_contact_email"
                          value={formData.pickup_contact_email}
                          onChange={handleChange}
                          placeholder="contact@email.com"
                          type="email"
                          className="glass-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_date">Date de départ</Label>
                        <Input
                          id="pickup_date"
                          name="pickup_date"
                          value={formData.pickup_date}
                          onChange={handleChange}
                          type="date"
                          className="glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_time">Heure de départ</Label>
                        <Input
                          id="pickup_time"
                          name="pickup_time"
                          value={formData.pickup_time}
                          onChange={handleChange}
                          type="time"
                          className="glass-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrivée */}
                  <div className="space-y-4 p-4 glass-card rounded-lg border-white/10">
                    <h4 className="font-semibold text-red-200 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      Point d'arrivée
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="delivery_address">Adresse d'arrivée *</Label>
                      <Input
                        id="delivery_address"
                        name="delivery_address"
                        value={formData.delivery_address}
                        onChange={handleChange}
                        placeholder="456 Avenue des Champs, Paris"
                        className="glass-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery_contact_name">Contact d'arrivée</Label>
                      <Input
                        id="delivery_contact_name"
                        name="delivery_contact_name"
                        value={formData.delivery_contact_name}
                        onChange={handleChange}
                        placeholder="Nom du contact"
                        className="glass-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_contact_phone">Téléphone</Label>
                        <Input
                          id="delivery_contact_phone"
                          name="delivery_contact_phone"
                          value={formData.delivery_contact_phone}
                          onChange={handleChange}
                          placeholder="06 12 34 56 78"
                          className="glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_contact_email">Email</Label>
                        <Input
                          id="delivery_contact_email"
                          name="delivery_contact_email"
                          value={formData.delivery_contact_email}
                          onChange={handleChange}
                          placeholder="contact@email.com"
                          type="email"
                          className="glass-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_date">Date d'arrivée</Label>
                        <Input
                          id="delivery_date"
                          name="delivery_date"
                          value={formData.delivery_date}
                          onChange={handleChange}
                          type="date"
                          className="glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_time">Heure d'arrivée</Label>
                        <Input
                          id="delivery_time"
                          name="delivery_time"
                          value={formData.delivery_time}
                          onChange={handleChange}
                          type="time"
                          className="glass-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations opérationnelles */}
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

               {/* Section Revenus */}
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-gradient-sunset rounded-lg">
                     <div className="w-5 h-5 text-white">💰</div>
                   </div>
                   <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                     💰 Configuration des revenus
                   </h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4 p-4 glass-card rounded-lg border-white/10">
                     <h4 className="font-semibold text-green-200 flex items-center gap-2">
                       <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                       Revenus donneur d'ordre
                     </h4>
                     
                     <div className="space-y-2">
                        <Label htmlFor="donor_earning">Montant gagné (€) *</Label>
                        <Input
                          id="donor_earning"
                          name="donor_earning"
                          value={formData.donor_earning}
                         onChange={handleChange}
                         placeholder="Ex: 150.00"
                         type="number"
                         step="0.01"
                         min="0"
                         required
                         className="glass-input"
                       />
                       <p className="text-xs text-muted-foreground">
                         Montant que vous percevrez pour cette mission
                       </p>
                     </div>
                   </div>

                   <div className="space-y-4 p-4 glass-card rounded-lg border-white/10">
                     <h4 className="font-semibold text-blue-200 flex items-center gap-2">
                       <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                       Revenus convoyeur
                     </h4>
                     
                     <div className="space-y-2">
                        <Label htmlFor="driver_earning">Montant gagné (€) *</Label>
                        <Input
                          id="driver_earning"
                          name="driver_earning"
                          value={formData.driver_earning}
                         onChange={handleChange}
                         placeholder="Ex: 200.00"
                         type="number"
                         step="0.01"
                         min="0"
                         required
                         className="glass-input"
                       />
                       <p className="text-xs text-muted-foreground">
                         {formData.assigned_to === 'self' 
                           ? 'Montant que vous percevrez en tant que convoyeur'
                           : 'Montant que percevra le convoyeur assigné'
                         }
                       </p>
                     </div>
                   </div>
                 </div>

                 <div className="p-4 glass-card rounded-lg border-yellow-400/20 bg-yellow-400/5">
                   <p className="text-sm text-yellow-200 flex items-center gap-2">
                     <span className="inline-flex w-4 h-4 text-yellow-400" aria-hidden>ℹ️</span>
                     Ces informations financières restent confidentielles entre le donneur d'ordre et le convoyeur.
                   </p>
                 </div>
               </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-white/10">
                <Button type="button" variant="outline" asChild className="glass-card text-foreground border-border hover:bg-accent/10">
                  <Link to="/missions">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Annuler
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMission.isPending || !formData.title || !formData.vehicle_type || !formData.donor_earning || !formData.driver_earning}
                  className="bg-gradient-cosmic hover:scale-105 transition-all duration-300 glow-hover"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createMission.isPending ? 'Création en cours...' : 'Créer la mission premium'}
                </Button>
              </div>
            </form>
            <VehicleImagePicker
              open={imagePickerOpen}
              onClose={() => setImagePickerOpen(false)}
              onSelect={(path) => setFormData(prev => ({ ...prev, vehicle_image_path: path }))}
              prefix="catalog"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewMission;