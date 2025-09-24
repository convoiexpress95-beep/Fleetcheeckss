import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Shield, Users, Leaf, Clock, Wallet, MapPin } from "lucide-react";
import { SearchForm } from "@/components/convoiturage/SearchForm";
import { TripList } from "@/components/convoiturage/TripList";
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SearchParams } from "@/hooks/useConvoiturage";

const Index = () => {
  const [filters, setFilters] = useState<SearchParams | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Image hero personnalisée
  const heroImage = "/hero-carpooling-Cms9o9bC.jpg";

  const scrollToResults = useCallback(() => {
    const el = resultsRef.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundAttachment: "local",
            filter: "saturate(0.95) contrast(1.05)",
          }}
        />
        {/* Layered gradients for richer depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 via-fuchsia-400/10 to-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/10 via-emerald-300/10 to-primary/20 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 pt-16 pb-10 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 border px-3 py-1 text-xs text-muted-foreground mb-4">
              <Shield className="w-3.5 h-3.5 text-primary" /> Trajets vérifiés et messages sécurisés
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-sm">
              Voyagez ensemble,
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-fuchsia-400 to-cyan-400">économisez plus</span>
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Trouvez des covoiturages partout en France et partagez vos trajets avec une communauté de confiance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="glow-hover" onClick={scrollToResults}>
                <Car className="w-5 h-5" />
                Trouver un trajet
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/convoiturage/publish">Publier un trajet</Link>
              </Button>
            </div>
          </div>

          {/* Search Form - floating card */}
          <div className="mt-8">
            <SearchForm
              onSearch={(p) => {
                setFilters(p);
                // Scroll down when searching
                setTimeout(scrollToResults, 50);
              }}
            />
          </div>
        </div>
      </section>

      {/* Value props / features */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-border/50 shadow-card">
              <CardContent className="p-5 flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-primary/15 via-fuchsia-400/10 to-cyan-400/10">
                  <Users className="w-4.5 h-4.5 text-primary" />
                </span>
                <div>
                  <div className="font-medium">Communauté fiable</div>
                  <div className="text-sm text-muted-foreground">Profils vérifiés et messagerie intégrée</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 shadow-card">
              <CardContent className="p-5 flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-primary/15 via-fuchsia-400/10 to-cyan-400/10">
                  <Wallet className="w-4.5 h-4.5 text-primary" />
                </span>
                <div>
                  <div className="font-medium">Économies garanties</div>
                  <div className="text-sm text-muted-foreground">Partagez les frais de route en toute simplicité</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 shadow-card">
              <CardContent className="p-5 flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-primary/15 via-fuchsia-400/10 to-cyan-400/10">
                  <Clock className="w-4.5 h-4.5 text-primary" />
                </span>
                <div>
                  <div className="font-medium">Horaires flexibles</div>
                  <div className="text-sm text-muted-foreground">Trouvez des trajets au bon moment pour vous</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 shadow-card">
              <CardContent className="p-5 flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-primary/15 via-fuchsia-400/10 to-cyan-400/10">
                  <Leaf className="w-4.5 h-4.5 text-primary" />
                </span>
                <div>
                  <div className="font-medium">Impact réduit</div>
                  <div className="text-sm text-muted-foreground">Diminuez vos émissions en partageant le trajet</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trip Results */}
      <section className="py-8 md:py-12 bg-muted/30 border-t" ref={resultsRef} id="search-results">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Résultats de recherche</span>
          </div>
          <TripList filters={filters} />
        </div>
      </section>

      {/* Steps section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-border/50">
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Étape 1</div>
                <div className="font-medium mb-1">Cherchez un trajet</div>
                <div className="text-sm text-muted-foreground">Renseignez départ, destination et date, puis filtrez selon vos besoins.</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Étape 2</div>
                <div className="font-medium mb-1">Réservez en 1 clic</div>
                <div className="text-sm text-muted-foreground">Envoyez une demande de réservation au conducteur en toute sécurité.</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">Étape 3</div>
                <div className="font-medium mb-1">Voyagez sereinement</div>
                <div className="text-sm text-muted-foreground">Retrouvez-vous au point de rendez-vous et partagez le trajet.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-10 border-t bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="rounded-xl border glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Vous conduisez prochainement ?</div>
              <div className="text-sm text-muted-foreground">Publiez votre trajet et partagez les frais avec des passagers.</div>
            </div>
            <Button asChild size="lg" className="glow-hover">
              <Link to="/convoiturage/publish">Publier un trajet</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
