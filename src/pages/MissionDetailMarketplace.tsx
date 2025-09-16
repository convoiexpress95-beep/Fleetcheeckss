import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, MapPin, Clock, Euro, Car, User, Star, 
  Phone, Mail, Calendar, Route, AlertTriangle, 
  CheckCircle, Send, MessageCircle, Shield, Award 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MissionDetailMarketplace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const userType = user?.user_metadata?.user_type || "convoyeur";
  const isConvoyeur = userType === "convoyeur";

  useEffect(() => {
    fetchMissionDetail();
  }, [id]);

  const fetchMissionDetail = async () => {
    try {
      // Mock mission détaillée
      const mockMission = {
        id: id,
        title: "Transport BMW X5 - Paris vers Monaco",
        departure: "Paris 15ème",
        departureAddress: "123 Rue de Vaugirard, 75015 Paris",
        arrival: "Monaco-Ville",
        arrivalAddress: "Casino de Monte-Carlo, Monaco",
        departureDate: "2025-09-20",
        departureTime: "08:00",
        arrivalDate: "2025-09-20", 
        arrivalTime: "18:00",
        flexibleTiming: false,
        distance: "945 km",
        duration: "9h 30min",
        suggestedPrice: 1200,
        maxPrice: 1500,
        vehicle: {
          brand: "BMW",
          model: "X5 xDrive30d",
          year: 2023,
          color: "Noir métallisé",
          plate: "AB-123-CD",
          fuelType: "Diesel",
          transmission: "Automatique"
        },
        client: {
          name: "Société Premium Cars",
          rating: 4.8,
          completedMissions: 156,
          memberSince: "2020",
          verified: true,
          phone: "+33 1 23 45 67 89",
          email: "contact@premiumcars.fr"
        },
        requirements: [
          "Permis de conduire valide depuis plus de 5 ans",
          "Expérience véhicules de luxe souhaitée", 
          "Disponible pour départ matinal",
          "Non-fumeur obligatoire"
        ],
        description: "Transport d'un BMW X5 neuf de notre concession parisienne vers Monaco. Véhicule haut de gamme nécessitant une conduite soignée. Client VIP, prestation premium attendue.",
        insurance: "Assurance tous risques incluse",
        fuelCoverage: "Carburant pris en charge par le client",
        tolls: "Péages remboursés sur justificatifs",
        urgency: "standard", // standard, urgent, flexible
        status: "open", // open, assigned, in_progress, completed
        applications: 8,
        createdAt: "2025-09-15",
        deadline: "2025-09-18"
      };

      setMission(mockMission);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerPrice || !offerMessage) return;
    
    setSubmitting(true);
    try {
      // Simulation envoi d'offre
      console.log("Envoi offre:", {
        missionId: id,
        price: offerPrice,
        message: offerMessage
      });
      
      // Simulation succès
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Votre offre a été envoyée avec succès !");
      setOfferPrice("");
      setOfferMessage("");
    } catch (error) {
      console.error("Erreur envoi offre:", error);
      alert("Erreur lors de l'envoi de l'offre");
    } finally {
      setSubmitting(false);
    }
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
      <Badge className={styles[urgency as keyof typeof styles] || styles.standard}>
        {labels[urgency as keyof typeof labels] || "Standard"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-800/50 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-800/50 rounded-2xl"></div>
                <div className="h-64 bg-gray-800/50 rounded-2xl"></div>
              </div>
              <div className="h-80 bg-gray-800/50 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Mission non trouvée</h2>
          <Button onClick={() => navigate("/marketplace")} className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white">
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
            onClick={() => navigate("/marketplace")}
            className="bg-gray-800/50 text-gray-200 border-gray-700/50 hover:bg-gray-700/60 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-teal-200 bg-clip-text text-transparent">
              Détail de la Mission
            </h1>
            {getUrgencyBadge(mission.urgency)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <Car className="w-8 h-8 text-cyan-400" />
                  {mission.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Itinéraire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-400" />
                      Départ
                    </h3>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <p className="text-white font-medium">{mission.departure}</p>
                      <p className="text-white/70 text-sm">{mission.departureAddress}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(mission.departureDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {mission.departureTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-400" />
                      Arrivée
                    </h3>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <p className="text-white font-medium">{mission.arrival}</p>
                      <p className="text-white/70 text-sm">{mission.arrivalAddress}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(mission.arrivalDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {mission.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distance et durée */}
                <div className="flex items-center justify-around bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-lg p-4">
                  <div className="text-center">
                    <Route className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{mission.distance}</p>
                    <p className="text-white/70 text-sm">Distance</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{mission.duration}</p>
                    <p className="text-white/70 text-sm">Durée estimée</p>
                  </div>
                  <div className="text-center">
                    <Euro className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-300">{mission.suggestedPrice}€</p>
                    <p className="text-white/70 text-sm">Prix suggéré</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Véhicule */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Car className="w-6 h-6 text-cyan-400" />
                  Véhicule à convoyer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-white/70 text-sm">Marque</p>
                    <p className="text-white font-medium">{mission.vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Modèle</p>
                    <p className="text-white font-medium">{mission.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Année</p>
                    <p className="text-white font-medium">{mission.vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Couleur</p>
                    <p className="text-white font-medium">{mission.vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Immatriculation</p>
                    <p className="text-white font-medium">{mission.vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Carburant</p>
                    <p className="text-white font-medium">{mission.vehicle.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Transmission</p>
                    <p className="text-white font-medium">{mission.vehicle.transmission}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description et exigences */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Description de la mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 leading-relaxed">{mission.description}</p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Exigences</h4>
                  <ul className="space-y-2">
                    {mission.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <Shield className="w-5 h-5 text-cyan-400 mb-2" />
                    <p className="text-white/80 text-sm">{mission.insurance}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <Euro className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-white/80 text-sm">{mission.fuelCoverage}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <Route className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-white/80 text-sm">{mission.tolls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations client */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <User className="w-6 h-6 text-cyan-400" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-white">{mission.client.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">{mission.client.rating}</span>
                    <span className="text-white/70">({mission.client.completedMissions} missions)</span>
                  </div>
                  {mission.client.verified && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white mt-2">
                      <Award className="w-3 h-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-white/70 text-sm">Membre depuis {mission.client.memberSince}</p>
                  <div className="space-y-2">
                    <a 
                      href={`tel:${mission.client.phone}`} 
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{mission.client.phone}</span>
                    </a>
                    <a 
                      href={`mailto:${mission.client.email}`}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{mission.client.email}</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques de la mission */}
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Candidatures</span>
                  <span className="text-white font-bold">{mission.applications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Publié le</span>
                  <span className="text-white">{new Date(mission.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Date limite</span>
                  <span className="text-white">{new Date(mission.deadline).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Prix maximum</span>
                  <span className="text-green-300 font-bold">{mission.maxPrice}€</span>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire d'offre pour convoyeurs */}
            {isConvoyeur && mission.status === 'open' && (
              <Card className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-lg border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Send className="w-6 h-6 text-cyan-400" />
                    Faire une offre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Prix proposé (€)</Label>
                    <Input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder={`Max ${mission.maxPrice}€`}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      max={mission.maxPrice}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Message au client</Label>
                    <Textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Présentez-vous et expliquez pourquoi vous êtes le bon candidat..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-24"
                    />
                  </div>
                  
                  <Button
                    onClick={handleSubmitOffer}
                    disabled={!offerPrice || !offerMessage || submitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer l'offre
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => {/* TODO: Implémenter message direct */}}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contacter le client
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Message pour clients */}
            {!isConvoyeur && (
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50">
                <CardContent className="text-center py-6">
                  <User className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-white/80">
                    Vous consultez cette mission en tant que client.
                    Les convoyeurs peuvent vous contacter via cette plateforme.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionDetailMarketplace;
