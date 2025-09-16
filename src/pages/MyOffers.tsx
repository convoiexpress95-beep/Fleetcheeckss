import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Clock, CheckCircle, XCircle, Eye, MessageCircle,
  MapPin, Calendar, Euro, Car, TrendingUp, AlertCircle,
  Filter, Search, ArrowLeft, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface Offer {
  id: string;
  missionId: string;
  missionTitle: string;
  client: string;
  departure: string;
  arrival: string;
  departureDate: string;
  offeredPrice: number;
  maxPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  submittedAt: string;
  respondedAt?: string;
  message: string;
  clientResponse?: string;
  urgency: 'standard' | 'urgent' | 'flexible';
}

const MyOffers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const userType = user?.user_metadata?.user_type || "convoyeur";

  useEffect(() => {
    if (userType !== "convoyeur") {
      navigate("/marketplace");
      return;
    }
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      // Mock data des offres
      const mockOffers: Offer[] = [
        {
          id: "1",
          missionId: "m1",
          missionTitle: "Transport BMW X5 - Paris vers Monaco",
          client: "Premium Cars",
          departure: "Paris",
          arrival: "Monaco",
          departureDate: "2025-09-20",
          offeredPrice: 1100,
          maxPrice: 1500,
          status: "pending",
          submittedAt: "2025-09-15T10:30:00Z",
          message: "Bonjour, j'ai 8 ans d'expérience en convoyage de véhicules de luxe. Je peux assurer ce transport en toute sécurité.",
          urgency: "standard"
        },
        {
          id: "2", 
          missionId: "m2",
          missionTitle: "Transport Renault Clio - Marseille vers Nice",
          client: "AutoTransport",
          departure: "Marseille", 
          arrival: "Nice",
          departureDate: "2025-09-16",
          offeredPrice: 400,
          maxPrice: 450,
          status: "accepted",
          submittedAt: "2025-09-14T15:45:00Z",
          respondedAt: "2025-09-14T18:20:00Z",
          message: "Mission urgente, je suis disponible immédiatement.",
          clientResponse: "Parfait, votre profil correspond exactement à nos attentes. Mission acceptée !",
          urgency: "urgent"
        },
        {
          id: "3",
          missionId: "m3", 
          missionTitle: "Transport Mercedes Classe S - Lyon vers Genève",
          client: "Luxury Convoyage",
          departure: "Lyon",
          arrival: "Genève", 
          departureDate: "2025-09-12",
          offeredPrice: 800,
          maxPrice: 900,
          status: "rejected",
          submittedAt: "2025-09-10T09:15:00Z",
          respondedAt: "2025-09-11T14:30:00Z", 
          message: "Expérience internationale, passeport valide pour la Suisse.",
          clientResponse: "Merci pour votre candidature. Nous avons choisi un autre convoyeur avec plus d'expérience internationale.",
          urgency: "standard"
        },
        {
          id: "4",
          missionId: "m4",
          missionTitle: "Transport Ford Focus - Toulouse vers Bordeaux", 
          client: "Regional Transport",
          departure: "Toulouse",
          arrival: "Bordeaux",
          departureDate: "2025-09-08",
          offeredPrice: 250,
          maxPrice: 300,
          status: "expired",
          submittedAt: "2025-09-05T16:00:00Z",
          message: "Disponible pour cette mission, trajets régionaux habituels.",
          urgency: "flexible"
        }
      ];

      setOffers(mockOffers);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
      accepted: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      rejected: "bg-gradient-to-r from-red-500 to-pink-500 text-white", 
      expired: "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
    };

    const icons = {
      pending: Clock,
      accepted: CheckCircle,
      rejected: XCircle,
      expired: AlertCircle
    };

    const labels = {
      pending: "En attente",
      accepted: "Acceptée",
      rejected: "Refusée", 
      expired: "Expirée"
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      urgent: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
      standard: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
      flexible: "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
    };

    const labels = {
      urgent: "Urgent",
      standard: "Standard", 
      flexible: "Flexible"
    };

    return (
      <Badge variant="outline" className={`${styles[urgency as keyof typeof styles]} border-0`}>
        {labels[urgency as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.missionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.arrival.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "all" || offer.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getTabCounts = () => {
    return {
      all: offers.length,
      pending: offers.filter(o => o.status === "pending").length,
      accepted: offers.filter(o => o.status === "accepted").length,
      rejected: offers.filter(o => o.status === "rejected").length
    };
  };

  const counts = getTabCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/10 rounded-2xl"></div>
            <div className="h-16 bg-white/10 rounded-2xl"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
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
                Mes Offres
              </h1>
              <p className="text-white/70 mt-2">Suivez l'état de vos candidatures</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
              <FileText className="w-4 h-4 mr-1" />
              {offers.length} offres totales
            </Badge>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{counts.pending}</p>
              <p className="text-white/70 text-sm">En attente</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{counts.accepted}</p>
              <p className="text-white/70 text-sm">Acceptées</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{counts.rejected}</p>
              <p className="text-white/70 text-sm">Refusées</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">
                {Math.round((counts.accepted / Math.max(counts.all - offers.filter(o => o.status === "expired").length, 1)) * 100)}%
              </p>
              <p className="text-white/70 text-sm">Taux de réussite</p>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par mission, client, ville..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtres par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
              Toutes ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500">
              En attente ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500">
              Acceptées ({counts.accepted})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500">
              Refusées ({counts.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredOffers.length === 0 ? (
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                <CardContent className="text-center py-16">
                  <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? "Aucune offre trouvée" : "Aucune offre dans cette catégorie"}
                  </h3>
                  <p className="text-white/70">
                    {searchTerm 
                      ? "Essayez avec d'autres termes de recherche"
                      : "Consultez le marketplace pour découvrir de nouvelles missions"
                    }
                  </p>
                  <Button 
                    onClick={() => navigate("/marketplace")}
                    className="mt-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Découvrir le marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredOffers.map((offer) => (
                <Card key={offer.id} className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{offer.missionTitle}</h3>
                          {getStatusBadge(offer.status)}
                          {getUrgencyBadge(offer.urgency)}
                        </div>
                        <p className="text-white/70 text-sm">{offer.client}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-300">{offer.offeredPrice}€</p>
                        <p className="text-white/50 text-sm">Max: {offer.maxPrice}€</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span className="text-white/80 text-sm">{offer.departure} → {offer.arrival}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-white/80 text-sm">
                          {new Date(offer.departureDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80 text-sm">
                          Envoyée le {new Date(offer.submittedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                      <h4 className="text-white font-medium mb-2">Votre message :</h4>
                      <p className="text-white/80 text-sm">{offer.message}</p>
                    </div>

                    {offer.clientResponse && (
                      <div className={`rounded-lg p-4 mb-4 ${
                        offer.status === 'accepted' 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
                          : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30'
                      }`}>
                        <h4 className="text-white font-medium mb-2">Réponse du client :</h4>
                        <p className="text-white/80 text-sm">{offer.clientResponse}</p>
                        {offer.respondedAt && (
                          <p className="text-white/50 text-xs mt-2">
                            Répondu le {new Date(offer.respondedAt).toLocaleDateString('fr-FR')} à {new Date(offer.respondedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Car className="w-4 h-4" />
                        Mission #{offer.missionId}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/marketplace/mission/${offer.missionId}`)}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir mission
                        </Button>
                        {offer.status === 'accepted' && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                            onClick={() => {/* TODO: Navigation vers messagerie */}}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Contacter
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

export default MyOffers;
