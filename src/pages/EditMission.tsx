import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMission, useUpdateMission } from '@/hooks/useMissions';
import { useMyContacts } from '@/hooks/useContacts';
import { statusMappings } from '@/lib/mappings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditMission = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mission, isLoading } = useMission(id!);
  const { data: contactsData } = useMyContacts();
  const updateMission = useUpdateMission();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: '',
    pickup_address: '',
    pickup_contact_name: '',
    pickup_contact_phone: '',
    pickup_contact_email: '',
    pickup_date: '',
    delivery_address: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    delivery_contact_email: '',
    delivery_date: '',
    donor_id: '',
    driver_id: '',
    donor_earning: '',
    driver_earning: ''
  });

  useEffect(() => {
    if (mission) {
      setFormData({
        title: mission.title || '',
        description: mission.description || '',
        vehicle_type: mission.vehicle_type || '',
        vehicle_brand: mission.vehicle_brand || '',
        vehicle_model: mission.vehicle_model || '',
        vehicle_year: mission.vehicle_year?.toString() || '',
        license_plate: mission.license_plate || '',
        pickup_address: mission.pickup_address || '',
        pickup_contact_name: mission.pickup_contact_name || '',
        pickup_contact_phone: mission.pickup_contact_phone || '',
        pickup_contact_email: mission.pickup_contact_email || '',
        pickup_date: mission.pickup_date ? new Date(mission.pickup_date).toISOString().slice(0, 16) : '',
        delivery_address: mission.delivery_address || '',
        delivery_contact_name: mission.delivery_contact_name || '',
        delivery_contact_phone: mission.delivery_contact_phone || '',
        delivery_contact_email: mission.delivery_contact_email || '',
        delivery_date: mission.delivery_date ? new Date(mission.delivery_date).toISOString().slice(0, 16) : '',
        donor_id: mission.donor_id || '',
        driver_id: mission.driver_id || '',
        donor_earning: mission.donor_earning?.toString() || '',
        driver_earning: mission.driver_earning?.toString() || ''
      });
    }
  }, [mission]);

  const canEdit = mission?.status === 'pending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !id) return;

    try {
      const updates = {
        ...formData,
        vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year) : null,
        pickup_date: formData.pickup_date ? new Date(formData.pickup_date).toISOString() : null,
        delivery_date: formData.delivery_date ? new Date(formData.delivery_date).toISOString() : null,
        donor_earning: formData.donor_earning ? parseFloat(formData.donor_earning) : 0,
        driver_earning: formData.driver_earning ? parseFloat(formData.driver_earning) : 0
      };

      await updateMission.mutateAsync({ id, updates });
      navigate('/missions');
    } catch (error) {
      console.error('Error updating mission:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Mission introuvable</h2>
          <Link to="/missions">
            <Button variant="outline">Retour aux missions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-blue-900/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
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
              Modifier la mission
            </h1>
            <p className="text-foreground/80">
              {mission.reference} - Statut: {statusMappings.mission[mission.status]}
            </p>
          </div>
        </div>

        {!canEdit && (
          <Alert className="mb-6 glass-card border-orange-500/50 bg-orange-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-200">
              Cette mission ne peut plus être modifiée car son statut est "{statusMappings.mission[mission.status]}". 
              Seules les missions en attente peuvent être modifiées.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations générales */}
          <Card className="glass-card border-white/10 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">📌 Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white">Titre de la mission *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_type" className="text-white">Type de véhicule</Label>
                  <Select value={formData.vehicle_type} onValueChange={(value) => handleInputChange('vehicle_type', value)} disabled={!canEdit}>
                    <SelectTrigger className="glass-input border-white/20 text-white">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leger">Véhicule léger</SelectItem>
                      <SelectItem value="utilitaire">Utilitaire</SelectItem>
                      <SelectItem value="poids_lourd">Poids lourd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description / Notes</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="glass-input border-white/20 text-white"
                  rows={3}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="vehicle_brand" className="text-white">Marque</Label>
                  <Input
                    id="vehicle_brand"
                    value={formData.vehicle_brand}
                    onChange={(e) => handleInputChange('vehicle_brand', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_model" className="text-white">Modèle</Label>
                  <Input
                    id="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_year" className="text-white">Année</Label>
                  <Input
                    id="vehicle_year"
                    type="number"
                    value={formData.vehicle_year}
                    onChange={(e) => handleInputChange('vehicle_year', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="license_plate" className="text-white">Immatriculation</Label>
                  <Input
                    id="license_plate"
                    value={formData.license_plate}
                    onChange={(e) => handleInputChange('license_plate', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails logistiques */}
          <Card className="glass-card border-white/10 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">📌 Détails logistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Départ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Départ</h3>
                  <div>
                    <Label htmlFor="pickup_address" className="text-white">Adresse de départ *</Label>
                    <Input
                      id="pickup_address"
                      value={formData.pickup_address}
                      onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                      className="glass-input border-white/20 text-white"
                      disabled={!canEdit}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="pickup_contact_name" className="text-white">Contact</Label>
                      <Input
                        id="pickup_contact_name"
                        value={formData.pickup_contact_name}
                        onChange={(e) => handleInputChange('pickup_contact_name', e.target.value)}
                        className="glass-input border-white/20 text-white"
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickup_contact_phone" className="text-white">Téléphone</Label>
                      <Input
                        id="pickup_contact_phone"
                        value={formData.pickup_contact_phone}
                        onChange={(e) => handleInputChange('pickup_contact_phone', e.target.value)}
                        className="glass-input border-white/20 text-white"
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickup_contact_email" className="text-white">Email</Label>
                      <Input
                        id="pickup_contact_email"
                        type="email"
                        value={formData.pickup_contact_email}
                        onChange={(e) => handleInputChange('pickup_contact_email', e.target.value)}
                        className="glass-input border-white/20 text-white"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pickup_date" className="text-white">Date & Heure de départ</Label>
                    <Input
                      id="pickup_date"
                      type="datetime-local"
                      value={formData.pickup_date}
                      onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                      className="glass-input border-white/20 text-white"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                {/* Arrivée */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Arrivée</h3>
                  <div>
                    <Label htmlFor="delivery_address" className="text-white">Adresse d'arrivée *</Label>
                    <Input
                      id="delivery_address"
                      value={formData.delivery_address}
                      onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                      className="glass-input border-white/20 text-white"
                      disabled={!canEdit}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="delivery_contact_name" className="text-white">Contact</Label>
                      <Input
                        id="delivery_contact_name"
                        value={formData.delivery_contact_name}
                        onChange={(e) => handleInputChange('delivery_contact_name', e.target.value)}
                        className="glass-input border-white/20 text-white"
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery_contact_phone" className="text-white">Téléphone</Label>
                      <Input
                        id="delivery_contact_phone"
                        value={formData.delivery_contact_phone}
                        onChange={(e) => handleInputChange('delivery_contact_phone', e.target.value)}
                        className="glass-input border-white/20 text-white"
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery_contact_email" className="text-white">Email</Label>
                      <Input
                        id="delivery_contact_email"
                        type="email"
                        value={formData.delivery_contact_email}
                        onChange={(e) => handleInputChange('delivery_contact_email', e.target.value)}
                        className="glass-input border-white/20 text-white"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="delivery_date" className="text-white">Date & Heure d'arrivée prévue</Label>
                    <Input
                      id="delivery_date"
                      type="datetime-local"
                      value={formData.delivery_date}
                      onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                      className="glass-input border-white/20 text-white"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignation et revenus */}
          <Card className="glass-card border-white/10 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">📌 Assignation et revenus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor_id" className="text-white">Donneur d'ordre</Label>
                  <Select value={formData.donor_id} onValueChange={(value) => handleInputChange('donor_id', value)} disabled={!canEdit}>
                    <SelectTrigger className="glass-input border-white/20 text-white">
                      <SelectValue placeholder="Sélectionner ou s'assigner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Moi-même</SelectItem>
                      {contactsData?.data?.map((contact: any) => (
                        <SelectItem key={contact.invited_user_id} value={contact.invited_user_id}>
                          {contact.name} ({contact.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver_id" className="text-white">Convoyeur</Label>
                  <Select value={formData.driver_id} onValueChange={(value) => handleInputChange('driver_id', value)} disabled={!canEdit}>
                    <SelectTrigger className="glass-input border-white/20 text-white">
                      <SelectValue placeholder="Sélectionner ou s'assigner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Moi-même</SelectItem>
                      {contactsData?.data?.map((contact: any) => (
                        <SelectItem key={contact.invited_user_id} value={contact.invited_user_id}>
                          {contact.name} ({contact.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor_earning" className="text-white">Revenus donneur d'ordre (€) *</Label>
                  <Input
                    id="donor_earning"
                    type="number"
                    step="0.01"
                    value={formData.donor_earning}
                    onChange={(e) => handleInputChange('donor_earning', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver_earning" className="text-white">Revenus convoyeur (€) *</Label>
                  <Input
                    id="driver_earning"
                    type="number"
                    step="0.01"
                    value={formData.driver_earning}
                    onChange={(e) => handleInputChange('driver_earning', e.target.value)}
                    className="glass-input border-white/20 text-white"
                    disabled={!canEdit}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild className="glass-card text-foreground border-border hover:bg-accent/10">
              <Link to="/missions">Annuler</Link>
            </Button>
            <Button
              type="submit"
              disabled={!canEdit || updateMission.isPending}
              className="bg-gradient-cosmic hover:scale-105 transition-all duration-300 glow-hover"
            >
              {updateMission.isPending ? 'Mise à jour...' : 'Mettre à jour la mission'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMission;