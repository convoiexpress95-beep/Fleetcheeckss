import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Euro, 
  Star,
  Phone,
  MessageCircle,
  Car,
  Shield,
  Snowflake,
  Music,
  Cigarette,
  CigaretteOff,
  Heart,
  Share2
} from "lucide-react";

const TripDetails = () => {
  const trip = {
    id: "1",
    departure: "Paris",
    destination: "Lyon",
    date: "Vendredi 15 Mars",
    time: "14:30",
    price: 25,
    availableSeats: 2,
    totalSeats: 3,
    driver: {
      name: "Marie Dubois",
      rating: 4.8,
      reviews: 42,
      avatar: "/placeholder-avatar.jpg",
      age: 28,
      memberSince: "2021"
    },
    car: {
      model: "Peugeot 308",
      color: "Bleu",
      year: 2020
    },
    options: ["Climatisation", "Musique autorisée", "Non-fumeur"],
    description: "Trajet direct Paris-Lyon. Départ depuis Porte de Bagnolet, arrivée Part-Dieu. Voyage détendu avec de la musique d'ambiance. Au plaisir de vous rencontrer !",
    pickupPoints: [
      { time: "14:30", location: "Paris - Porte de Bagnolet" },
      { time: "14:45", location: "Paris - Porte d'Italie" },
      { time: "18:15", location: "Lyon - Part-Dieu" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du trajet */}
          <Card className="glass backdrop-blur-lg border border-border/50 shadow-card mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Informations du trajet */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-xl font-semibold text-foreground">
                        {trip.departure}
                      </span>
                    </div>
                    <div className="w-8 h-px bg-border"></div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-xl font-semibold text-foreground">
                        {trip.destination}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{trip.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{trip.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{trip.availableSeats} places disponibles</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {trip.options.map((option) => (
                      <Badge key={option} variant="secondary" className="flex items-center gap-1">
                        {option === "Climatisation" && <Snowflake className="w-3 h-3" />}
                        {option === "Musique autorisée" && <Music className="w-3 h-3" />}
                        {option === "Non-fumeur" && <CigaretteOff className="w-3 h-3" />}
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Prix et actions */}
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary flex items-center gap-1">
                      <Euro className="w-6 h-6" />
                      {trip.price}
                    </div>
                    <div className="text-sm text-muted-foreground">par personne</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations détaillées */}
            <div className="lg:col-span-2 space-y-6">
              {/* Points d'arrêt */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Points d'arrêt
                  </h3>
                  <div className="space-y-4">
                    {trip.pickupPoints.map((point, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{point.location}</div>
                            <div className="text-sm text-muted-foreground">{point.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Description du trajet
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {trip.description}
                  </p>
                </CardContent>
              </Card>

              {/* Véhicule */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Véhicule
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{trip.car.model}</div>
                      <div className="text-sm text-muted-foreground">
                        {trip.car.color} • {trip.car.year}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profil du conducteur et réservation */}
            <div className="space-y-6">
              {/* Profil du conducteur */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Conducteur
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                      <AvatarImage src={trip.driver.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {trip.driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{trip.driver.name}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{trip.driver.rating}</span>
                        <span className="text-muted-foreground">
                          ({trip.driver.reviews} avis)
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trip.driver.age} ans • Membre depuis {trip.driver.memberSince}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Profil vérifié</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-4 h-4" />
                      Appeler
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Réservation */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Réserver
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Prix par personne</span>
                      <span className="font-semibold text-foreground">{trip.price}€</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Places disponibles</span>
                      <span className="font-semibold text-primary">{trip.availableSeats}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">{trip.price}€</span>
                    </div>

                    <Button variant="hero" size="lg" className="w-full">
                      Réserver ce trajet
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Vous ne payez qu'après confirmation du conducteur
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;