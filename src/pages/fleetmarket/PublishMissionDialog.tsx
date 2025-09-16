import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, Car, Euro, FileText, Loader2 } from 'lucide-react';
import { findVehicleByName, getAllBrands, getVehiclesByBrand, getVehiclesSortedByBrand } from '@/data/fleetmarketVehicles';
import { useToast } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { publishMission } from '@/services/fleetMarketService';
import { useWallet } from '@/hooks/useWallet';

interface Props { onCreated?: () => void; }

export function PublishMissionDialog({ onCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    departureDate: '',
    arrivalDate: '',
    vehicle: '',
    price: '',
    description: '',
    urgency: 'normal' as 'normal' | 'urgent',
    company: '',
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const { balance } = useWallet();

  const handleVehicleChange = (vehicleName: string) => {
    setFormData(prev => ({ ...prev, vehicle: vehicleName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erreur d'authentification", description: "Vous devez être connecté pour publier une mission", variant: 'destructive' });
      return;
    }
    if (balance < 1) {
      toast({ title: 'Crédits insuffisants', description: 'Publier une mission requiert au moins 1 crédit.', variant: 'destructive' });
      return;
    }
    if (!formData.departure || !formData.arrival || !formData.vehicle || !formData.price) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }
    if (parseFloat(formData.price) < 50) {
      toast({ title: 'Prix invalide', description: 'Le prix minimum est de 50€', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await publishMission({
        titre: `Transport ${formData.vehicle} - ${formData.departure} vers ${formData.arrival}`,
        ville_depart: formData.departure,
        ville_arrivee: formData.arrival,
        date_depart: formData.departureDate ? new Date(formData.departureDate).toISOString() : new Date().toISOString(),
        description: formData.description || null,
        prix_propose: parseFloat(formData.price),
        vehicule_requis: formData.vehicle,
      } as any);

      toast({ title: 'Mission publiée avec succès !', description: 'Votre mission est maintenant visible par les convoyeurs' });
      setIsOpen(false);
      setFormData({
        departure: '',
        arrival: '',
        departureDate: '',
        arrivalDate: '',
        vehicle: '',
        price: '',
        description: '',
        urgency: 'normal',
        company: '',
      });
      onCreated?.();
    } catch (error: any) {
      console.error('Erreur lors de la publication:', error);
      toast({ title: 'Erreur', description: error?.message || 'Impossible de publier la mission', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVehicle = findVehicleByName(formData.vehicle);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
  <Button size="lg" className="bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold shadow-elegant" disabled={balance < 1}>
          <Plus className="w-5 h-5 mr-2" />
          Publier une mission
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Publier une nouvelle mission
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {balance < 1 && (
            <div className="p-3 text-sm rounded border border-yellow-300 bg-yellow-50 text-yellow-800">
              Vous n'avez pas assez de crédits pour publier (solde: {balance}).
            </div>
          )}
          {/* Informations du trajet */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Informations du trajet
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departure">Ville de départ *</Label>
                <Input id="departure" placeholder="Paris, Lyon, Marseille..." value={formData.departure} onChange={(e) => setFormData(prev => ({ ...prev, departure: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="arrival">Ville d'arrivée *</Label>
                <Input id="arrival" placeholder="Destination..." value={formData.arrival} onChange={(e) => setFormData(prev => ({ ...prev, arrival: e.target.value }))} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureDate">Date de départ</Label>
                <Input id="departureDate" type="datetime-local" value={formData.departureDate} onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="arrivalDate">Date d'arrivée souhaitée</Label>
                <Input id="arrivalDate" type="datetime-local" value={formData.arrivalDate} onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Véhicule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Véhicule à convoyer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Filtrer par marque</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les marques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les marques</SelectItem>
                    {getAllBrands().map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle">Type de véhicule *</Label>
                <Select value={formData.vehicle} onValueChange={handleVehicleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(selectedBrand && selectedBrand !== 'all' ? getVehiclesByBrand(selectedBrand) : getVehiclesSortedByBrand()).map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.name}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {vehicle.category}
                          </Badge>
                          <span className="font-medium text-xs text-muted-foreground">{vehicle.brand}</span>
                          <span>{vehicle.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedVehicle && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <img src={selectedVehicle.image} alt={selectedVehicle.name} className="w-20 h-14 object-cover rounded" />
                <div>
                  <p className="font-medium">{selectedVehicle.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVehicle.brand}</p>
                </div>
              </div>
            )}
          </div>

          {/* Détails financiers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              Conditions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix proposé (€) *</Label>
                <Input id="price" type="number" placeholder="150" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="urgency">Urgence</Label>
                <Select value={formData.urgency} onValueChange={(value: 'normal' | 'urgent') => setFormData(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" placeholder="Nom de votre entreprise" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Informations complémentaires
            </h3>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Ajoutez des détails sur la mission, contraintes particulières..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-hero hover:opacity-90 text-primary-foreground">
              {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publication...</>) : ('Publier la mission')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
