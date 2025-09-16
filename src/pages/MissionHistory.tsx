import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  History, MapPin, Calendar, Car, Euro, Star, User,
  ArrowLeft, Search, Filter, TrendingUp, CheckCircle,
  XCircle, Download, Eye, BarChart3, Award, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HistoryMission {
  id: string;
  title: string;
  client: {
    name: string;
    avatar?: string;
    rating: number;
  };
  route: {
    departure: string;
    arrival: string;
    distance: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    plate: string;
  };
  dates: {
    completed: string;
    duration: string;
    startDate: string;
  };
  financial: {
    price: number;
    expenses: number;
    netRevenue: number;
  };
  status: 'completed' | 'cancelled' | 'disputed';
  rating?: number;
  review?: string;
  urgency: 'standard' | 'urgent' | 'flexible';
  category: 'luxury' | 'standard' | 'commercial' | 'urgent';
}

const MissionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missions, setMissions] = useState<HistoryMission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<HistoryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const userType = user?.user_metadata?.user_type || "convoyeur";
  const isConvoyeur = userType === "convoyeur";

  useEffect(() => {
    if (!isConvoyeur) {
      navigate("/marketplace");
      return;
    }
    fetchMissionHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [missions, searchTerm, statusFilter, periodFilter, sortBy]);

  const fetchMissionHistory = async () => {
    try {
      // Mock des missions historiques
      const mockMissions: HistoryMission[] = [
        {
          id: "1",
          title: "Transport BMW X5 - Paris vers Monaco",
          client: {
            name: "Premium Cars SARL",
            rating: 4.9
          },
          route: {
            departure: "Paris",
            arrival: "Monaco", 
            distance: "945 km"
          },
          vehicle: {
            brand: "BMW",
            model: "X5 xDrive30d",
            year: 2023,
            plate: "AB-123-CD"
          },
          dates: {
            completed: "2025-09-10T18:30:00Z",
            duration: "9h 15min",
            startDate: "2025-09-10T08:00:00Z"
          },
          financial: {
            price: 1200,
            expenses: 145,
            netRevenue: 1055
          },
          status: "completed",
          rating: 5,
          review: "Excellent convoyeur ! Très professionnel et ponctuel. Le véhicule est arrivé en parfait état.",
          urgency: "standard",
          category: "luxury"
        },
        {
          id: "2",
          title: "Transport Mercedes Classe S - Lyon vers Genève", 
          client: {
            name: "AutoNeuf Distribution",
            rating: 4.7
          },
          route: {
            departure: "Lyon",
            arrival: "Genève",
            distance: "145 km"
          },
          vehicle: {
            brand: "Mercedes",
            model: "Classe S 350d",
            year: 2022,
            plate: "CD-456-EF"
          },
          dates: {
            completed: "2025-09-05T17:45:00Z",
            duration: "3h 30min", 
            startDate: "2025-09-05T14:00:00Z"
          },
          financial: {
            price: 800,
            expenses: 65,
            netRevenue: 735
          },
          status: "completed",
          rating: 5,
          review: "Parfait comme toujours ! Notre convoyeur de confiance.",
          urgency: "standard",
          category: "luxury"
        },
        {
          id: "3",
          title: "Transport Audi A6 - Marseille vers Nice",
          client: {
            name: "Société Martin",
            rating: 4.5
          },
          route: {
            departure: "Marseille", 
            arrival: "Nice",
            distance: "200 km"
          },
          vehicle: {
            brand: "Audi",
            model: "A6 45 TDI",
            year: 2021,
            plate: "EF-789-GH"
          },
          dates: {
            completed: "2025-08-28T16:15:00Z",
            duration: "2h 50min",
            startDate: "2025-08-28T13:30:00Z"
          },
          financial: {
            price: 450,
            expenses: 35,
            netRevenue: 415
          },
          status: "completed",
          rating: 4,
          review: "Bon service. Légère amélioration possible sur la communication.",
          urgency: "standard", 
          category: "standard"
        },
        {
          id: "4",
          title: "Transport Renault Trafic - Toulouse vers Barcelona",
          client: {
            name: "FleetManager Pro",
            rating: 4.8
          },
          route: {
            departure: "Toulouse",
            arrival: "Barcelona",
            distance: "390 km"
          },
          vehicle: {
            brand: "Renault",
            model: "Trafic L2H1",
            year: 2020,
            plate: "GH-012-IJ"
          },
          dates: {
            completed: "2025-08-20T19:00:00Z",
            duration: "5h 45min",
            startDate: "2025-08-20T13:15:00Z"
          },
          financial: {
            price: 650,
            expenses: 85,
            netRevenue: 565
          },
          status: "completed",
          rating: 5,
          review: "Mission urgente parfaitement gérée. Excellent suivi.",
          urgency: "urgent",
          category: "commercial"
        },
        {
          id: "5",
          title: "Transport Ford Focus - Lille vers Paris",
          client: {
            name: "AutoLocation Nord",
            rating: 4.2
          },
          route: {
            departure: "Lille",
            arrival: "Paris",
            distance: "225 km"
          },
          vehicle: {
            brand: "Ford",
            model: "Focus SW",
            year: 2019,
            plate: "IJ-345-KL"
          },
          dates: {
            completed: "2025-08-15T14:30:00Z",
            duration: "3h 15min",
            startDate: "2025-08-15T11:15:00Z"
          },
          financial: {
            price: 320,
            expenses: 42,
            netRevenue: 278
          },
          status: "cancelled",
          urgency: "flexible",
          category: "standard"
        },
        {
          id: "6",
          title: "Transport Porsche 911 - Nice vers Monaco",
          client: {
            name: "Luxury Cars Côte d'Azur",
            rating: 4.9
          },
          route: {
            departure: "Nice", 
            arrival: "Monaco",
            distance: "25 km"
          },
          vehicle: {
            brand: "Porsche",
            model: "911 Carrera S",
            year: 2024,
            plate: "KL-678-MN"
          },
          dates: {
            completed: "2025-07-30T17:00:00Z",
            duration: "45min",
            startDate: "2025-07-30T16:15:00Z"
          },
          financial: {
            price: 180,
            expenses: 15,
            netRevenue: 165
          },
          status: "completed",
          rating: 5,
          review: "Mission prestige parfaitement exécutée. Véhicule traité avec le plus grand soin.",
          urgency: "standard",
          category: "luxury"
        }
      ];

      setMissions(mockMissions);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...missions];

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(mission => 
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.route.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.route.arrival.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(mission => mission.status === statusFilter);
    }

    // Filtre par période
    if (periodFilter !== "all") {
      const now = new Date();
      
      switch (periodFilter) {
        case "week":
          filtered = filtered.filter(mission => {
            const missionDate = new Date(mission.dates.completed);
            return (now.getTime() - missionDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          });
          break;
        case "month":
          filtered = filtered.filter(mission => {
            const date = new Date(mission.dates.completed);
            return (now.getTime() - date.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          });
          break;
        case "quarter":
          filtered = filtered.filter(mission => {
            const date = new Date(mission.dates.completed);
            return (now.getTime() - date.getTime()) <= 90 * 24 * 60 * 60 * 1000;
          });
          break;
      }
    }

    // Tri
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.dates.completed).getTime() - new Date(a.dates.completed).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.dates.completed).getTime() - new Date(b.dates.completed).getTime());
        break;
      case "price_desc":
        filtered.sort((a, b) => b.financial.price - a.financial.price);
        break;
      case "price_asc":
        filtered.sort((a, b) => a.financial.price - b.financial.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredMissions(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      cancelled: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      disputed: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
    };

    const labels = {
      completed: "Terminée",
      cancelled: "Annulée",
      disputed: "Litigieuse"
    };

    const icons = {
      completed: CheckCircle,
      cancelled: XCircle,
      disputed: History
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      luxury: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      standard: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
      commercial: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
      urgent: "bg-gradient-to-r from-red-500 to-orange-500 text-white"
    };

    const labels = {
      luxury: "Luxe",
      standard: "Standard",
      commercial: "Commercial",
      urgent: "Urgent"
    };

    return (
      <Badge variant="outline" className={`${styles[category as keyof typeof styles]} border-0`}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateStats = () => {
    const completedMissions = missions.filter(m => m.status === 'completed');
    const totalRevenue = completedMissions.reduce((sum, m) => sum + m.financial.netRevenue, 0);
    const avgRating = completedMissions.reduce((sum, m) => sum + (m.rating || 0), 0) / Math.max(completedMissions.length, 1);
    const totalDistance = completedMissions.reduce((sum, m) => sum + parseInt(m.route.distance), 0);

    return {
      totalMissions: missions.length,
      completedMissions: completedMissions.length,
      totalRevenue,
      avgRating: Math.round(avgRating * 10) / 10,
      totalDistance
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/10 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-white/10 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-16 bg-white/10 rounded-2xl"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/marketplace")}
              className="glass-card text-foreground border-border hover:bg-accent/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                Historique des Missions
              </h1>
              <p className="text-white/70 mt-2">Consultez vos missions passées et vos performances</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <History className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{stats.totalMissions}</p>
              <p className="text-white/70 text-sm">Missions totales</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{stats.completedMissions}</p>
              <p className="text-white/70 text-sm">Terminées</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Euro className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()}€</p>
              <p className="text-white/70 text-sm">Revenus nets</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
              <p className="text-white/70 text-sm">Note moyenne</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par mission, client, ville, véhicule..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                  <SelectItem value="disputed">Litigieuses</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute période</SelectItem>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                  <SelectItem value="quarter">3 derniers mois</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="rating">Note décroissante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="space-y-4">
          {filteredMissions.length === 0 ? (
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardContent className="text-center py-16">
                <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? "Aucune mission trouvée" : "Aucun historique"}
                </h3>
                <p className="text-white/70">
                  {searchTerm 
                    ? "Essayez avec d'autres termes de recherche ou ajustez les filtres"
                    : "Vos missions terminées apparaîtront ici"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMissions.map((mission) => (
              <Card key={mission.id} className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
                        {getStatusBadge(mission.status)}
                        {getCategoryBadge(mission.category)}
                      </div>
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {mission.client.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {mission.vehicle.brand} {mission.vehicle.model}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(mission.dates.completed).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-300">{mission.financial.price}€</p>
                      <p className="text-green-300 text-sm">Net: {mission.financial.netRevenue}€</p>
                      {mission.rating && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {renderStars(mission.rating)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">
                        {mission.route.departure} → {mission.route.arrival}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 text-sm">{mission.route.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80 text-sm">Durée: {mission.dates.duration}</span>
                    </div>
                  </div>

                  {mission.review && mission.status === 'completed' && (
                    <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-white">Évaluation client</span>
                      </div>
                      <p className="text-white/80 text-sm">{mission.review}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-600/40">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Prix:</span>
                        <span className="text-white ml-2">{mission.financial.price}€</span>
                      </div>
                      <div>
                        <span className="text-white/70">Frais:</span>
                        <span className="text-white ml-2">{mission.financial.expenses}€</span>
                      </div>
                      <div>
                        <span className="text-white/70">Net:</span>
                        <span className="text-green-300 ml-2 font-medium">{mission.financial.netRevenue}€</span>
                      </div>
                      <div>
                        <span className="text-white/70">Plaque:</span>
                        <span className="text-white ml-2 font-mono">{mission.vehicle.plate}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                      <Button
                        variant="outline"
                        size="sm" 
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Rapport
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination ou affichage du nombre de résultats */}
        {filteredMissions.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-white/70">
              {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''} 
              {searchTerm || statusFilter !== 'all' || periodFilter !== 'all' ? ' trouvée' : ''}
              {filteredMissions.length > 1 && (searchTerm || statusFilter !== 'all' || periodFilter !== 'all') ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionHistory;
