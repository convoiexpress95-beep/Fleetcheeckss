import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  Monitor,
  Zap,
  Gauge,
  Route,
  Camera,
  DollarSign,
  BarChart3,
  Sparkles,
  Layers,
  Globe,
  ChevronRight,
  Phone,
  Mail,
  Award,
  Target,
  Rocket,
  Play,
  Menu,
  X,
  Briefcase,
  UserCheck,
  Calculator,
  Download,
  Archive
} from "lucide-react";
import "../styles/landing-premium.css";

const AppSyncerLanding = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [persona, setPersona] = useState<'entreprise' | 'convoyeur' | 'client'>('entreprise');
  const [tone, setTone] = useState<'sales' | 'tech'>('sales');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // détecter le ton via ?tone=sales|tech
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tone');
    setTone(t === 'tech' ? 'tech' : 'sales');
  }, [location.search]);
  // Fonctionnalités principales (3 piliers)
  const mainFeatures = [
    {
      icon: Camera,
      title: "Création de missions & inspections",
      description: "Photos GPS, signatures numériques et rapports PDF légaux générés en 3 étapes.",
      gradient: "from-blue-500 to-cyan-600",
      benefits: ["Photos géolocalisées", "Signatures légales", "PDF automatisés"]
    },
    {
      icon: Users,
      title: "Gestion d'équipe & facturation", 
      description: "Suivi des convoyeurs, génération de devis et facturation automatisée en temps réel.",
      gradient: "from-purple-500 to-pink-600",
      benefits: ["Suivi convoyeurs", "Devis instantanés", "Facturation auto"]
    },
    {
      icon: Globe,
      title: "Marketplace de missions",
      description: "Publiez vos besoins, comparez les devis et choisissez le meilleur partenaire.",
      gradient: "from-orange-500 to-red-600", 
      benefits: ["Publication facile", "Comparaison devis", "Réseau partenaires"]
    }
  ];

  const stats = [
    { value: "10K+", label: "Missions Traitées", icon: Target },
    { value: "500+", label: "Professionnels", icon: Users },
    { value: "99.9%", label: "Disponibilité", icon: Gauge },
    { value: "4.9★", label: "Satisfaction", icon: Star }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Gratuit",
      description: "Parfait pour découvrir FleetChecks",
      features: [
        "5 missions par mois",
        "Inspections de base",
        "Suivi GPS standard",
        "Support email"
      ],
      color: "from-gray-500 to-gray-700",
      popular: false
    },
    {
      name: "Professional",
      price: "49€",
      period: "/mois",
      description: "Idéal pour les professionnels actifs",
      features: [
        "Missions illimitées",
        "Inspections avancées",
        "GPS temps réel",
        "Marketplace premium",
        "Analytics détaillés",
        "Support prioritaire"
      ],
      color: "from-blue-500 to-cyan-600",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Solutions sur mesure pour entreprises",
      features: [
        "Tout Professional",
        "API personnalisée",
        "White-label",
        "Formation dédiée",
        "SLA garanti",
        "Support 24/7"
      ],
      color: "from-purple-500 to-pink-600",
      popular: false
    }
  ];

  const personaCopy = useMemo(() => {
    const sales = {
      entreprise: {
        title: "Pilotez vos opérations de A à Z",
        subtitle: "Planifiez vos missions, suivez vos véhicules, facturez en 1 clic et partagez des rapports irréprochables.",
        bullets: [
          "Missions illimitées et modèles personnalisés",
          "Contrôles avec photos GPS et signatures",
          "Tableaux de bord financiers et exports PDF"
        ],
        cta: { label: "Démarrer côté Entreprise", href: "/login?role=entreprise" }
      },
      convoyeur: {
        title: "Votre assistant de mission mobile",
        subtitle: "Acceptez des missions, suivez vos trajets automatiquement et envoyez des rapports en un instant.",
        bullets: [
          "Application mobile optimisée terrain",
          "Suivi GPS et preuves d'intervention",
          "Historique et avis clients pro"
        ],
        cta: { label: "Je suis convoyeur", href: "/login?role=convoyeur" }
      },
      client: {
        title: "Transparence pour vos transports",
        subtitle: "Recevez des liens de suivi, rapports d'inspection horodatés et preuve de livraison.",
        bullets: [
          "Lien de suivi en temps réel",
          "Rapports photo avant / après",
          "Preuve de livraison signée"
        ],
        cta: { label: "Accéder à mon espace", href: "/login?role=client" }
      }
    } as const;
    const tech = {
      entreprise: {
        title: "Standardisez qualité et conformité",
        subtitle: "Modèles d'inspection versionnés, preuves horodatées, traçabilité complète et exports auditables.",
        bullets: [
          "Chiffrement des données & contrôle d'accès",
          "Photos GPS, horodatage, signatures qualifiées",
          "Exports PDF, archivage et piste d'audit"
        ],
        cta: { label: "Parler à un expert", href: "/login?role=entreprise" }
      },
      convoyeur: {
        title: "Exécution fiable sur le terrain",
        subtitle: "Suivi GPS natif, horodatage automatique et génération de rapports en moins de 2 minutes.",
        bullets: [
          "App offline-first (upload différé)",
          "Trajets, temps, photos et signatures",
          "Historique signé et partage sécurisé"
        ],
        cta: { label: "Demander une démo", href: "/login?role=convoyeur" }
      },
      client: {
        title: "Transparence et preuves solides",
        subtitle: "Lien de suivi en temps réel, rapports horodatés et preuve de livraison signée.",
        bullets: [
          "Lien de suivi public sécurisé",
          "Avant/Après avec coordonnées GPS",
          "Preuve de livraison (POD) signée"
        ],
        cta: { label: "Accéder à mon espace", href: "/login?role=client" }
      }
    } as const;
    return tone === 'tech' ? tech : sales;
  }, [tone]);

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice Transport", 
      company: "LogiTrans Pro",
      content: "FleetChecks a révolutionné notre gestion de missions. Nous avons réduit nos coûts de convoyage de 35% grâce au réseau exclusif et automatisé 80% de notre facturation.",
      rating: 5,
      avatar: "MD",
      metric: "-35% de coûts"
    },
    {
      name: "Jean-Pierre Martin",
      role: "Convoyeur Indépendant",
      company: "Transport Martin", 
      content: "Grâce au BlaBlaCar interne, j'économise 400€ par mois sur mes trajets retour. L'app mobile est parfaite et me protège avec les inspections GPS.",
      rating: 5,
      avatar: "JM",
      metric: "+40% de rentabilité"
    },
    {
      name: "Sophie Williams", 
      role: "Responsable Flotte",
      company: "EuroMove",
      content: "La marketplace nous a permis d'augmenter notre CA de 60% en 6 mois. La comparaison de devis automatisée nous fait économiser 15h par semaine.",
      rating: 5,
      avatar: "SW", 
      metric: "+60% de CA"
    }
  ];

  const steps = [
    { icon: Rocket, title: "Créez votre compte", desc: "Inscrivez-vous en 2 minutes et invitez votre équipe." },
    { icon: FileText, title: "Paramétrez vos modèles", desc: "Définissez vos missions et inspections en quelques clics." },
    { icon: Camera, title: "Exécutez sur le terrain", desc: "App mobile: photos GPS, signatures et suivi GPS automatiques." },
    { icon: Gauge, title: "Analysez et facturez", desc: "Rapports PDF, tableaux de bord et facturation simplifiée." }
  ];

  const faqs = [
    { q: "Puis-je utiliser FleetChecks uniquement sur mobile ?", a: "Oui, l'application est responsive et une app mobile est prévue pour l'usage terrain." },
    { q: "Comment fonctionnent les inspections ?", a: "Vous pouvez utiliser des modèles prêts à l'emploi ou créer les vôtres avec photos, GPS et signatures." },
    { q: "Les données sont-elles sécurisées ?", a: "Oui, nous utilisons des pratiques de sécurité modernes et le stockage chiffré avec contrôle d'accès." },
    { q: "Proposez-vous un accompagnement entreprise ?", a: "Oui, un plan Enterprise avec formation, SLA et intégrations personnalisées est disponible." }
  ];

  return (
    <div className="min-h-screen bg-black bg-grid-pattern">
      {/* Header */}
  <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in-left">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center animate-float">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                FleetChecks
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 animate-fade-in-right">
              <a href="#pour-qui" className="text-gray-300 hover:text-white transition-colors hover-glow">
                Pour qui ?
              </a>
              <a href="#features" className="text-gray-300 hover:text-white transition-colors hover-glow">
                Fonctionnalités
              </a>
              <a href="#solutions" className="text-gray-300 hover:text-white transition-colors hover-glow">
                Solutions
              </a>
              <a href="#how" className="text-gray-300 hover:text-white transition-colors hover-glow">
                Comment ça marche
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors hover-glow">
                Tarifs
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors hover-glow">
                Témoignages
              </a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors hover-glow">
                FAQ
              </a>
              <Button variant="outline" size="sm" className="glass-effect hover-lift" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 btn-premium hover-lift" asChild>
                <Link to="/login">
                  Commencer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/10 animate-fade-in-up">
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Fonctionnalités
                </a>
                <a href="#pour-qui" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Pour qui ?
                </a>
                <a href="#solutions" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Solutions
                </a>
                <a href="#how" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Comment ça marche
                </a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Tarifs
                </a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Témoignages
                </a>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/login">Connexion</Link>
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 flex-1" asChild>
                    <Link to="/login">Commencer</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-dots-pattern">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30 animate-fade-in-up glass-effect">
            🌟 Plateforme tout-en-un
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up delay-200">
            <span className="gradient-text">
              La plateforme tout-en-un
            </span>
            <br />
            <span className="text-white">
              pour gérer, <span className="gradient-text">convoyer</span> et
            </span>
            <br />
            <span className="gradient-text">optimiser</span> <span className="text-white">vos véhicules</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Missions, inspections, factures, marketplace et suivi en temps réel 
            <span className="text-cyan-400 font-semibold"> réunis dans une seule application.</span>
          </p>

          {/* Multi-Target CTAs */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8 animate-fade-in-up delay-400">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 btn-premium hover-lift" asChild>
              <Link to="/login?role=convoyeur">
                <Truck className="w-5 h-5 mr-2" />
                Je suis convoyeur
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 btn-premium hover-lift" asChild>
              <Link to="/login?role=entreprise">
                <Briefcase className="w-5 h-5 mr-2" />
                Je suis transporteur
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass-effect hover-lift" asChild>
              <Link to="/marketplace">
                <Globe className="w-5 h-5 mr-2" />
                Découvrir la marketplace
              </Link>
            </Button>
          </div>

          {/* Quick Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300 mb-8 animate-fade-in-up delay-450">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Missions en 3 clics</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Inspections légales</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span>Facturation auto</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Réseau convoyeurs</span>
            </div>
          </div>

          {/* Hero Visual - Dashboard + Map Mockup */}
          <div className="mt-16 mb-12 relative animate-fade-in-up delay-500">
            <div className="relative max-w-5xl mx-auto">
              {/* Main Dashboard Mockup */}
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">FleetChecks Dashboard</span>
                </div>
                
                {/* Dashboard Content */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Stats Cards */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm">Missions actives</p>
                          <p className="text-2xl font-bold text-white">12</p>
                        </div>
                        <Truck className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm">CA ce mois</p>
                          <p className="text-2xl font-bold text-white">€8,450</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Mini Map with Vehicle */}
                  <div className="bg-gray-800/30 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 text-sm">Suivi temps réel</span>
                      <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                    </div>
                    <div className="relative h-32 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute bottom-6 right-6 w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Truck className="w-6 h-6 text-cyan-400 animate-bounce" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                        Paris → Lyon • 450km
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-float">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-float delay-1000">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Persona Switcher */}
          <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in-up delay-350">
            <div className="inline-flex bg-gray-800/50 border border-white/10 rounded-2xl p-1">
              <button onClick={() => setPersona('entreprise')} className={`px-4 py-2 rounded-xl text-sm md:text-base transition-all ${persona === 'entreprise' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white'}`}>
                <span className="inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> Entreprise</span>
              </button>
              <button onClick={() => setPersona('convoyeur')} className={`px-4 py-2 rounded-xl text-sm md:text-base transition-all ${persona === 'convoyeur' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white'}`}>
                <span className="inline-flex items-center gap-2"><UserCheck className="w-4 h-4" /> Convoyeur</span>
              </button>
              <button onClick={() => setPersona('client')} className={`px-4 py-2 rounded-xl text-sm md:text-base transition-all ${persona === 'client' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white'}`}>
                <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4" /> Client</span>
              </button>
            </div>
            <div className="text-gray-300 max-w-3xl">
              <h3 className="text-2xl font-semibold text-white mb-3">{personaCopy[persona].title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                {personaCopy[persona].bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up delay-400">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 btn-premium hover-lift" asChild>
              <Link to={personaCopy[persona].cta.href}>
                <Rocket className="w-5 h-5 mr-2" />
                {personaCopy[persona].cta.label}
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 glass-effect hover-lift">
              <Play className="w-5 h-5 mr-2" />
              {tone === 'tech' ? 'Parler à un expert' : 'Voir la démo (2 min)'}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center animate-scale-in delay-${(index + 1) * 100} hover-lift`}>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass-effect animate-float">
                  <stat.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1 gradient-text">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui */}
  <section id="pour-qui" className="py-16 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">Pour qui ?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Une solution pensée pour chaque profil</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-white">Entreprise</CardTitle>
                </div>
                <CardDescription className="text-gray-300">Pilotez vos missions, vos coûts et votre qualité.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Contrôle qualité avec preuves</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> KPIs et exports PDF</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Comptes et rôles</li>
                </ul>
                <div className="mt-6"><Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"><Link to="/login?role=entreprise">Créer un compte entreprise</Link></Button></div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-white">Convoyeur</CardTitle>
                </div>
                <CardDescription className="text-gray-300">Votre assistant de mission sur le terrain.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Trajets et temps auto</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Photos GPS et signatures</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Historique et réputation</li>
                </ul>
                <div className="mt-6"><Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"><Link to="/login?role=convoyeur">Je suis convoyeur</Link></Button></div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-white">Client</CardTitle>
                </div>
                <CardDescription className="text-gray-300">Une transparence totale sur vos transports.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Lien de suivi temps réel</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Rapports avant/après</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Preuve de livraison</li>
                </ul>
                <div className="mt-6"><Button variant="outline" asChild className="w-full border-gray-700 text-gray-200"><Link to="/login?role=client">Accéder à mon espace</Link></Button></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions by Persona */}
  <section id="solutions" className="py-16 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-pink-500/20 text-pink-300 border-pink-500/30">Solutions par profil</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Une valeur claire pour chacun</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-white">Entreprises</CardTitle>
                </div>
                <CardDescription className="text-gray-300">Gérez équipes, missions, coûts et rapports en un seul endroit.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Facturation et exports PDF</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Modèles d'inspection personnalisés</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Droits et accès par rôle</li>
                </ul>
                <div className="mt-6">
                  <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"><Link to="/login?role=entreprise">Créer un compte Entreprise</Link></Button>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-white">Convoyeurs</CardTitle>
                </div>
                <CardDescription className="text-gray-300">Application mobile pour des missions fluides et des preuves solides.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Suivi GPS et temps passé</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Rapports photo horodatés</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Historique et réputation</li>
                </ul>
                <div className="mt-6">
                  <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"><Link to="/login?role=convoyeur">Rejoindre en tant que Convoyeur</Link></Button>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-white">Clients</CardTitle>
                </div>
                <CardDescription className="text-gray-300">Suivi transparent et preuves de livraison pour chaque transport.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Lien de suivi en temps réel</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Rapports d'inspection</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Signature et preuve de livraison</li>
                </ul>
                <div className="mt-6">
                  <Button variant="outline" asChild className="w-full border-gray-700 text-gray-200"><Link to="/login?role=client">Accéder à mon espace</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section id="features" className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              ⚡ Fonctionnalités principales
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une plateforme complète qui couvre tous les aspects du convoyage professionnel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover-lift group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audiences Section */}
      <section id="pour-qui" className="py-20 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
              🎯 Pour qui ?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Une solution pour chaque professionnel
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Que vous soyez convoyeur, transporteur ou gestionnaire de flotte, FleetChecks s'adapte à vos besoins
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Convoyeurs & Transporteurs */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-lg border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500 hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Pour les convoyeurs & transporteurs
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Trouvez des missions rentables</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Générez vos rapports et factures</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Collaborez avec vos équipes</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Optimisez vos trajets retour</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600" asChild>
                  <Link to="/login?role=convoyeur">
                    Créer mon espace convoyeur
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Concessionnaires & Flottes */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-lg border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Pour les concessionnaires & gestionnaires de flotte
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span>Publiez vos besoins de convoyage en masse</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span>Comparez les devis et choisissez le meilleur</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span>Suivez vos véhicules en temps réel</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span>Gérez votre réseau de partenaires</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600" asChild>
                  <Link to="/login?role=entreprise">
                    Créer mon espace professionnel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Clients */}
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-lg border-green-500/30 hover:border-green-400/50 transition-all duration-500 hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Pour les clients particuliers & pros
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Recevez des liens de suivi temps réel</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Rapports d'inspection horodatés</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Preuve de livraison signée</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Transparence totale sur votre transport</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600" asChild>
                  <Link to="/login?role=client">
                    Accéder à mon espace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real-time Tracking Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-950 via-cyan-950 to-blue-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                📍 Suivi temps réel
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Suivez vos missions 
                <span className="gradient-text"> en temps réel</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Localisation GPS précise, vitesse, notifications instantanées et historique complet des trajets.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Géolocalisation précise</h4>
                    <p className="text-gray-300 text-sm">Position actualisée toutes les 30 secondes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Notifications intelligentes</h4>
                    <p className="text-gray-300 text-sm">Alertes de départ, arrivée et incidents</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Route className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Historique des trajets</h4>
                    <p className="text-gray-300 text-sm">Archivage automatique et rapports détaillés</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600" asChild>
                <Link to="/login">
                  Voir une démonstration
                  <Play className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            {/* Right: Interactive Map Mockup */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 text-sm">Mission Paris → Lyon</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-xs">En cours</span>
                  </div>
                </div>
                
                {/* Map Container */}
                <div className="relative h-80 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl overflow-hidden border border-white/10">
                  {/* Route Path */}
                  <div className="absolute inset-4">
                    <svg className="w-full h-full" viewBox="0 0 300 200">
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 30 150 Q 100 50 180 80 Q 220 100 270 60" 
                        stroke="url(#routeGradient)" 
                        strokeWidth="3" 
                        fill="none"
                        className="animate-pulse"
                      />
                    </svg>
                    
                    {/* Start Point */}
                    <div className="absolute top-28 left-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
                    <div className="absolute top-32 left-2 text-xs text-green-400">Paris</div>
                    
                    {/* End Point */}
                    <div className="absolute top-12 right-8 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                    <div className="absolute top-16 right-4 text-xs text-red-400">Lyon</div>
                    
                    {/* Moving Vehicle */}
                    <div className="absolute top-16 left-32 w-6 h-6 bg-cyan-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                      <Truck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  {/* Speed & Info */}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-300">Vitesse: <span className="text-cyan-400">90 km/h</span></div>
                    <div className="text-xs text-gray-300">ETA: <span className="text-green-400">14:30</span></div>
                  </div>
                </div>
                
                {/* Mission Details */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">450km</div>
                    <div className="text-xs text-gray-300">Distance</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-lg font-bold text-cyan-400">4h 15m</div>
                    <div className="text-xs text-gray-300">Temps restant</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-400">€350</div>
                    <div className="text-xs text-gray-300">Tarif</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Notification */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Véhicule pris en charge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Comment ça marche</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, rapide, efficace</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Card key={i} className="glass-card hover-lift text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4"><s.icon className="w-6 h-6 text-cyan-400"/></div>
                  <CardTitle className="text-white text-lg">{s.title}</CardTitle>
                  <CardDescription className="text-gray-300">{s.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Billing Section */}
  <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              📋 Facturation Légale
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Facturation & archivage
              <br />
              <span className="gradient-text">conformes à la législation</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Générez automatiquement vos factures et devis conformes aux exigences légales avec archivage sécurisé.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features List */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Factures & Devis Automatisés</h3>
                  <p className="text-gray-300">Génération automatique de documents conformes avec numérotation séquentielle et mentions légales obligatoires.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Archivage Sécurisé</h3>
                  <p className="text-gray-300">Conservation légale de 10 ans avec horodatage certifié et sauvegarde redondante.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Calcul TVA Automatique</h3>
                  <p className="text-gray-300">Application automatique des taux de TVA selon la localisation et le type de prestation.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Export Comptabilité</h3>
                  <p className="text-gray-300">Exports compatibles avec tous les logiciels comptables (CSV, Excel, API comptable).</p>
                </div>
              </div>
            </div>

            {/* Billing Document Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                {/* Invoice Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">FACTURE</div>
                      <div className="text-gray-600">N° FA-2024-0156</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-800 font-semibold">FleetChecks SAS</div>
                      <div className="text-sm text-gray-600">SIRET: 123 456 789 00012</div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-800">{new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client:</span>
                    <span className="text-gray-800">Auto Premium SA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mission:</span>
                    <span className="text-gray-800">Paris → Lyon</span>
                  </div>
                </div>

                {/* Invoice Lines */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Prestation</span>
                    <span>Montant HT</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-800">Convoyage véhicule premium</span>
                    <span className="text-gray-800">450,00 €</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>TVA 20%</span>
                    <span>90,00 €</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>TOTAL TTC</span>
                    <span>540,00 €</span>
                  </div>
                </div>

                {/* Legal Mentions */}
                <div className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-4">
                  <p>TVA non applicable, art. 293 B du CGI • Escompte pour paiement anticipé : néant</p>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Conforme légal</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Archive className="w-4 h-4" />
                  <span>Archivé 10 ans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              💎 Tarification Transparente
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Des plans flexibles qui s'adaptent à votre activité, du convoyeur indépendant à l'entreprise de transport.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${plan.popular ? 'ring-2 ring-cyan-500/50 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1">
                      🔥 Plus Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                    asChild
                  >
                    <Link to="/login">
                      Choisir ce plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BlaBlaCar Interne - Unique Differentiator */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
              🚗 Innovation exclusive
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Le <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">BlaBlaCar interne</span>
              <br />
              des convoyeurs
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Révolutionnez votre rentabilité avec notre réseau exclusif de partage de trajets entre professionnels
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Réseau fermé de professionnels</h3>
                  <p className="text-gray-300">Connectez-vous uniquement avec des convoyeurs vérifiés et de confiance pour optimiser vos trajets retour.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Réduisez vos coûts de 40%</h3>
                  <p className="text-gray-300">Partagez les frais de carburant et d'autoroute en mutualisant vos trajets avec d'autres professionnels.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Route className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Optimisation intelligente</h3>
                  <p className="text-gray-300">Notre algorithme vous suggère automatiquement les meilleurs partenaires selon vos trajets.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Planification simplifiée</h3>
                  <p className="text-gray-300">Créez vos annonces de trajets directement depuis vos missions terminées en un clic.</p>
                </div>
              </div>
            </div>

            {/* Right: Visual Mockup */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">Réseau Convoyeurs</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        JM
                      </div>
                      <div>
                        <div className="text-white font-semibold">Jean-Marc</div>
                        <div className="text-gray-300 text-xs">Lyon → Paris demain 14h</div>
                      </div>
                      <div className="ml-auto text-green-400 font-bold text-sm">-30€</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>4.9 • 156 trajets partagés</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        SM
                      </div>
                      <div>
                        <div className="text-white font-semibold">Sophie M.</div>
                        <div className="text-gray-300 text-xs">Marseille → Nice vendredi 9h</div>
                      </div>
                      <div className="ml-auto text-green-400 font-bold text-sm">-25€</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>4.8 • 89 trajets partagés</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        PL
                      </div>
                      <div>
                        <div className="text-white font-semibold">Pierre L.</div>
                        <div className="text-gray-300 text-xs">Toulouse → Bordeaux samedi</div>
                      </div>
                      <div className="ml-auto text-green-400 font-bold text-sm">-20€</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>5.0 • 203 trajets partagés</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Économies ce mois :</span>
                    <span className="text-green-400 font-bold">-850€</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl px-4 py-2 shadow-lg animate-float">
                <div className="text-white font-bold text-sm">Exclusif FleetChecks</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600" asChild>
              <Link to="/login">
                Rejoindre le réseau exclusif
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
  <section id="testimonials" className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
              💬 Témoignages Clients
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez comment FleetChecks transforme le quotidien des professionnels du convoyage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      <div className="text-cyan-400 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Success Metrics */}
          <div className="mt-16 grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">-35%</div>
              <div className="text-gray-300">Réduction des coûts</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">+60%</div>
              <div className="text-gray-300">Augmentation du CA</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">15h</div>
              <div className="text-gray-300">Économisées/semaine</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">4.9★</div>
              <div className="text-gray-300">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
  <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30">
            🚀 Rejoignez la révolution
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Rejoignez dès aujourd'hui
            <br />
            <span className="gradient-text">la plateforme qui révolutionne</span>
            <br />
            le convoyage
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Plus de 10 000 professionnels nous font confiance. 
            Découvrez pourquoi FleetChecks est devenu l'outil indispensable du transport.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 btn-premium hover-lift text-lg px-8 py-4" asChild>
              <Link to="/login">
                <Rocket className="w-6 h-6 mr-2" />
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass-effect hover-lift text-lg px-8 py-4" asChild>
              <Link to="/marketplace">
                <Play className="w-5 h-5 mr-2" />
                Voir une démonstration
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Essai gratuit • Aucune carte requise</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Configuration en moins de 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Support premium inclus</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Questions fréquentes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((f, i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{f.q}</CardTitle>
                  <CardDescription className="text-gray-300">{f.a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl p-12 border border-cyan-500/20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre activité ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de professionnels qui font déjà confiance à FleetChecks pour leurs missions de convoyage.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8" asChild>
                <Link to="/login">
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Phone className="w-5 h-5 mr-2" />
                Nous contacter
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Configuration en 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FleetChecks</span>
              </div>
              <p className="text-gray-400 mb-6">
                La plateforme de référence pour les professionnels du convoyage et transport de véhicules.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-6">Produit</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-6">Entreprise</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partenaires</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Statut</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">
              © 2024 FleetChecks. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Conditions générales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppSyncerLanding;