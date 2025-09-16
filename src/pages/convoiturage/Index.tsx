import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Shield, Users, Leaf } from "lucide-react";
import { SearchForm } from "@/components/convoiturage/SearchForm";
import { TripList } from "@/components/convoiturage/TripList";
import { useState } from "react";
import type { SearchParams } from "@/hooks/useConvoiturage";

const Index = () => {
  const [filters, setFilters] = useState<SearchParams | undefined>(undefined);
  
  // Image hero personnalisée
  const heroImage = "/hero-carpooling-Cms9o9bC.jpg";
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[450px] sm:h-[500px] lg:h-[550px] xl:h-[600px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            backgroundAttachment: 'local'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/85 to-muted/50" />
        
        <div className="relative container mx-auto px-4 py-16 flex items-center h-full">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
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
