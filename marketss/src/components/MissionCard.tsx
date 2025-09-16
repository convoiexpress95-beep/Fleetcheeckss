import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Route, Fuel, Star, MessageCircle, Send } from "lucide-react";
import { findVehicleByName } from "@/data/vehicles";

interface MissionCardProps {
  id: string;
  departure: string;
  arrival: string;
  departureDate: string;
  arrivalDate: string;
  distance: string;
  duration: string;
  price: number;
  vehicle: string;
  company: string;
  companyLogo?: string;
  rating?: number;
  isUrgent?: boolean;
  status?: 'available' | 'reserved' | 'completed';
  title?: string;
  description?: string;
  onSendDevis?: (mission: any) => void;
}

const MissionCard = ({
  id,
  departure,
  arrival,
  departureDate,
  arrivalDate,
  distance,
  duration,
  price,
  vehicle,
  company,
  companyLogo,
  rating = 4.8,
  isUrgent = false,
  status = 'available',
  title,
  description,
  onSendDevis
}: MissionCardProps) => {
  const vehicleData = findVehicleByName(vehicle);

  return (
    <div className="bg-card rounded-xl shadow-card border border-border p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Informations du trajet */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <img src={companyLogo} alt={company} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {company.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground">{departure}</h3>
                <p className="text-sm text-muted-foreground">{company}</p>
              </div>
            </div>
            {isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                Urgent
              </Badge>
            )}
          </div>

          <div className="flex items-center text-sm text-muted-foreground gap-6">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{arrival}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Route className="w-4 h-4" />
              <span>{distance}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>📅 Départ du {departureDate} au {arrivalDate}</p>
          </div>
        </div>

        {/* Image du véhicule */}
        <div className="flex items-center justify-center lg:w-40">
          {vehicleData && (
            <div className="text-center">
              <img 
                src={vehicleData.image} 
                alt={vehicleData.name}
                className="w-32 h-20 object-cover rounded-lg bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">{vehicleData.name}</p>
            </div>
          )}
        </div>

        {/* Prix et actions */}
        <div className="flex flex-col items-end gap-4 lg:w-40">
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{rating}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-primary">{price}€</span>
              {isUrgent && <Fuel className="w-5 h-5 text-destructive" />}
            </div>
            <p className="text-xs text-muted-foreground">
              FIN DANS<br />2 HEURES
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className={`w-full ${
                status === 'available' 
                  ? 'bg-success hover:bg-success/90 text-success-foreground' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              disabled={status !== 'available'}
            >
              {status === 'available' ? 'Accepter ce prix' : 'Indisponible'}
            </Button>
            
            {onSendDevis && status === 'available' && (
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => onSendDevis({
                  id,
                  titre: title || `Transport ${vehicle} - ${departure} vers ${arrival}`,
                  ville_depart: departure,
                  ville_arrivee: arrival,
                  prix_propose: price,
                  description,
                  vehicule_requis: vehicle
                })}
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer un devis
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionCard;