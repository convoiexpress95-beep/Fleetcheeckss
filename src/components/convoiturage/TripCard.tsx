import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Star, Users, Euro } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface Trip {
  id: string;
  departure: string;
  destination: string;
  departureTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  driver: Driver;
  route: string[];
}

interface TripCardProps {
  trip: Trip;
  onReserve?: () => void | Promise<void>;
}

export function TripCard({ trip, onReserve }: TripCardProps) {
  const initials = trip.driver.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="glass-card glow-hover transition-spring border border-border/50 hover:border-primary/30">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          {/* Route */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-lg font-semibold text-foreground">{trip.departureTime}</div>
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <Clock className="w-4 h-4" />
                {trip.duration}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{trip.departure}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {trip.route.join(' → ')} → {trip.destination}
                </div>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-primary flex items-center gap-1">
              <Euro className="w-5 h-5" />
              {trip.price}
            </div>
            <div className="text-xs text-muted-foreground">par personne</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {/* Conducteur */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={trip.driver.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{trip.driver.name}</span>
                {trip.driver.isVerified && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Vérifié
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{trip.driver.rating}</span>
                <span>({trip.driver.reviewCount} avis)</span>
              </div>
            </div>
          </div>

          {/* Places et bouton */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{trip.availableSeats} place{trip.availableSeats > 1 ? 's' : ''}</span>
            </div>
            <Button variant="secondary" className="hover-glow" onClick={() => onReserve?.()}>
              Réserver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
