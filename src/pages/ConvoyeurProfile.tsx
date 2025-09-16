import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Star, MapPin, Calendar, Car, Phone, Mail, 
  Award, Shield, TrendingUp, Clock, CheckCircle, 
  MessageCircle, ArrowLeft, Sparkles, Route, Euro,
  ThumbsUp, MapIcon, Users, Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ConvoyeurProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalRating: number;
  completedMissions: number;
  memberSince: string;
  verified: boolean;
  premium: boolean;
  location: string;
  specialties: string[];
  description: string;
  stats: {
    totalDistance: number;
    averageResponseTime: string;
    satisfactionRate: number;
    repeatClients: number;
  };
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  missionType: string;
  vehicleType: string;
  route: string;
}

interface Mission {
  id: string;
  title: string;
  client: string;
  route: string;
  date: string;
  price: number;
  status: 'completed' | 'in_progress' | 'cancelled';
  vehicleType: string;
  rating?: number;
}

const ConvoyeurProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ConvoyeurProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      // Mock data du profil convoyeur
      const mockProfile: ConvoyeurProfile = {
        id: id || "1",
        name: "Jean Dupont",
        email: "jean.dupont@email.com",
        phone: "+33 6 12 34 56 78",
        avatar: "",
        rating: 4.8,
        totalRating: 156,
        completedMissions: 234,
        memberSince: "2020-03-15",
        verified: true,
        premium: true,
        location: "Paris, Île-de-France",
        specialties: ["Véhicules de luxe", "Longue distance", "Transport urgente"],
        description: "Convoyeur professionnel avec plus de 10 ans d'expérience. Spécialisé dans le transport de véhicules haut de gamme et missions longue distance. Ponctuel, soigneux et fiable.",
        stats: {
          totalDistance: 85420,
          averageResponseTime: "2h",
          satisfactionRate: 98.5,
          repeatClients: 67
        }
      };

      const mockReviews: Review[] = [
        {
          id: "1",
          clientName: "Premium Cars SARL",
          rating: 5,
          comment: "Excellent convoyeur ! Très professionnel, ponctuel et soigneux avec le véhicule. Je recommande vivement pour les missions de prestige.",
          date: "2025-09-10",
          missionType: "Transport de luxe",
          vehicleType: "Mercedes Classe S",
          route: "Paris → Monaco"
        },
        {
          id: "2", 
          clientName: "AutoNeuf Distribution",
          rating: 5,
          comment: "Parfait comme toujours ! Jean est notre convoyeur de confiance depuis 3 ans. Jamais déçu, toujours à l'heure et très communicant.",
          date: "2025-09-05",
          missionType: "Livraison concessionnaire",
          vehicleType: "BMW X5",
          route: "Lyon → Genève"
        },
        {
          id: "3",
          clientName: "Société Martin",
          rating: 4,
          comment: "Très bon service. Le véhicule est arrivé en parfait état. Une petite amélioration sur la communication pendant le transport serait un plus.",
          date: "2025-08-28",
          missionType: "Transport particulier",
          vehicleType: "Audi A6",
          route: "Marseille → Nice"
        },
        {
          id: "4",
          clientName: "FleetManager Pro",
          rating: 5,
          comment: "Convoyeur exemplaire ! Mission urgente réalisée dans les temps avec un suivi constant. Parfait pour nos besoins professionnels.",
          date: "2025-08-20",
          missionType: "Mission urgente", 
          vehicleType: "Renault Trafic",
          route: "Toulouse → Barcelona"
        }
      ];

      const mockMissions: Mission[] = [
        {
          id: "1",
          title: "Transport Mercedes Classe S - Mission VIP",
          client: "Premium Cars SARL", 
          route: "Paris → Monaco",
          date: "2025-09-10",
          price: 1200,
          status: "completed",
          vehicleType: "Mercedes Classe S",
          rating: 5
        },
        {
          id: "2",
          title: "Livraison BMW X5 - Concessionnaire",
          client: "AutoNeuf Distribution",
          route: "Lyon → Genève", 
          date: "2025-09-05",
          price: 800,
          status: "completed",
          vehicleType: "BMW X5",
          rating: 5
        },
        {
          id: "3",
          title: "Transport Audi A6 - Client particulier",
          client: "Société Martin",
          route: "Marseille → Nice",
          date: "2025-08-28",
          price: 450,
          status: "completed", 
          vehicleType: "Audi A6",
          rating: 4
        }
      ];

      setProfile(mockProfile);
      setReviews(mockReviews);
      setMissions(mockMissions);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    };
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      in_progress: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
      cancelled: "bg-gradient-to-r from-red-500 to-pink-500 text-white"
    };

    const labels = {
      completed: "Terminée",
      in_progress: "En cours",
      cancelled: "Annulée"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/10 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 h-96 bg-white/10 rounded-2xl"></div>
              <div className="lg:col-span-2 h-96 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profil non trouvé</h2>
          <Button onClick={() => navigate("/marketplace")} className="bg-gradient-to-r from-cyan-500 to-teal-500">
            Retour au marketplace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="glass-card text-foreground border-border hover:bg-accent/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Profil Convoyeur
            </h1>
            <p className="text-white/70">Informations détaillées et évaluations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Informations du convoyeur */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profil principal */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-2xl font-bold">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {renderStars(profile.rating, 'lg')}
                  <span className="text-white font-medium">
                    {profile.rating} ({profile.totalRating} avis)
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  {profile.verified && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <Shield className="w-3 h-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                  {profile.premium && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm text-white/80">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    {profile.location}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Membre depuis {new Date(profile.memberSince).getFullYear()}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    {profile.completedMissions} missions réalisées
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex gap-2 mt-6">
                    <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contacter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Distance totale</span>
                  <span className="text-white font-bold">{profile.stats.totalDistance.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Temps de réponse</span>
                  <span className="text-white font-bold">{profile.stats.averageResponseTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Satisfaction</span>
                  <span className="text-green-300 font-bold">{profile.stats.satisfactionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Clients fidèles</span>
                  <span className="text-white font-bold">{profile.stats.repeatClients}</span>
                </div>
              </CardContent>
            </Card>

            {/* Spécialités */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Spécialités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-cyan-400/30 text-white">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact (pour profil privé) */}
            {isOwnProfile && (
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/80 text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">{profile.phone}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 mb-6">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
                  Évaluations ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="missions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
                  Missions ({missions.length})
                </TabsTrigger>
              </TabsList>

              {/* Aperçu */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 leading-relaxed">{profile.description}</p>
                  </CardContent>
                </Card>

                {/* Dernières évaluations */}
                <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Dernières évaluations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">{review.clientName}</span>
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-white/50 text-sm">
                            {new Date(review.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mb-2">{review.comment}</p>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span>{review.vehicleType}</span>
                          <span>{review.route}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Évaluations */}
              <TabsContent value="reviews" className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{review.clientName}</h3>
                            {renderStars(review.rating)}
                          </div>
                          <Badge variant="outline" className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-cyan-400/30 text-white">
                            {review.missionType}
                          </Badge>
                        </div>
                        <span className="text-white/50 text-sm">
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <p className="text-white/80 mb-4 leading-relaxed">{review.comment}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {review.vehicleType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Route className="w-4 h-4" />
                          {review.route}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Missions */}
              <TabsContent value="missions" className="space-y-4">
                {missions.map((mission) => (
                  <Card key={mission.id} className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
                            {getStatusBadge(mission.status)}
                          </div>
                          <p className="text-white/70 text-sm">{mission.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-300">{mission.price}€</p>
                          {mission.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {renderStars(mission.rating, 'sm')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="text-white/80 text-sm">{mission.route}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80 text-sm">
                            {new Date(mission.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-purple-400" />
                          <span className="text-white/80 text-sm">{mission.vehicleType}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvoyeurProfile;
