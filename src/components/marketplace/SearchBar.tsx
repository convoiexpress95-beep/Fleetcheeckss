import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowLeftRight, Calendar, Search, Zap, Target } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

const SearchBar = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="w-full py-20 px-6 relative overflow-hidden bg-gray-900">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/src/assets/marketplace-background.png')`,
          animation: 'float 20s ease-in-out infinite'
        }}
      ></div>
      {/* Light overlay to show image better */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-900/50 to-gray-900/60"></div>
      
      {/* Decorative elements with reduced cyan/teal theme */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-teal-500/15 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-teal-400/10 to-cyan-500/10 rounded-full opacity-15 blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-10">
          {/* Topbar colorée avec le thème sombre */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600/90 to-teal-600/90 backdrop-blur-md rounded-full px-8 py-3 mb-6 border border-cyan-400/30 shadow-lg">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white tracking-wide">{BRAND_NAME} Marketplace</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-teal-200 bg-clip-text text-transparent">
            🚗 Trouvez votre Mission Parfaite
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Découvrez des opportunités de convoyage <span className="font-semibold text-cyan-300">premium</span> et 
            connectez-vous avec des <span className="font-semibold text-teal-300">convoyeurs vérifiés</span> en quelques clics
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8 hover:bg-gray-800/40 hover:backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              {/* Ville de départ */}
              <div className="lg:col-span-4 space-y-3 group">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-teal-700 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  Point de Départ
                </label>
                <Input
                  placeholder="🏙️ Paris, Lyon, Marseille, Nice..."
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="h-12 bg-gray-700/50 border-2 border-gray-600/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl text-base font-medium placeholder:text-gray-400 text-gray-200 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Bouton d'échange */}
              <div className="lg:col-span-1 flex justify-center items-end pb-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-600 to-teal-700 text-white hover:from-cyan-700 hover:to-teal-800 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Ville d'arrivée */}
              <div className="lg:col-span-4 space-y-3 group">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-teal-700 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Destination
                </label>
                <Input
                  placeholder="🎯 Où souhaitez-vous aller ?"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="h-12 bg-gray-700/50 border-2 border-gray-600/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl text-base font-medium placeholder:text-gray-400 text-gray-200 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Date de départ */}
              <div className="lg:col-span-3 space-y-3 group">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-teal-700 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Date Souhaitée
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 bg-gray-700/50 border-2 border-gray-600/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl text-base font-medium text-gray-200 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Bouton de recherche et stats */}
            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <span><span className="font-semibold text-white">8</span> missions disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span><span className="font-semibold text-white">156</span> convoyeurs actifs</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 hover:scale-105 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 text-lg border-0"
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