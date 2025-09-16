import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Store, MapPin, Euro, ArrowRight, Plus } from 'lucide-react';

interface MarketplaceMission {
  id: string;
  titre: string;
  ville_depart: string;
  ville_arrivee: string;
  prix_propose: number;
  statut: string;
  vehicule_requis?: string;
}

const mockMissions: MarketplaceMission[] = [
  {
    id: "1",
    titre: "Transport véhicule Paris-Lyon",
    ville_depart: "Paris",
    ville_arrivee: "Lyon",
    prix_propose: 850,
    statut: "ouverte",
    vehicule_requis: "Remorque"
  },
  {
    id: "2", 
    titre: "Convoyage Marseille-Bordeaux",
    ville_depart: "Marseille",
    ville_arrivee: "Bordeaux", 
    prix_propose: 650,
    statut: "en_negociation",
    vehicule_requis: "Plateau"
  }
];

export function MarketplaceOverview() {
  return (
    <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-ocean rounded-2xl group-hover:animate-glow">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Marketplace
              </CardTitle>
              <p className="text-foreground/60 text-sm">
                Missions disponibles
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="glass-card text-foreground/90 border-white/20 hover:bg-white/10">
            <Link to="/marketplace">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockMissions.slice(0, 2).map((mission) => (
          <div key={mission.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-foreground text-sm">{mission.titre}</h4>
              <Badge variant={mission.statut === 'ouverte' ? 'default' : 'secondary'} className="text-xs">
                {mission.statut === 'ouverte' ? 'Ouverte' : 'En négociation'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-foreground/70 mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{mission.ville_depart} → {mission.ville_arrivee}</span>
              </div>
              <div className="flex items-center gap-1">
                <Euro className="w-3 h-3" />
                <span>{mission.prix_propose}€</span>
              </div>
            </div>
            {mission.vehicule_requis && (
              <Badge variant="outline" className="text-xs">
                {mission.vehicule_requis}
              </Badge>
            )}
          </div>
        ))}
        
        <Button asChild className="w-full bg-gradient-ocean hover:scale-105 transition-all duration-300 mt-4">
          <Link to="/marketplace">
            <Plus className="w-4 h-4 mr-2" />
            Publier une mission
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}