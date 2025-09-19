import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowLeftRight, Calendar, Search, Zap, Target } from "lucide-react";
import convoyBackground from "@/assets/convoy-background.svg";

const SearchBar = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="w-full py-20 px-6 relative overflow-hidden">
      {/* Background image with animation */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${convoyBackground})`,
          animation: 'float 20s ease-in-out infinite'
        }}
      ></div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-gold rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-premium rounded-full opacity-30 blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Plateforme Premium</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            🚗 Trouvez votre Mission Parfaite
          </h2>
          <p className="text-primary-foreground/90 text-xl max-w-2xl mx-auto leading-relaxed">
            Découvrez des opportunités de convoyage <span className="font-semibold text-accent">premium</span> et 
            connectez-vous avec des <span className="font-semibold text-success">convoyeurs vérifiés</span> en quelques clics
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 hover:backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02] glassmorphic-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              {/* Ville de départ */}
              <div className="lg:col-span-4 space-y-3 group">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  Point de Départ
                </label>
                <Input
                  placeholder="🏙️ Paris, Lyon, Marseille, Nice..."
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="h-12 bg-background/50 border-2 border-border hover:border-primary focus:border-primary focus:ring-primary/20 rounded-xl text-base font-medium placeholder:text-muted-foreground/60 transition-all duration-300"
                />
              </div>

              {/* Bouton d'échange */}
              <div className="lg:col-span-1 flex justify-center items-end pb-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full bg-gradient-premium text-white hover:bg-gradient-premium hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-glow"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Ville d'arrivée */}
              <div className="lg:col-span-4 space-y-3 group">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Destination
                </label>
                <Input
                  placeholder="🎯 Où souhaitez-vous aller ?"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="h-12 bg-background/50 border-2 border-border hover:border-primary focus:border-primary focus:ring-primary/20 rounded-xl text-base font-medium placeholder:text-muted-foreground/60 transition-all duration-300"
                />
              </div>

              {/* Date de départ */}
              <div className="lg:col-span-3 space-y-3 group">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Date Souhaitée
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 bg-background/50 border-2 border-border hover:border-primary focus:border-primary focus:ring-primary/20 rounded-xl text-base font-medium transition-all duration-300"
                />
              </div>
            </div>

            {/* Bouton de recherche et stats */}
            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span><span className="font-semibold text-foreground">3</span> missions disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span><span className="font-semibold text-foreground">156</span> convoyeurs actifs</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-gradient-gold hover:bg-gradient-gold hover:scale-105 text-black font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-gold transition-all duration-300 text-lg border border-yellow-400/30"
              >
                <Search className="w-6 h-6 mr-3" />
                Rechercher ma Mission ✨
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;