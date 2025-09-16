import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Car, MapPin, Calendar, Users, FileText, Plus, Upload } from "lucide-react";
import { mockClients, mockEmployees } from "@/lib/mock-data";
import { popularVehicles, VehicleModel } from "@/lib/vehicle-catalog";

interface MissionFormProps {
  currentStep: number;
  formData: any;
  onFormDataChange: (data: any) => void;
}

export const MissionForm = ({ currentStep, formData, onFormDataChange }: MissionFormProps) => {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ClientContactStep formData={formData} onChange={onFormDataChange} />;
      case 2:
        return <VehicleStep formData={formData} onChange={onFormDataChange} />;
      case 3:
        return <ItineraryStep formData={formData} onChange={onFormDataChange} />;
      case 4:
        return <ScheduleStep formData={formData} onChange={onFormDataChange} />;
      case 5:
        return <AssignmentStep formData={formData} onChange={onFormDataChange} />;
      case 6:
        return <FinalizationStep formData={formData} onChange={onFormDataChange} />;
      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderStep()}</div>;
};

const ClientContactStep = ({ formData, onChange }: any) => (
  <Card className="glass border-glass-border">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        Client & Contact
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label>Client</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {mockClients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un nouveau client
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom du contact</Label>
          <Input placeholder="Nom et prénom" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="contact@entreprise.com" />
        </div>
        <div className="space-y-2">
          <Label>Téléphone</Label>
          <Input placeholder="01 23 45 67 89" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const VehicleStep = ({ formData, onChange }: any) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleModel | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [customVehicle, setCustomVehicle] = useState(false);

  const handleVehicleSelect = (vehicle: VehicleModel) => {
    setSelectedVehicle(vehicle);
    setShowCatalog(false);
    onChange({
      brand: vehicle.brand,
      model: vehicle.model,
      category: vehicle.category,
      energy: vehicle.energy
    });
  };

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          Véhicule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedVehicle && !customVehicle ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Choisissez un véhicule dans notre catalogue ou saisissez manuellement
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="default" 
                  onClick={() => setShowCatalog(true)}
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Catalogue de véhicules
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomVehicle(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Saisie manuelle
                </Button>
              </div>
            </div>

            {showCatalog && (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Véhicules populaires en France</h4>
                  <p className="text-xs text-muted-foreground">Sélectionnez un modèle</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {popularVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border border-glass-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div className="aspect-video rounded-md overflow-hidden mb-2 bg-gradient-to-br from-secondary/20 to-secondary/5">
                        <img 
                          src={vehicle.image} 
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">{vehicle.brand}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                        <div className="flex gap-1 mt-1 justify-center">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {vehicle.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {vehicle.energy}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCatalog(false)}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        ) : selectedVehicle ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg">
              <div className="w-20 h-12 rounded overflow-hidden bg-background">
                <img 
                  src={selectedVehicle.image} 
                  alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {selectedVehicle.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedVehicle.energy}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedVehicle(null);
                  setCustomVehicle(false);
                }}
              >
                Changer
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Immatriculation</Label>
              <Input placeholder="AB-123-CD" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Saisie manuelle</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCustomVehicle(false)}
              >
                Retour
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marque</Label>
                <Input placeholder="Peugeot, Renault, BMW..." />
              </div>
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Input placeholder="308, Clio, X3..." />
              </div>
              <div className="space-y-2">
                <Label>Immatriculation</Label>
                <Input placeholder="AB-123-CD" />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VL">VL - Véhicule Léger</SelectItem>
                    <SelectItem value="VU">VU - Véhicule Utilitaire</SelectItem>
                    <SelectItem value="PL">PL - Poids Lourd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Énergie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Type d'énergie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essence">Essence</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electrique">Électrique</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ItineraryStep = ({ formData, onChange }: any) => (
  <Card className="glass border-glass-border">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Itinéraire
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Adresse de départ</Label>
            <Input placeholder="Adresse complète de départ" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact départ - Nom</Label>
              <Input placeholder="Nom du contact au départ" />
            </div>
            <div className="space-y-2">
              <Label>Contact départ - Téléphone</Label>
              <Input placeholder="01 23 45 67 89" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Adresse d'arrivée</Label>
            <Input placeholder="Adresse complète d'arrivée" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact arrivée - Nom</Label>
              <Input placeholder="Nom du contact à l'arrivée" />
            </div>
            <div className="space-y-2">
              <Label>Contact arrivée - Téléphone</Label>
              <Input placeholder="01 23 45 67 89" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Distance (km)</Label>
          <Input type="number" placeholder="Calculée automatiquement" disabled />
        </div>
        <div className="space-y-2">
          <Label>Durée estimée (min)</Label>
          <Input type="number" placeholder="Calculée automatiquement" disabled />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lieu de remise (optionnel)</Label>
        <Textarea placeholder="Instructions spéciales pour la remise du véhicule..." />
      </div>
    </CardContent>
  </Card>
);

const ScheduleStep = ({ formData, onChange }: any) => (
  <Card className="glass border-glass-border">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Planning
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>Créneau horaire</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un créneau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="08:00-09:00">08:00 - 09:00</SelectItem>
              <SelectItem value="09:00-10:00">09:00 - 10:00</SelectItem>
              <SelectItem value="10:00-11:00">10:00 - 11:00</SelectItem>
              <SelectItem value="14:00-15:00">14:00 - 15:00</SelectItem>
              <SelectItem value="15:00-16:00">15:00 - 16:00</SelectItem>
              <SelectItem value="16:00-17:00">16:00 - 17:00</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Flexibilité</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Flexibilité horaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strict">Horaire strict</SelectItem>
              <SelectItem value="±30min">±30 minutes</SelectItem>
              <SelectItem value="±60min">±60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Mission urgente</Label>
            <p className="text-sm text-muted-foreground">Priorité élevée pour cette mission</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Aller-retour</Label>
            <p className="text-sm text-muted-foreground">Le véhicule doit revenir au point de départ</p>
          </div>
          <Switch />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AssignmentStep = ({ formData, onChange }: any) => (
  <Card className="glass border-glass-border">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Affectation & Options
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label>Assigné à</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un convoyeur" />
          </SelectTrigger>
          <SelectContent>
            {mockEmployees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} - {employee.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Activer le tracking GPS</Label>
            <p className="text-sm text-muted-foreground">Suivi en temps réel du véhicule</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Inspection départ requise</Label>
            <p className="text-sm text-muted-foreground">Inspection obligatoire avant départ</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Inspection arrivée requise</Label>
            <p className="text-sm text-muted-foreground">Inspection obligatoire à l'arrivée</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Documents requis</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Carte grise", "Assurance", "Permis de conduire", "Facture", "Bon de livraison"].map(doc => (
            <label key={doc} className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked={doc === "Carte grise" || doc === "Assurance"} />
              <span className="text-sm">{doc}</span>
            </label>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const FinalizationStep = ({ formData, onChange }: any) => (
  <div className="space-y-6">
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Finalisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-2">
          <Label>Notes & consignes</Label>
          <Textarea placeholder="Instructions spéciales, consignes d'accès, informations importantes..." />
        </div>

        <div className="space-y-2">
          <Label>Pièces jointes</Label>
          <div className="border-2 border-dashed border-glass-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Glissez-déposez vos fichiers ou cliquez pour parcourir
            </p>
            <Button variant="outline" size="sm">
              Parcourir les fichiers
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);