import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Route, MapPin, Calendar, Users, Euro, ArrowRight, Plus } from 'lucide-react';

interface TrajetPartage {
  id: string;
  convoyeur_nom: string;
  ville_depart: string;
  ville_arrivee: string;
  date_heure: string;
  nb_places: number;
  prix_par_place?: number;
  statut: string;
}

const mockTrajets: TrajetPartage[] = [
  {
    id: "1",
    convoyeur_nom: "Jean Dupont",
    ville_depart: "Paris",
    ville_arrivee: "Lyon", 
    date_heure: "2025-01-20T14:00:00",
    nb_places: 3,
    prix_par_place: 45,
    statut: "ouvert"
  },
  {
    id: "2",
    convoyeur_nom: "Marie Martin",
    ville_depart: "Marseille", 
    ville_arrivee: "Nice",
    date_heure: "2025-01-22T09:00:00",
    nb_places: 2,
    prix_par_place: 25,
    statut: "ouvert"
  }
];

export function CovoiturageOverview() {
  return (
    <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-sunset rounded-2xl group-hover:animate-glow">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                Trajets Partagés
              </CardTitle>
              <p className="text-foreground/60 text-sm">
                Optimisez vos retours à vide
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="glass-card text-foreground/90 border-white/20 hover:bg-white/10">
            <Link to="/trajets-partages">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTrajets.slice(0, 2).map((trajet) => (
          <div key={trajet.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-foreground text-sm">{trajet.convoyeur_nom}</h4>
              <Badge variant="default" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                Ouvert
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-foreground/70 mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{trajet.ville_depart} → {trajet.ville_arrivee}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(trajet.date_heure).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-foreground/70">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{trajet.nb_places} places</span>
                </div>
                {trajet.prix_par_place && (
                  <div className="flex items-center gap-1">
                    <Euro className="w-3 h-3" />
                    <span>{trajet.prix_par_place}€/place</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Button asChild className="w-full bg-gradient-sunset hover:scale-105 transition-all duration-300 mt-4">
          <Link to="/trajets-partages">
            <Plus className="w-4 h-4 mr-2" />
            Publier un trajet
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}