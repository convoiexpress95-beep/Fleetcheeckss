import { useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedBackground from "@/components/AnimatedBackground";
import { mockMissions, getStatusLabel, getStatusColor } from "@/lib/mock-data";

const MissionDetail = () => {
  const { id } = useParams();
  const mission = mockMissions.find(m => m.id === id);

  if (!mission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedBackground />
        <div className="glass rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Mission introuvable</h1>
          <p className="text-muted-foreground mb-6">La mission demandée n'existe pas ou a été supprimée.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux missions
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(mission.status)} border-0`}>
                {getStatusLabel(mission.status)}
              </Badge>
              {mission.schedule.urgent && (
                <Badge variant="destructive">URGENT</Badge>
              )}
            </div>
          </div>

          {/* Mission Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mission #{mission.id}</h1>
                <p className="text-muted-foreground">{mission.client.name}</p>
              </div>

              {/* Itinerary */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{mission.itinerary.departure.address}</div>
                  <div className="text-primary text-sm my-1">↓ {mission.itinerary.distance} km • ~{mission.itinerary.duration} min</div>
                  <div className="font-medium text-foreground">{mission.itinerary.arrival.address}</div>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{formatDate(mission.schedule.date)}</div>
                  <div className="text-muted-foreground">{mission.schedule.timeSlot} • {mission.schedule.flexibility}</div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              {mission.assignedTo && (
                <Card className="glass border-glass-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4 text-primary" />
                      Assigné à
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {mission.assignedTo.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{mission.assignedTo.name}</div>
                        <div className="text-sm text-muted-foreground">{mission.assignedTo.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="glass border-glass-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Coûts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Péages</span>
                      <span className="text-foreground">{mission.cost.tolls}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Carburant</span>
                      <span className="text-foreground">{mission.cost.fuel}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Divers</span>
                      <span className="text-foreground">{mission.cost.miscellaneous}€</span>
                    </div>
                    <div className="border-t border-glass-border pt-2 flex justify-between font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">{mission.cost.total}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass border-glass-border">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="inspection">Inspection</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Véhicule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marque</span>
                      <span className="text-foreground">{mission.vehicle.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modèle</span>
                      <span className="text-foreground">{mission.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Immatriculation</span>
                      <span className="text-foreground font-mono">{mission.vehicle.registration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie</span>
                      <span className="text-foreground">{mission.vehicle.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Énergie</span>
                      <span className="text-foreground">{mission.vehicle.energy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Contact Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom</span>
                      <span className="text-foreground">{mission.client.contact.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground">{mission.client.contact.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span className="text-foreground">{mission.client.contact.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inspection">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle>État des inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <span className="font-medium text-foreground">Inspection départ</span>
                    <Badge className={mission.inspections.departure ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {mission.inspections.departure ? 'Effectuée' : 'En attente'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <span className="font-medium text-foreground">Inspection arrivée</span>
                    <Badge className={mission.inspections.arrival ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {mission.inspections.arrival ? 'Effectuée' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle>Suivi GPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {mission.tracking.enabled 
                      ? 'Suivi GPS activé - Carte en développement'
                      : 'Suivi GPS désactivé pour cette mission'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {mission.documents.length > 0 ? (
                  <div className="space-y-2">
                    {mission.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <span className="text-foreground">{doc}</span>
                        <Button variant="ghost" size="sm">Télécharger</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun document attaché</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle>Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="text-foreground font-medium">Mission créée</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(mission.createdAt)}
                      </p>
                    </div>
                  </div>
                  {mission.assignedTo && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div>
                        <p className="text-foreground font-medium">Assignée à {mission.assignedTo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(mission.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MissionDetail;