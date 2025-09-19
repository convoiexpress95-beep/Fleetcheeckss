import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowLeftRight, Calendar, Search, Zap, Target } from "lucide-react";

export default function SearchBar() {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="w-full py-20 px-6 relative overflow-hidden">
      {/* Background decorations only (no external image to avoid asset wiring) */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full opacity-10 blur-xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full opacity-20 blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Plateforme Premium</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-2">
            🚗 Trouvez votre Mission Parfaite
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez des opportunités de convoyage premium et connectez-vous avec des convoyeurs vérifiés.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-background/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-8 hover:bg-background transition-all duration-500 hover:scale-[1.01]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              {/* Ville de départ */}
              <div className="lg:col-span-4 space-y-3 group">
                <label className="text-sm font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  Point de Départ
                </label>
                <Input
                  placeholder="🏙️ Paris, Lyon, Marseille, Nice..."
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Bouton d'échange */}
              <div className="lg:col-span-1 flex justify-center items-end pb-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Ville d'arrivée */}
              <div className="lg:col-span-4 space-y-3 group">
                <label className="text-sm font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Destination
                </label>
                <Input
                  placeholder="🎯 Où souhaitez-vous aller ?"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Date de départ */}
              <div className="lg:col-span-3 space-y-3 group">
                <label className="text-sm font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Date Souhaitée
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Bouton de recherche et stats */}
            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span><span className="font-semibold text-foreground">—</span> missions disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span><span className="font-semibold text-foreground">156</span> convoyeurs actifs</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="px-10 py-4 rounded-2xl"
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
}
