import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Calendar, Clock, Car, Euro, User, Phone, 
  MessageCircle, Navigation, AlertTriangle, CheckCircle,
  ArrowLeft, Route, Fuel, Shield, Camera, FileText,
  TrendingUp, Play, Pause, Square, RefreshCw, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMission, useUpdateMission } from "@/hooks/useMissions";
import { useToast } from "@/hooks";

interface ActiveMission {
  id: string;
  title: string;
  client: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  departure: {
    address: string;
    city: string;
    coordinates?: [number, number];
  };
  arrival: {
    address: string;
    city: string;
    coordinates?: [number, number];
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
  };
  schedule: {
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    estimatedArrival: string;
  };
  financial: {
    agreedPrice: number;
    advancePayment: number;
    remainingPayment: number;
    expenses: number;
  };
  status: 'pending_start' | 'en_route' | 'delivered' | 'payment_pending';
  progress: number;
  currentLocation?: {
    city: string;
    coordinates: [number, number];
    lastUpdate: string;
  };
  documents: {
    pickupReport: boolean;
    deliveryReport: boolean;
    photos: number;
    signature: boolean;
  };
  urgency: 'standard' | 'urgent' | 'flexible';
  startedAt?: string;
  expectedDuration: string;
  actualDuration?: string;
  // Lien optionnel avec une mission réelle créée dans la table public.missions
  missionId?: string;
}

const ActiveMissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missions, setMissions] = useState<ActiveMission[]>([]);
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const { toast } = useToast();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const userType = user?.user_metadata?.user_type || "convoyeur";
  const isConvoyeur = userType === "convoyeur";

  useEffect(() => {
    if (!isConvoyeur) {
      navigate("/marketplace");
      return;
    }
    fetchActiveMissions();
  }, []);

  const fetchActiveMissions = async () => {
    try {
      // Mock des missions actives
      const mockMissions: ActiveMission[] = [
        {
          id: "1",
          title: "Transport BMW X5 - Paris vers Monaco",
          client: {
            name: "Premium Cars SARL",
            phone: "+33 1 23 45 67 89",
            email: "contact@premiumcars.fr"
          },
          departure: {
            address: "123 Rue de Vaugirard, 75015 Paris",
            city: "Paris",
            coordinates: [2.3522, 48.8566]
          },
          arrival: {
            address: "Casino de Monte-Carlo, Monaco",
            city: "Monaco",
            coordinates: [7.4267, 43.7396]
          },
          vehicle: {
            brand: "BMW",
            model: "X5 xDrive30d",
            year: 2023,
            color: "Noir métallisé",
            plate: "AB-123-CD"
          },
          schedule: {
            departureDate: "2025-09-20",
            departureTime: "08:00",
            arrivalDate: "2025-09-20", 
            arrivalTime: "18:00",
            estimatedArrival: "2025-09-20T18:30:00Z"
          },
          financial: {
            agreedPrice: 1200,
            advancePayment: 600,
            remainingPayment: 600,
            expenses: 145
          },
          status: "en_route",
          progress: 65,
          currentLocation: {
            city: "Valence",
            coordinates: [4.8918, 44.9336],
            lastUpdate: "2025-09-20T14:30:00Z"
          },
          documents: {
            pickupReport: true,
            deliveryReport: false,
            photos: 8,
            signature: false
          },
          urgency: "standard",
          startedAt: "2025-09-20T08:15:00Z",
          expectedDuration: "9h 30min",
          actualDuration: "6h 15min"
        },
        {
          id: "2", 
          title: "Transport Mercedes Classe A - Lyon vers Genève",
          client: {
            name: "AutoNeuf Distribution",
            phone: "+33 4 78 90 12 34",
            email: "livraisons@autoneuf.com"
          },
          departure: {
            address: "45 Avenue Tony Garnier, 69007 Lyon",
            city: "Lyon"
          },
          arrival: {
            address: "Route de Meyrin, 1202 Genève",
            city: "Genève"
          },
          vehicle: {
            brand: "Mercedes",
            model: "Classe A 180",
            year: 2024,
            color: "Blanc polaire",
            plate: "CD-456-EF"
          },
          schedule: {
            departureDate: "2025-09-21",
            departureTime: "07:00",
            arrivalDate: "2025-09-21",
            arrivalTime: "10:00", 
            estimatedArrival: "2025-09-21T10:00:00Z"
          },
          financial: {
            agreedPrice: 450,
            advancePayment: 0,
            remainingPayment: 450,
            expenses: 0
          },
          status: "pending_start",
          progress: 0,
          documents: {
            pickupReport: false,
            deliveryReport: false,
            photos: 0,
            signature: false
          },
          urgency: "urgent",
          expectedDuration: "3h 00min"
        },
        {
          id: "3",
          title: "Transport Audi Q7 - Marseille vers Nice", 
          client: {
            name: "Société Martin",
            phone: "+33 4 91 23 45 67",
            email: "transport@martin-sa.com"
          },
          departure: {
            address: "Port de la Joliette, 13002 Marseille", 
            city: "Marseille"
          },
          arrival: {
            address: "Aéroport Nice Côte d'Azur, 06206 Nice",
            city: "Nice"
          },
          vehicle: {
            brand: "Audi",
            model: "Q7 45 TDI",
            year: 2022,
            color: "Gris Daytona",
            plate: "EF-789-GH"
          },
          schedule: {
            departureDate: "2025-09-19",
            departureTime: "14:00",
            arrivalDate: "2025-09-19",
            arrivalTime: "17:00",
            estimatedArrival: "2025-09-19T17:00:00Z"
          },
          financial: {
            agreedPrice: 380,
            advancePayment: 380,
            remainingPayment: 0,
            expenses: 45
          },
          status: "delivered",
          progress: 100,
          documents: {
            pickupReport: true,
            deliveryReport: true,
            photos: 12,
            signature: true
          },
          urgency: "standard",
          startedAt: "2025-09-19T14:10:00Z",
          expectedDuration: "3h 00min",
          actualDuration: "2h 50min"
        }
      ];

      setMissions(mockMissions);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_start: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
      en_route: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
      delivered: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      payment_pending: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    };

    const labels = {
      pending_start: "À démarrer",
      en_route: "En route",
      delivered: "Livrée",
      payment_pending: "En attente paiement"
    };

    const icons = {
      pending_start: Play,
      en_route: Navigation,
      delivered: CheckCircle,
      payment_pending: Euro
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
      standard: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
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

  const filteredMissions = missions.filter(mission => {
    if (activeTab === "all") return true;
    return mission.status === activeTab;
  });

  const getTabCounts = () => {
    return {
      all: missions.length,
      pending_start: missions.filter(m => m.status === "pending_start").length,
      en_route: missions.filter(m => m.status === "en_route").length,
      delivered: missions.filter(m => m.status === "delivered").length
    };
  };

  const counts = getTabCounts();

  const handleStartMission = async (localId: string) => {
    try {
      setStartingId(localId);
      const m = missions.find(x => x.id === localId);
      if (!m) return;
      if (!user?.id) {
        toast({ title: "Non connecté", description: "Veuillez vous connecter pour démarrer.", variant: "destructive" });
        return;
      }
      // Si déjà liée à une mission, on saute la création
      let createdId = m.missionId;
      if (!createdId) {
        const payload: any = {
          title: m.title,
          pickup_address: `${m.departure.address} (${m.departure.city})`,
          delivery_address: `${m.arrival.address} (${m.arrival.city})`,
          pickup_date: new Date(`${m.schedule.departureDate}T${m.schedule.departureTime}`).toISOString(),
          delivery_date: new Date(`${m.schedule.arrivalDate}T${m.schedule.arrivalTime}`).toISOString(),
          license_plate: m.vehicle.plate,
          vehicle_brand: m.vehicle.brand,
          vehicle_model_name: m.vehicle.model,
          vehicle_body_type: 'autre',
          donor_earning: m.financial.agreedPrice,
          driver_earning: Math.max(0, m.financial.agreedPrice - (m.financial.expenses || 0)),
          driver_id: user.id,
          description: `Mission générée depuis Missions Actives (${m.urgency})`
        };
        const created = await createMission.mutateAsync(payload);
        createdId = created?.id as string;
      }
      // Met à jour le statut côté DB
      if (createdId) {
        updateMission.mutate({ id: createdId, updates: { status: 'in_progress', driver_id: user.id } });
      }
      // Met à jour l'état local
      setMissions(prev => prev.map(m => m.id === localId ? {
        ...m,
        missionId: createdId,
        status: "en_route" as const,
        startedAt: new Date().toISOString(),
        progress: Math.max(m.progress, 5)
      } : m));
    } catch (e: any) {
      const msg = (e?.message || String(e)) as string;
      const isCredit = /crédit|credit|consume_credit|insuffisant/i.test(msg);
      toast({
        title: isCredit ? "Crédits insuffisants" : "Impossible de démarrer",
        description: isCredit ? "Rechargez vos crédits pour créer et démarrer une mission." : msg,
        variant: "destructive"
      });
    }
    finally {
      setStartingId(null);
    }
  };

  const handleCompleteMission = (localId: string) => {
    const m = missions.find(x => x.id === localId);
    if (m?.missionId) {
      updateMission.mutate({ id: m.missionId, updates: { status: 'completed' } });
    } else {
      toast({ title: "Mission non liée", description: "Aucune mission synchronisée à clôturer.", variant: "destructive" });
    }
    setMissions(prev => prev.map(x => x.id === localId ? { ...x, status: 'delivered' as const, progress: 100 } : x));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/10 rounded-2xl"></div>
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
                Missions Actives
              </h1>
              <p className="text-white/70 mt-2">Suivez vos missions en cours</p>
            </div>
          </div>
          <Button 
            onClick={() => fetchActiveMissions()}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Play className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{counts.pending_start}</p>
              <p className="text-white/70 text-sm">À démarrer</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Navigation className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{counts.en_route}</p>
              <p className="text-white/70 text-sm">En route</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{counts.delivered}</p>
              <p className="text-white/70 text-sm">Livrées</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">
                {Math.round((counts.delivered / Math.max(counts.all, 1)) * 100)}%
              </p>
              <p className="text-white/70 text-sm">Taux de réussite</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
              Toutes ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending_start" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500">
              À démarrer ({counts.pending_start})
            </TabsTrigger>
            <TabsTrigger value="en_route" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
              En route ({counts.en_route})
            </TabsTrigger>
            <TabsTrigger value="delivered" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500">
              Livrées ({counts.delivered})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {filteredMissions.length === 0 ? (
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                <CardContent className="text-center py-16">
                  <Navigation className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aucune mission dans cette catégorie
                  </h3>
                  <p className="text-white/70">
                    Consultez le marketplace pour découvrir de nouvelles missions
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
              filteredMissions.map((mission) => (
                <Card key={mission.id} className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:bg-white/15 transition-all">
                  <CardContent className="p-6">
                    {/* Header de la mission */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{mission.title}</h3>
                          {getStatusBadge(mission.status)}
                          {getUrgencyBadge(mission.urgency)}
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
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-300">{mission.financial.agreedPrice}€</p>
                        <p className="text-white/50 text-sm">
                          Avance: {mission.financial.advancePayment}€
                        </p>
                      </div>
                    </div>

                    {/* Progression */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">Progression</span>
                        <span className="text-cyan-300 font-bold">{mission.progress}%</span>
                      </div>
                      <Progress value={mission.progress} className="h-2 bg-white/10">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all" 
                          style={{ width: `${mission.progress}%` }}
                        />
                      </Progress>
                    </div>

                    {/* Itinéraire */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-white">Départ</span>
                        </div>
                        <p className="text-white/80 text-sm mb-1">{mission.departure.city}</p>
                        <p className="text-white/60 text-xs">{mission.departure.address}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                          <Calendar className="w-3 h-3" />
                          {new Date(`${mission.schedule.departureDate}T${mission.schedule.departureTime}`).toLocaleDateString('fr-FR')} à {mission.schedule.departureTime}
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-white">Arrivée</span>
                        </div>
                        <p className="text-white/80 text-sm mb-1">{mission.arrival.city}</p>
                        <p className="text-white/60 text-xs">{mission.arrival.address}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                          <Calendar className="w-3 h-3" />
                          {new Date(`${mission.schedule.arrivalDate}T${mission.schedule.arrivalTime}`).toLocaleDateString('fr-FR')} à {mission.schedule.arrivalTime}
                        </div>
                      </div>
                    </div>

                    {/* Position actuelle pour missions en cours */}
                    {mission.status === 'en_route' && mission.currentLocation && (
                      <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/30 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Navigation className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium text-white">Position actuelle</span>
                        </div>
                        <p className="text-white/80">{mission.currentLocation.city}</p>
                        <p className="text-white/60 text-xs">
                          Dernière mise à jour: {new Date(mission.currentLocation.lastUpdate).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    )}

                    {/* Informations véhicule et documents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Car className="w-4 h-4 text-purple-400" />
                          Véhicule
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Modèle:</span>
                            <span className="text-white">{mission.vehicle.brand} {mission.vehicle.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Année:</span>
                            <span className="text-white">{mission.vehicle.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Couleur:</span>
                            <span className="text-white">{mission.vehicle.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Plaque:</span>
                            <span className="text-white font-mono">{mission.vehicle.plate}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          Documents
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Rapport prise en charge:</span>
                            {mission.documents.pickupReport ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Rapport livraison:</span>
                            {mission.documents.deliveryReport ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Photos:</span>
                            <span className="text-white">{mission.documents.photos}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Signature client:</span>
                            {mission.documents.signature ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600/40">
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {mission.expectedDuration}
                          {mission.actualDuration && ` (${mission.actualDuration})`}
                        </span>
                        {mission.startedAt && (
                          <span className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            Démarré à {new Date(mission.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/10"
                          onClick={() => {/* TODO: Navigation vers messages */}}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contacter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {mission.client.phone.replace(/(\+33)\s?(\d)/, '$1 $2 ')}
                        </Button>
                        
                        {mission.status === 'pending_start' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartMission(mission.id)}
                            disabled={startingId === mission.id || createMission.isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {startingId === mission.id || createMission.isPending ? 'Démarrage…' : 'Démarrer'}
                          </Button>
                        )}
                        
                        {mission.status === 'en_route' && mission.progress >= 95 && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteMission(mission.id)}
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Terminer
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

export default ActiveMissions;
