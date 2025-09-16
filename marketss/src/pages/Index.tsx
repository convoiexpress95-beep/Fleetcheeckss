import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MissionCard from "@/components/MissionCard";
import PublishMissionDialog from "@/components/PublishMissionDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, TrendingUp, Users, Star, Sparkles, Zap, Globe, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMissions: 0,
    assignedMissions: 0,
    convoyeurs: 156,
    averageRating: 4.9
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Récupérer le type d'utilisateur depuis les métadonnées
  const userType = user?.user_metadata?.user_type || 'convoyeur';

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_missions')
        .select('*')
        .eq('statut', 'ouverte')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedMissions = (data || []).map((mission: any) => ({
        id: mission.id,
        departure: mission.ville_depart,
        arrival: mission.ville_arrivee,
        departureDate: mission.date_depart ? new Date(mission.date_depart).toLocaleDateString('fr-FR') : 'Non spécifiée',
        arrivalDate: mission.date_depart ? new Date(mission.date_depart).toLocaleDateString('fr-FR') : 'Non spécifiée',
        distance: "-- km",
        duration: "-- min",
        price: mission.prix_propose || 0,
        vehicle: mission.vehicule_requis || 'Véhicule non spécifié',
        company: "FleetChecks",
        rating: 4.8,
        isUrgent: false,
        status: "available" as const,
        title: mission.titre,
        description: mission.description
      }));

      setMissions(formattedMissions);
      setStats(prev => ({
        ...prev,
        totalMissions: formattedMissions.length,
        assignedMissions: 0
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les missions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendDevis = (mission: any) => {
    toast({
      title: "Redirection vers les devis",
      description: `Consultez la page "Devis" pour gérer vos propositions de mission`,
    });
  };

  const availableMissions = missions.filter(m => m.status === "available");

  const handleCreateAlert = () => {
    toast({
      title: "Alerte créée !",
      description: "Vous serez notifié des nouvelles missions correspondant à vos critères.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      {/* Zone de recherche */}
      <SearchBar />
      
      {/* Hero Section Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glass"></div>
        <div className="container mx-auto px-6 py-16 relative">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-3 bg-card/10 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-glow" />
              <span className="text-sm font-medium text-foreground">Marketplace Premium</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
              FleetCheeckS MarketPlace
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La plateforme premium de mise en relation entre clients et convoyeurs professionnels. 
              Trouvez ou publiez des missions de transport de véhicules en toute sécurité.
            </p>
          </div>

          {/* Stats Cards Premium */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stats.totalMissions}</div>
                <p className="text-sm text-muted-foreground">Missions disponibles</p>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none" style={{ animationDelay: '0.5s' }}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-accent mb-2">{stats.assignedMissions}</div>
                <p className="text-sm text-muted-foreground">Missions assignées</p>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none" style={{ animationDelay: '1s' }}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-success mb-2">{stats.convoyeurs}</div>
                <p className="text-sm text-muted-foreground">Convoyeurs vérifiés</p>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none" style={{ animationDelay: '1.5s' }}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stats.averageRating}</div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-glow transition-all duration-500 group-hover:scale-110">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Ultra Rapide</h3>
              <p className="text-muted-foreground">Mise en relation instantanée avec nos algorithmes avancés</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-glow transition-all duration-500 group-hover:scale-110">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">National</h3>
              <p className="text-muted-foreground">Réseau étendu dans toute la France pour vos missions</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-glow transition-all duration-500 group-hover:scale-110">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Premium</h3>
              <p className="text-muted-foreground">Service haut de gamme avec garanties et assurances</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8">
        {/* Liste des missions */}
        <div className="space-y-6 animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                Missions disponibles
              </h2>
              <p className="text-muted-foreground">Découvrez les opportunités qui vous correspondent</p>
            </div>
            <Badge variant="secondary" className="text-sm bg-gradient-premium text-white border-0 shadow-premium hover:shadow-glow transition-all duration-300">
              {loading ? 'Chargement...' : `${availableMissions.length} disponibles`}
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse backdrop-blur-sm border border-border/20"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {missions.map((mission, index) => (
                <div 
                  key={mission.id} 
                  className="animate-fade-in hover:scale-[1.02] transition-all duration-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MissionCard 
                    {...mission} 
                    onSendDevis={userType === 'convoyeur' ? handleSendDevis : undefined}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Message si aucune mission */}
          {!loading && missions.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl shadow-premium p-16">
                <div className="text-muted-foreground mb-8">
                  <MapPin className="w-24 h-24 mx-auto opacity-50 animate-float" />
                </div>
                <h3 className="text-3xl font-display font-semibold text-foreground mb-6">
                  Aucune mission trouvée
                </h3>
                <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto leading-relaxed">
                  Modifiez vos critères de recherche ou créez une alerte pour être notifié des nouvelles opportunités
                </p>
                <div className="space-y-4">
                  <PublishMissionDialog />
                  <Button 
                    onClick={handleCreateAlert}
                    variant="outline" 
                    className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-premium transition-all duration-300"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Créer une alerte
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;