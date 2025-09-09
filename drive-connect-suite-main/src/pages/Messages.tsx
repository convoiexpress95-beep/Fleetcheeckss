import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import MessagingInterface from "@/components/MessagingInterface";
import { MessageCircle, Sparkles, Users, Clock } from "lucide-react";

const Messages = () => {
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
              <span className="text-sm font-medium text-foreground">Communications Premium</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
              Messages
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Communiquez en temps réel avec vos partenaires. 
              Interface moderne et sécurisée pour tous vos échanges professionnels.
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center animate-float">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <p className="text-sm text-muted-foreground">Support temps réel</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center animate-float" 
                  style={{ animationDelay: '0.5s' }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">1000+</div>
                  <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-premium transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center animate-float" 
                  style={{ animationDelay: '1000ms' }}
                >
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">&lt; 1s</div>
                  <p className="text-sm text-muted-foreground">Temps de réponse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <MessagingInterface 
            userId={user.id} 
            userRole={user.user_metadata?.user_type || 'convoyeur'} 
          />
        </div>
      </main>
    </div>
  );
};

export default Messages;