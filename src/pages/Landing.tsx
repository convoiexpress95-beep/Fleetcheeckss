import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Truck,
  FileText,
  MapPin,
  Users,
  CreditCard,
  Star,
  Search,
  Shield,
  Clock,
  ArrowRight,
  Smartphone,
  Monitor
} from "lucide-react";
import mobileAppMockup from "@/assets/mobile-app-mockup.jpg";
import webAppMockup from "@/assets/web-app-mockup.jpg";

const features = [
  {
    icon: Search,
    title: "Inspection véhicules",
    description: "Contrôlez l'état de vos véhicules avant et après convoyage"
  },
  {
    icon: Truck,
    title: "Gestion missions",
    description: "Créez et suivez toutes vos missions de convoyage"
  },
  {
    icon: MapPin,
    title: "Suivi GPS",
    description: "Localisez vos véhicules en temps réel"
  },
  {
    icon: FileText,
    title: "Facturation",
    description: "Générez vos factures automatiquement"
  },
  {
    icon: Users,
    title: "Équipe",
    description: "Gérez vos convoyeurs et donneurs d'ordre"
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos données sont protégées et sauvegardées"
  }
];

const plans = [
  {
    name: "Découverte",
    price: "Gratuit",
    credits: 5,
  description: "Parfait pour tester FleetCheecks",
    features: [
      "5 crédits offerts",
      "Toutes les fonctionnalités",
      "Support par email"
    ],
    popular: false
  },
  {
    name: "Pack Débutant",
    price: "9,99€",
    credits: 10,
    description: "Idéal pour débuter",
    features: [
      "10 crédits",
      "Valable 30 jours",
      "Utilisation immédiate",
      "Support par email"
    ],
    popular: false
  },
  {
    name: "Pack Pro",
    price: "19,99€",
    credits: 25,
    description: "Le plus populaire",
    features: [
      "25 crédits",
      "Valable 30 jours",
      "Support prioritaire",
      "Rapports détaillés"
    ],
    popular: true
  },
  {
    name: "Pack Expert",
    price: "39,99€",
    credits: 100,
    description: "Pour les professionnels",
    features: [
      "100 crédits",
      "Valable 30 jours",
      "Support téléphonique",
      "Formation incluse"
    ],
    popular: false
  },
  {
    name: "Pack Entreprise",
    price: "79,99€",
    credits: 650,
    description: "Pour les grandes entreprises",
    features: [
      "650 crédits",
      "Valable 30 jours",
      "Manager dédié",
      "Support personnalisé"
    ],
    popular: false
  }
];

const steps = [
  {
    number: 1,
    title: "Créez votre compte",
    description: "Inscription rapide avec 5 crédits offerts"
  },
  {
    number: 2,
    title: "Ajoutez votre équipe",
    description: "Invitez convoyeurs et donneurs d'ordre"
  },
  {
    number: 3,
    title: "Créez une mission",
    description: "Planifiez votre premier convoyage"
  },
  {
    number: 4,
    title: "Suivez et facturez",
    description: "Gérez tout depuis votre tableau de bord"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-tight text-[#00c8ff] text-2xl sm:text-3xl md:text-4xl select-none">
              FleetCheecks
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link to="/login">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Nouvelle génération de convoyage
          </Badge>
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Simplifiez votre <span className="text-primary">convoyage</span> et vos <span className="text-primary">inspections</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La solution complète pour gérer vos missions de convoyage, inspecter vos véhicules et facturer vos clients en toute simplicité.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/login">
                Essayer gratuitement
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Voir la démonstration
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✨ 5 crédits offerts · Aucune carte bancaire requise
          </p>
        </div>
      </section>

      {/* App Showcase */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Disponible partout, à tout moment
            </h2>
            <p className="text-xl text-muted-foreground">
              FleetCheecks s'adapte à votre façon de travailler : sur mobile ou ordinateur
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mobile App */}
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Smartphone className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Application Mobile</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Gérez vos missions en déplacement avec notre app mobile intuitive
                </p>
              </div>
              
              <div className="relative mx-auto max-w-sm">
                <img 
                  src={mobileAppMockup} 
                  alt="FleetCheecks App Mobile" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Inspection véhicules sur le terrain</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Suivi GPS en temps réel</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Photos et rapports instantanés</span>
                </div>
              </div>
            </div>

            {/* Web App */}
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Monitor className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Application Web</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Tableau de bord complet pour gérer toute votre activité
                </p>
              </div>
              
              <div className="relative">
                <img 
                  src={webAppMockup} 
                  alt="FleetCheecks Dashboard Web" 
                  className="w-full h-auto rounded-xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-xl"></div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Dashboard analytiques avancés</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Gestion complète des équipes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Facturation automatisée</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/login">
                <Smartphone className="mr-2 w-5 h-5" />
                Essayer sur mobile et web
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-muted-foreground">
              Une plateforme complète pour votre activité de convoyage
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Comment ça marche ?</h2>
            <p className="text-xl text-muted-foreground">
              Démarrez en 4 étapes simples
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Nos tarifs simples</h2>
            <p className="text-xl text-muted-foreground">
              1 crédit = 1 action (créer une mission ou une facture)
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-full mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''} border-border/50`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    ⭐ Populaire
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {plan.price}
                  </div>
                  {plan.credits && (
                    <p className="text-muted-foreground">{plan.credits} crédits</p>
                  )}
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    {plan.name === "Découverte" ? (
                      <Link to="/login">
                        Commencer gratuitement
                      </Link>
                    ) : (
                      <Link to="/shop">
                        Acheter ce pack
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Prêt à simplifier votre convoyage ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez les professionnels qui font confiance à FleetCheecks pour gérer leurs missions de convoyage.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">
              Commencer maintenant
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <div className="flex justify-center items-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>5 crédits offerts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Prêt en 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Données sécurisées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-extrabold tracking-tight text-[#00c8ff] text-xl select-none">FleetCheecks</span>
          </div>
          <p className="text-muted-foreground mb-4">
            La solution moderne pour le convoyage professionnel
          </p>
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
            <p>© 2024 FleetCheecks. Tous droits réservés.</p>
            <p>
              Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'} · Build {typeof __BUILD_TIME__ !== 'undefined' ? new Date(__BUILD_TIME__).toLocaleString() : 'dev'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}