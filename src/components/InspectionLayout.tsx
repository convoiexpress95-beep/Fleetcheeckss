import { LayoutDashboard, Truck, Plus, Users, MapPin, FileText, Menu, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InspectionLayoutProps {
  children: React.ReactNode;
}

const InspectionLayout = ({ children }: InspectionLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const inspectionItems = [
    {
      title: "Tableau de bord",
      icon: LayoutDashboard,
      url: "/gestionnaire-missions",
      description: "Vue d'ensemble des missions"
    },
    {
      title: "Contacts",
      icon: Users,
      url: "/contacts",
      description: "Gestion des contacts"
    },
    {
      title: "Suivi GPS",
      icon: MapPin,
      url: "/tracking",
      description: "Suivi en temps réel"
    },
    {
      title: "Rapports",
      icon: FileText,
      url: "/reports",
      description: "Génération de rapports"
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'}`}>
        {/* Back to dashboard button */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isCollapsed && "Retour au tableau de bord"}
          </Link>
        </div>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-bold">Gestionnaire de missions</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-white hover:bg-white/20"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {inspectionItems.map((item) => {
            const isActive = location.pathname === item.url;
            const Icon = item.icon;

            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.title}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-500'}`}>{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-white/50 backdrop-blur-sm">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InspectionLayout;
