import { Button } from "@/components/ui/button";
import { User, Bell, MessageCircle, Plus, Search, Briefcase, UserCheck, History, Activity, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND_NAME } from "@/lib/branding";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MarketplaceHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userType = user?.user_metadata?.user_type || "convoyeur";

  const navigationItems = [
    { path: "/marketplace", label: "Accueil", icon: Search },
    { path: "/marketplace/missions", label: "Toutes les missions", icon: Briefcase },
    ...(userType === "convoyeur" ? [
      { path: "/marketplace/my-offers", label: "Mes offres", icon: Briefcase },
      { path: "/marketplace/active-missions", label: "Missions actives", icon: Activity },
    ] : []),
    { path: "/marketplace/profiles", label: "Convoyeurs", icon: UserCheck },
    { path: "/marketplace/messages", label: "Messages", icon: MessageCircle },
    { path: "/marketplace/history", label: "Historique", icon: History },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === "/marketplace" && location.pathname === "/marketplace");
  };

  return (
    <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/marketplace")}>
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">{BRAND_NAME}</h1>
              <p className="text-xs text-gray-300">Marketplace</p>
            </div>
          </div>

          {/* Navigation centrale */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    isActivePath(item.path)
                      ? "bg-gradient-to-r from-cyan-500/30 to-teal-500/30 text-white border border-cyan-400/50 shadow-lg"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Navigation mobile */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700/50 hover:text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Menu
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800/95 backdrop-blur-xl border-gray-700 text-gray-200">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      className="hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-600/70 hover:text-white backdrop-blur-sm transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/marketplace/post")}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Publier</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-gray-300 hover:bg-gray-700/50 hover:text-white"
              onClick={() => navigate("/marketplace/messages")}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:bg-gray-700/50 hover:text-white"
              onClick={() => navigate("/marketplace/messages")}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-600 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-600/50">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm hidden sm:block">
                    <p className="font-medium text-white">
                      {user?.email ? user.email.split('@')[0] : 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-300 capitalize">{userType}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800/95 backdrop-blur-xl border-gray-700 text-gray-200">
                <DropdownMenuItem 
                  className="hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => navigate("/marketplace/profiles")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => navigate("/marketplace/history")}
                >
                  <History className="w-4 h-4 mr-2" />
                  Mon Historique
                </DropdownMenuItem>
                {userType === "convoyeur" && (
                  <DropdownMenuItem 
                    className="hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => navigate("/marketplace/my-offers")}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Mes Offres
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MarketplaceHeader;