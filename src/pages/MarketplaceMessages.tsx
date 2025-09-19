import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MessagingInterface from "@/market-embed/components/MessagingInterface";

const MarketplaceMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/marketplace")}
            className="glass-card text-foreground border-border hover:bg-accent/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Marketplace
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-white/70">Communication avec vos clients et convoyeurs</p>
          </div>
        </div>

        <MessagingInterface userId={user.id} />
      </div>
    </div>
  );
};

export default MarketplaceMessages;
