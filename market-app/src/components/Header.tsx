import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, User, Bell, LogOut, Settings, MessageCircle, FileText, Plus, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useUnifiedAuthHooks";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationBadge from "./NotificationBadge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "react-router-dom";
import PublishMissionDialog from "@/components/PublishMissionDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, profile } = useAuth() as any;
  const { toast } = useToast();
  const location = useLocation();
  const { counts, clearMessageNotifications, clearMissionNotifications } = useNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur FleetChecks MarketPlace",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const userType = user?.user_metadata?.user_type || 'convoyeur';
  const isAdmin = (profile?.app_role === 'admin') || (user?.user_metadata?.app_role === 'admin');
  return (
    <header className="w-full bg-card shadow-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                FleetCheeckS MarketPlace
              </h1>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                PARTNER
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`relative text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/' ? 'text-primary font-medium' : ''
              }`}
              onClick={() => {
                if (location.pathname === '/') {
                  clearMissionNotifications();
                }
              }}
            >
              Missions
              <NotificationBadge count={counts.missions} />
            </Link>
            <Link 
              to="/messages" 
              className={`flex items-center gap-2 relative text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/messages' ? 'text-primary font-medium' : ''
              }`}
              onClick={clearMessageNotifications}
            >
              <MessageCircle className="w-4 h-4" />
              Messages
              <NotificationBadge count={counts.messages} />
            </Link>
            <Link 
              to="/devis" 
              className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/devis' ? 'text-primary font-medium' : ''
              }`}
            >
              <FileText className="w-4 h-4" />
              Devis
            </Link>
            <Link 
              to="/devenir-convoyeur" 
              className={`text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/devenir-convoyeur' ? 'text-primary font-medium' : ''
              }`}
            >
              Devenir convoyeur
            </Link>
            <Link
              to="/billing"
              className={`flex items-center gap-2 relative text-teal-500 hover:text-teal-400 transition-colors ${
                location.pathname === '/billing' ? 'text-teal-300 font-medium' : ''
              }`}
            >
              <CreditCard className="w-4 h-4" /> Facturation
            </Link>
            
            {/* Publier une mission */}
            <div className="ml-4">
              {/* On laisse onCreated facultatif; si on est sur /, le composant Index passera une prop */}
              <PublishMissionDialog />
            </div>
          </nav>

          {/* User area */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Bell className="w-5 h-5" />
              </Button>
              <NotificationBadge 
                count={counts.messages + counts.missions} 
                className="bg-primary text-primary-foreground"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-premium rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {user?.user_metadata?.full_name || user?.email || 'Utilisateur'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {userType === 'convoyeur' ? 'Convoyeur' : 'Donneur d\'ordre'}
                    </Badge>
                    {isAdmin && (
                      <Badge className="text-xs bg-amber-500 text-white hover:bg-amber-600">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;