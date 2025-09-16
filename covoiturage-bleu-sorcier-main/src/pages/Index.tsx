import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { TripList } from "@/components/TripList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Shield, Users, Leaf } from "lucide-react";

// Utilise l'image locale depuis le dossier public
const heroImage = "/hero-carpooling-Cms9o9bC.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 gradient-hero opacity-90" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Voyagez ensemble,
              <span className="text-primary block">économisez plus</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Trouvez des covoiturages partout en France et partagez vos trajets 
              avec une communauté de confiance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/">
                  <Car className="w-5 h-5" />
                  Trouver un trajet
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/publish">Publier un trajet</Link>
              </Button>
            </div>
          </div>
          
          {/* Search Form */}
          <SearchForm />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="gradient-card shadow-card border border-border/50 hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Communauté</h3>
                <p className="text-sm text-muted-foreground">
                  Plus de 2 millions de membres vérifiés
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card border border-border/50 hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Sécurité</h3>
                <p className="text-sm text-muted-foreground">
                  Profils vérifiés et système d'avis
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card border border-border/50 hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Confort</h3>
                <p className="text-sm text-muted-foreground">
                  Voyagez dans des véhicules confortables
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card border border-border/50 hover-glow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Écologie</h3>
                <p className="text-sm text-muted-foreground">
                  Réduisez votre empreinte carbone
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trip Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <TripList />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 gradient-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Convoiturage. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
