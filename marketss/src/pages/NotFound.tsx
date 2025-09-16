import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glass"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-3 bg-card/10 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3 mb-6">
          <Sparkles className="w-5 h-5 text-primary animate-glow" />
          <span className="text-sm font-medium text-foreground">Erreur 404</span>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-16 shadow-premium">
          <div className="w-24 h-24 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
            404
          </h1>
          
          <h2 className="text-3xl font-display font-semibold text-foreground mb-4">
            Page introuvable
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          
          <Button 
            asChild
            size="lg"
            className="bg-gradient-premium hover:shadow-premium hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-4 text-lg"
          >
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-sm mt-8">
          Route demandée: <code className="bg-muted/50 px-2 py-1 rounded">{location.pathname}</code>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
