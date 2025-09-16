import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AnimatedBackground />
      <div className="relative z-10 text-center">
        <div className="glass rounded-2xl p-8 md:p-12">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-4 text-2xl font-semibold text-foreground">Page introuvable</p>
          <p className="mb-8 text-muted-foreground max-w-md">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Page précédente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
