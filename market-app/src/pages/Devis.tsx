import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import DevisManagement from "@/components/DevisManagement";
import { FileText, Sparkles, TrendingUp, CheckCircle, DollarSign } from "lucide-react";

const Devis = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      {/* Hero Section with Glass Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glass"></div>
        <div className="container mx-auto px-6 py-16 relative">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-3 bg-card/10 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-glow" />
              <span className="text-sm font-medium text-foreground">Gestion Premium</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
              Mes Devis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Gérez vos propositions commerciales avec des outils professionnels. 
              Suivi en temps réel et interface intuitive pour maximiser vos opportunités.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">Auto</div>
                <p className="text-sm text-muted-foreground">Génération automatique</p>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none" style={{ animationDelay: '0.5s' }}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-accent mb-2">95%</div>
                <p className="text-sm text-muted-foreground">Taux d'acceptation</p>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none" style={{ animationDelay: '1s' }}>
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-success mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Fiabilité</p>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float group-hover:animate-none" style={{ animationDelay: '1.5s' }}>
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-warning mb-2">+15%</div>
                <p className="text-sm text-muted-foreground">Revenus moyens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <DevisManagement 
            userRole={user.user_metadata?.user_type || 'convoyeur'}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  );
};

export default Devis;