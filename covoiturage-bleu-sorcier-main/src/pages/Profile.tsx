import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Star, 
  Shield, 
  Car, 
  Camera,
  Edit,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Clock,
  Users,
  Euro
} from "lucide-react";

const Profile = () => {
  const user = {
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "06 12 34 56 78",
    avatar: "/placeholder-avatar.jpg",
    memberSince: "Mars 2021",
    rating: 4.8,
    totalReviews: 42,
    completedTrips: 87,
    bio: "Passionnée de voyages et de rencontres, j'aime partager mes trajets et découvrir de nouvelles personnes. Toujours à l'heure et respectueuse de l'environnement !",
    location: "Paris, France",
    preferences: {
      music: true,
      pets: false,
      smoking: false,
      chatty: true
    },
    car: {
      model: "Peugeot 308",
      color: "Bleu",
      year: 2020,
      seats: 4
    }
  };

  const recentReviews = [
    {
      id: "1",
      reviewer: "Thomas Martin",
      rating: 5,
      comment: "Excellente conductrice, très ponctuelle et agréable. Trajet très confortable !",
      date: "Il y a 2 jours",
      trip: "Paris → Lyon"
    },
    {
      id: "2",
      reviewer: "Sophie Bernard",
      rating: 5,
      comment: "Super voyage ! Marie est très sympa et conduit bien. Je recommande vivement.",
      date: "Il y a 1 semaine",
      trip: "Lyon → Marseille"
    },
    {
      id: "3",
      reviewer: "Antoine Durand",
      rating: 4,
      comment: "Très bon trajet, conductrice sérieuse et voiture propre.",
      date: "Il y a 2 semaines",
      trip: "Paris → Bordeaux"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6 mt-6">
              {/* En-tête du profil */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="absolute bottom-0 right-0 rounded-full w-10 h-10"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4 text-primary" />
                          <span>Profil vérifié</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                        <Button variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{user.rating}</div>
                          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            Note moyenne
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{user.totalReviews}</div>
                          <div className="text-sm text-muted-foreground">Avis reçus</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{user.completedTrips}</div>
                          <div className="text-sm text-muted-foreground">Trajets réalisés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Membre depuis</div>
                          <div className="font-semibold text-foreground">{user.memberSince}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Véhicule */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Mon véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{user.car.model}</div>
                      <div className="text-muted-foreground">
                        {user.car.color} • {user.car.year} • {user.car.seats} places
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Préférences de voyage */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Préférences de voyage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.music ? "default" : "outline"}>
                        Musique
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.pets ? "default" : "outline"}>
                        Animaux
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={!user.preferences.smoking ? "default" : "outline"}>
                        Non-fumeur
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.chatty ? "default" : "outline"}>
                        Bavard
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4 mt-6">
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Avis reçus ({user.totalReviews})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {recentReviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {review.reviewer.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{review.reviewer}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-muted-foreground mb-2">{review.comment}</p>
                          <div className="text-sm text-muted-foreground">
                            Trajet : {review.trip}
                          </div>
                        </div>
                      </div>
                      {review.id !== recentReviews[recentReviews.length - 1].id && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6 mt-6">
              {/* Informations personnelles */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" defaultValue="Marie" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" defaultValue="Dubois" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="email" defaultValue={user.email} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" defaultValue={user.phone} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">À propos de moi</Label>
                    <Textarea id="bio" defaultValue={user.bio} className="min-h-[100px]" />
                  </div>
                  <Button variant="hero">
                    Sauvegarder les modifications
                  </Button>
                </CardContent>
              </Card>

              {/* Paramètres de notification */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Nouvelles réservations</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir une notification lors de nouvelles réservations
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Messages</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir une notification pour les nouveaux messages
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Rappels de trajet</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir des rappels avant vos trajets
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;