import { useState, useEffect, useMemo } from "react";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import SearchBar from "../components/marketplace/SearchBar";
import MissionCard from "@/components/marketplace/MissionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, TrendingUp, Users, Star, Sparkles, Zap, Globe, Award } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMarketplaceMissions, insertDevis } from "@/lib/adapters/marketplace";

const Marketplace = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMissions: 5,
    assignedMissions: 0,
    convoyeurs: 156,
    averageRating: 4.9
  });
  const { user } = useAuth();

  const userType = user?.user_metadata?.user_type || "convoyeur";

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    const { missions, error } = await fetchMarketplaceMissions();
    if (error) console.warn('fetchMarketplaceMissions error', error?.message || error);
    // Mapper vers le format MissionCard attendu
    const mapped = (missions || []).map(m => ({
      id: m.id,
      departure: m.ville_depart,
      arrival: m.ville_arrivee,
      departureDate: new Date(m.date_depart).toLocaleDateString('fr-FR'),
      arrivalDate: new Date(m.date_depart).toLocaleDateString('fr-FR'),
      distance: '', // optionnel, non fourni par le schéma
      duration: '', // optionnel
      price: m.prix_propose ?? 0,
      vehicle: m.vehicule_requis ?? 'Véhicule',
      company: 'FleetMarket',
      rating: 4.8,
      isUrgent: false,
      status: 'available' as const,
      title: m.titre,
      description: m.description ?? undefined,
    }));
    setMissions(mapped);
    setStats(prev => ({ ...prev, totalMissions: mapped.length }));
    setLoading(false);
  };

  const handleSendDevis = async (mission: any) => {
    if (!user) {
      console.warn('Envoi devis refusé: utilisateur non connecté');
      toast.error('Veuillez vous connecter pour envoyer un devis.');
      return;
    }
    const convoyeurId = user.id;
    try {
      const p = insertDevis({
        mission_id: mission.id,
        convoyeur_id: convoyeurId,
        prix_propose: mission.prix_propose ?? mission.price ?? 0,
        message: mission.description ?? undefined,
      }).then(res => {
        if (res.error) throw new Error(res.error.message || 'Erreur lors de l\'envoi du devis');
        return res;
      });

      await toast.promise(p, {
        loading: 'Envoi du devis…',
        success: 'Devis envoyé avec succès !',
        error: 'Échec de l\'envoi du devis.'
      });

      // Feedback local léger: on peut marquer la carte comme "reserved"
      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, status: 'reserved' } : m));
    } catch (e: any) {
      console.error('Erreur envoi devis:', e?.message || e);
    }
  };

  const availableMissions = missions.filter(m => m.status === "available");

  return (
    <div className="min-h-screen bg-gray-900">
      <MarketplaceHeader />
      <SearchBar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-teal-200 bg-clip-text text-transparent mb-2">
                Missions disponibles
              </h2>
              <p className="text-gray-300">Découvrez les opportunités qui vous correspondent</p>
            </div>
            <Badge variant="secondary" className="text-sm bg-gray-700/50 backdrop-blur-lg text-gray-200 border border-gray-600/50 shadow-lg">
              {loading ? "Chargement..." : `${availableMissions.length} disponibles`}
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/10 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {missions.map((mission) => (
                <div key={mission.id} className="transition-all duration-500">
                  <MissionCard 
                    {...mission} 
                    onSendDevis={userType === "convoyeur" ? handleSendDevis : undefined}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && missions.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-16">
                <MapPin className="w-24 h-24 mx-auto opacity-50 text-gray-500 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-6">Aucune mission trouvée</h3>
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Créer une alerte
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
