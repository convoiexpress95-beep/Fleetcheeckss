import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Shield, Users, Leaf } from "lucide-react";
import { SearchForm } from "@/components/convoiturage/SearchForm";
import { TripList } from "@/components/convoiturage/TripList";
import { useState } from "react";
import type { SearchParams } from "@/hooks/useConvoiturage";

const Index = () => {
  const [filters, setFilters] = useState<SearchParams | undefined>(undefined);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-gradient-to-br from-background to-muted/40" />
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Voyagez ensemble,
              <span className="text-primary block">économisez plus</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Trouvez des covoiturages partout en France et partagez vos trajets 
              avec une communauté de confiance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg">
                <Car className="w-5 h-5" />
                Trouver un trajet
              </Button>
              <Button variant="outline" size="lg">
                Publier un trajet
              </Button>
            </div>
          </div>
          
          {/* Search Form */}
          <SearchForm onSearch={(p) => setFilters(p)} />
        </div>
      </section>

      {/* Features */}
      <section className="py-10 border-t border-border/50">
        <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="glass-card glow-hover border border-white/10">
              <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Communauté</h3>
                <p className="text-sm text-muted-foreground">
                  Plus de 2 millions de membres vérifiés
                </p>
              </CardContent>
            </Card>

      <Card className="glass-card glow-hover border border-white/10">
              <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Sécurité</h3>
                <p className="text-sm text-muted-foreground">
                  Profils vérifiés et système d'avis
                </p>
              </CardContent>
            </Card>

      <Card className="glass-card glow-hover border border-white/10">
              <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Confort</h3>
                <p className="text-sm text-muted-foreground">
                  Voyagez dans des véhicules confortables
                </p>
              </CardContent>
            </Card>

      <Card className="glass-card glow-hover border border-white/10">
              <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Écologie</h3>
                <p className="text-sm text-muted-foreground">
                  Réduisez votre empreinte carbone
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trip Results */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <TripList filters={filters} />
        </div>
      </section>
    </div>
  );
};

export default Index;
