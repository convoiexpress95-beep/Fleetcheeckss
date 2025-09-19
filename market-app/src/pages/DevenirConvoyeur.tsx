import { useState } from "react";
import Header from "@/components/Header";
import ConvoyeurProfileForm from "@/components/ConvoyeurProfileForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Star, 
  Shield, 
  CreditCard, 
  Clock, 
  MapPin, 
  Users, 
  Award,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Euro,
  Zap,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react";

const DevenirConvoyeur = () => {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAdvantagesDialog, setShowAdvantagesDialog] = useState(false);

  const handleStartNow = () => {
    setShowProfileForm(true);
  };

  const handleDiscoverAdvantages = () => {
    setShowAdvantagesDialog(true);
  };

  const stats = [
    {
      icon: Euro,
      value: '2,450€',
      label: 'Revenus moyens/mois',
      color: 'text-success'
    },
    {
      icon: Users,
      value: '500+',
      label: 'Convoyeurs actifs',
      color: 'text-primary'
    },
    {
      icon: Award,
      value: '4.9/5',
      label: 'Satisfaction client',
      color: 'text-accent'
    },
    {
      icon: MapPin,
      value: '95%',
      label: 'Missions réussies',
      color: 'text-warning'
    }
  ];

  const benefits = [
    {
      icon: CreditCard,
      title: 'Vous gérez la facturation avec vos clients',
      description: 'Contrôle total de vos tarifs et de vos relations clients'
    },
    {
      icon: Euro,
      title: 'Coût de mise en relation faible',
      description: 'Commission réduite pour maximiser vos revenus'
    },
    {
      icon: Users,
      title: 'Faites-vous un réseau',
      description: 'Développez votre clientèle et vos partenariats professionnels'
    },
    {
      icon: Clock,
      title: 'Flexibilité totale',
      description: 'Organisez votre planning selon vos disponibilités'
    },
    {
      icon: Shield,
      title: 'Tous les outils à disposition',
      description: 'Facture, inspection, devis, gestionnaire d\'équipe inclus'
    },
    {
      icon: Zap,
      title: 'Support Expert 24/7',
      description: 'Équipe dédiée disponible pour vous accompagner'
    }
  ];

  const availableMissions = [
    {
      id: 1,
      title: "Mercedes-Benz Classe S - Paris → Lyon",
      type: "Véhicule de luxe",
      distance: "465 km",
      price: "580€",
      urgent: true,
      date: "15 Jan 2025"
    },
    {
      id: 2,
      title: "BMW X5 - Marseille → Nice",
      type: "SUV Premium",
      distance: "200 km", 
      price: "320€",
      urgent: false,
      date: "18 Jan 2025"
    },
    {
      id: 3,
      title: "Audi A8 - Toulouse → Bordeaux",
      type: "Berline Executive",
      distance: "245 km",
      price: "410€",
      urgent: true,
      date: "20 Jan 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glass"></div>
        <div className="container mx-auto px-6 py-20 relative">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-3 bg-card/10 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-glow" />
              <span className="text-sm font-medium text-foreground">Rejoignez l'élite</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
              Devenez Convoyeur Premium
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
              Transformez votre passion pour la conduite en revenus substantiels. 
              Rejoignez notre réseau d'élite et accédez aux meilleures missions du marché.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartNow}
                className="bg-gradient-premium hover:shadow-premium hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-4 text-lg"
              >
                <Truck className="w-5 h-5 mr-2" />
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleDiscoverAdvantages}
                className="border-primary/50 text-primary hover:bg-primary hover:text-white hover:shadow-premium transition-all duration-300 px-8 py-4 text-lg"
              >
                Découvrir les avantages
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:shadow-premium transition-all duration-500 hover:scale-105 group"
            >
              <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Missions Disponibles Section - Centré */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3 mb-6">
              <Target className="w-5 h-5 text-primary animate-glow" />
              <span className="text-sm font-medium text-foreground">En temps réel</span>
            </div>
            
            <h2 className="text-4xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
              🎯 Missions Disponibles
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Découvrez les opportunités premium qui vous attendent. Des missions sélectionnées avec soin pour nos convoyeurs d'élite.
            </p>
          </div>

          <div className="grid gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {availableMissions.map((mission, index) => (
              <div 
                key={mission.id}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-[1.02] group text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{mission.title}</h3>
                      <p className="text-sm text-muted-foreground">{mission.type}</p>
                    </div>
                  </div>
                  {mission.urgent && (
                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 animate-pulse">
                      URGENT
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{mission.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{mission.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">{mission.price}</div>
                      <div className="text-xs text-muted-foreground">Rémunération</div>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-gold hover:bg-gradient-gold hover:scale-105 text-black font-semibold"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Postuler
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-muted-foreground mb-6">
              Plus de <span className="font-bold text-primary">127 missions</span> disponibles après inscription
            </p>
            <Button 
              onClick={handleStartNow}
              className="bg-gradient-premium hover:bg-gradient-premium hover:scale-105 text-white font-semibold px-8 py-3"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Accéder à toutes les missions
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
            Pourquoi choisir FleetChecks ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des avantages exclusifs conçus pour maximiser vos revenus et votre satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mb-4 group-hover:animate-float">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire de vérification de profil */}
      <ConvoyeurProfileForm 
        isOpen={showProfileForm} 
        onClose={() => setShowProfileForm(false)} 
      />
    </div>
  );
};

export default DevenirConvoyeur;