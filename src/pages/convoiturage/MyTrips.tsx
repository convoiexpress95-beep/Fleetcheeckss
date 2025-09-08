import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Clock, Users, Euro, Car, Plus, Edit, Trash2, MessageCircle, Eye } from "lucide-react";

const MyTrips = () => {
  const myPublishedTrips = [
    {
      id: "1",
      departure: "Paris",
      destination: "Lyon",
      date: "15 Mars 2024",
      time: "14:30",
      price: 25,
      availableSeats: 2,
      totalSeats: 3,
      status: "active",
      reservations: [
        { id: "1", passenger: "Thomas Martin", avatar: "/placeholder-avatar.jpg" },
        { id: "2", passenger: "Sophie Durand", avatar: "/placeholder-avatar.jpg" },
      ],
    },
    {
      id: "2",
      departure: "Lyon",
      destination: "Marseille",
      date: "20 Mars 2024",
      time: "09:00",
      price: 20,
      availableSeats: 3,
      totalSeats: 3,
      status: "active",
      reservations: [],
    },
  ];

  const myReservations = [
    {
      id: "1",
      departure: "Marseille",
      destination: "Nice",
      date: "22 Mars 2024",
      time: "16:00",
      price: 15,
      status: "confirmed",
      driver: {
        name: "Antoine Dubois",
        rating: 4.9,
        avatar: "/placeholder-avatar.jpg",
      },
    },
    {
      id: "2",
      departure: "Nice",
      destination: "Monaco",
      date: "25 Mars 2024",
      time: "10:30",
      price: 8,
      status: "pending",
      driver: {
        name: "Claire Bernard",
        rating: 4.7,
        avatar: "/placeholder-avatar.jpg",
      },
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Actif</Badge>;
      case "confirmed":
        return <Badge variant="default" className="bg-green-500">Confirmé</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "completed":
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes trajets</h1>
            <p className="text-muted-foreground">Gérez vos trajets publiés et vos réservations</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Publier un trajet
          </Button>
        </div>

        <Tabs defaultValue="published" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="published">Mes trajets publiés</TabsTrigger>
            <TabsTrigger value="reservations">Mes réservations</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="space-y-4 mt-6">
            {myPublishedTrips.length === 0 ? (
              <Card className="glass-card border-border/50 shadow-card">
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun trajet publié</h3>
                  <p className="text-muted-foreground mb-4">Commencez à partager vos trajets avec la communauté</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Publier mon premier trajet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myPublishedTrips.map((trip) => (
                <Card key={trip.id} className="glass-card border-border/50 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{trip.departure}</span>
                          </div>
                          <div className="w-6 h-px bg-border"></div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{trip.destination}</span>
                          </div>
                          {getStatusBadge(trip.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {trip.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {trip.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {trip.availableSeats}/{trip.totalSeats} places
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {trip.price}€
                          </div>
                        </div>

                        {trip.reservations.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Passagers ({trip.reservations.length})</div>
                            <div className="flex items-center gap-2">
                              {trip.reservations.map((reservation) => (
                                <div key={reservation.id} className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={reservation.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {reservation.passenger
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">{reservation.passenger}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:w-auto">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Messages
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4 mt-6">
            {myReservations.length === 0 ? (
              <Card className="glass-card border-border/50 shadow-card">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
                  <p className="text-muted-foreground mb-4">Recherchez et réservez votre prochain trajet</p>
                  <Button>Rechercher un trajet</Button>
                </CardContent>
              </Card>
            ) : (
              myReservations.map((reservation) => (
                <Card key={reservation.id} className="glass-card border-border/50 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{reservation.departure}</span>
                          </div>
                          <div className="w-6 h-px bg-border"></div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{reservation.destination}</span>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {reservation.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {reservation.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {reservation.price}€
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={reservation.driver.avatar} />
                            <AvatarFallback>
                              {reservation.driver.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{reservation.driver.name}</div>
                            <div className="text-sm text-muted-foreground">⭐ {reservation.driver.rating}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:w-auto">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contacter
                        </Button>
                        {reservation.status === "pending" && (
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTrips;
