import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Route, Fuel, Star, MessageCircle, Send } from "lucide-react";
import { findVehicleByName } from "../../data/marketplace-vehicles";

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
    <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Informations du trajet */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <img src={companyLogo} alt={company} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {company.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white">{departure}</h3>
                <p className="text-sm text-white/70">{company}</p>
              </div>
            </div>
            {isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                Urgent
              </Badge>
            )}
          </div>

          <div className="flex items-center text-sm text-white/80 gap-6">
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

          <div className="text-sm text-white/80">
            <p>📅 Départ du {departureDate} au {arrivalDate}</p>
            <p>🚗 Véhicule: {vehicle}</p>
            {description && <p className="mt-2 text-xs text-white/70">{description}</p>}
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
              <p className="text-xs text-white/70 mt-1">{vehicleData.name}</p>
            </div>
          )}
        </div>

        {/* Prix et actions */}
        <div className="flex flex-col items-end gap-4 lg:w-40">
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-white/80">{rating}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{price}€</span>
              {isUrgent && <Fuel className="w-5 h-5 text-destructive" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Prix proposé
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className={`w-full ${
                status === 'available' 
                  ? 'bg-green-600/80 hover:bg-green-700/90 text-white backdrop-blur-sm' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm'
              }`}
              disabled={status !== 'available'}
            >
              {status === 'available' ? 'Accepter ce prix' : 'Indisponible'}
            </Button>
            
            {onSendDevis && status === 'available' && (
              <Button 
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
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