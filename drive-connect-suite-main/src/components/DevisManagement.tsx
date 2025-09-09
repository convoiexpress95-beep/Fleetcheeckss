import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, TrendingUp, Clock, Euro } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DevisComparison from "./DevisComparison";
import DevisSubmission from "./DevisSubmission";
import MessagingInterface from "./MessagingInterface";

interface Mission {
  id: string;
  titre: string;
  ville_depart: string;
  ville_arrivee: string;
  prix_propose?: number;
  description?: string;
  created_by: string;
  statut: string;
}

interface DevisManagementProps {
  userRole: string;
  userId: string;
  preSelectedMission?: any;
  onMissionSelect?: (mission: any) => void;
}

const DevisManagement = ({ userRole, userId, preSelectedMission, onMissionSelect }: DevisManagementProps) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMissions: 0,
    devisReceived: 0,
    devisSent: 0,
    acceptedDevis: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMissions();
    fetchStats();
  }, [userId, userRole]);

  // Gérer la mission présélectionnée
  useEffect(() => {
    if (preSelectedMission && !selectedMission) {
      setSelectedMission(preSelectedMission);
    }
  }, [preSelectedMission, selectedMission]);

  const fetchMissions = async () => {
    try {
      let query = supabase.from('marketplace_missions').select('*');
      
      if (userRole === 'donneur_ordre') {
        query = query.eq('created_by', userId);
      } else {
        // Pour les convoyeurs, on montre toutes les missions ouvertes
        query = query.eq('statut', 'ouverte');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setMissions((data as any) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les missions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (userRole === 'donneur_ordre') {
        // Stats pour donneur d'ordre
        const { data: missionsData } = await supabase
          .from('marketplace_missions')
          .select('id')
          .eq('created_by', userId);

        const { data: devisData } = await supabase
          .from('marketplace_devis')
          .select('id, statut, mission_id')
          .in('mission_id', (missionsData || []).map(m => m.id));

        setStats({
          totalMissions: missionsData?.length || 0,
          devisReceived: devisData?.length || 0,
          devisSent: 0,
          acceptedDevis: devisData?.filter(d => d.statut === 'accepte').length || 0
        });
      } else {
        // Stats pour convoyeur
        const { data: devisData } = await supabase
          .from('marketplace_devis')
          .select('id, statut')
          .eq('convoyeur_id', userId);

        setStats({
          totalMissions: 0,
          devisReceived: 0,
          devisSent: devisData?.length || 0,
          acceptedDevis: devisData?.filter(d => d.statut === 'accepte').length || 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const renderMissionCard = (mission: Mission) => (
    <Card
      key={mission.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedMission?.id === mission.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => {
        setSelectedMission(mission);
        onMissionSelect?.(mission);
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{mission.titre}</CardTitle>
          <Badge variant={mission.statut === 'ouverte' ? 'default' : 'secondary'}>
            {mission.statut}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {mission.ville_depart} → {mission.ville_arrivee}
          </p>
          {mission.prix_propose && (
            <div className="flex items-center gap-1">
              <Euro className="w-4 h-4 text-primary" />
              <span className="font-semibold">{mission.prix_propose}€</span>
            </div>
          )}
          {mission.description && (
            <p className="text-sm line-clamp-2">{mission.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {userRole === 'donneur_ordre' ? 'Mes missions' : 'Devis envoyés'}
                </p>
                <p className="text-2xl font-bold">
                  {userRole === 'donneur_ordre' ? stats.totalMissions : stats.devisSent}
                </p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {userRole === 'donneur_ordre' ? 'Devis reçus' : 'Devis acceptés'}
                </p>
                <p className="text-2xl font-bold">
                  {userRole === 'donneur_ordre' ? stats.devisReceived : stats.acceptedDevis}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Devis acceptés
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.acceptedDevis}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taux de réussite
                </p>
                <p className="text-2xl font-bold text-primary">
                  {userRole === 'donneur_ordre' && stats.devisReceived > 0
                    ? Math.round((stats.acceptedDevis / stats.devisReceived) * 100)
                    : userRole === 'convoyeur' && stats.devisSent > 0
                    ? Math.round((stats.acceptedDevis / stats.devisSent) * 100)
                    : 0}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des missions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {userRole === 'donneur_ordre' ? 'Mes missions' : 'missions disponibles'}
              {preSelectedMission && (
                <Badge variant="secondary" className="text-xs">
                  Mission sélectionnée
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto space-y-4 p-6">
              {/* Afficher la mission présélectionnée en premier si elle existe */}
              {preSelectedMission && !missions.some(m => m.id === preSelectedMission.id) && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary font-medium mb-2">Mission sélectionnée depuis la liste :</p>
                  {renderMissionCard(preSelectedMission)}
                </div>
              )}
              
              {missions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune mission trouvée</p>
                </div>
              ) : (
                missions.map(renderMissionCard)
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone principale */}
        <div className="lg:col-span-2">
          {selectedMission ? (
            <Tabs defaultValue="devis" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="devis">
                  {userRole === 'donneur_ordre' ? 'Devis reçus' : 'Soumettre devis'}
                </TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
              </TabsList>

              <TabsContent value="devis" className="mt-4">
                {userRole === 'donneur_ordre' ? (
                  <DevisComparison
                    missionId={selectedMission.id}
                    isOwner={true}
                  />
                ) : (
                  <DevisSubmission
                    mission={selectedMission}
                    onDevisSubmitted={() => {
                      fetchStats();
                      toast({
                        title: "Devis envoyé",
                        description: "Votre devis a été envoyé avec succès",
                      });
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="messages" className="mt-4">
                <MessagingInterface userId={userId} userRole={userRole} />
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails de la mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Informations générales</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Titre:</span>
                            <p>{selectedMission.titre}</p>
                          </div>
                          <div>
                            <span className="font-medium">Statut:</span>
                            <p>{selectedMission.statut}</p>
                          </div>
                          <div>
                            <span className="font-medium">Départ:</span>
                            <p>{selectedMission.ville_depart}</p>
                          </div>
                          <div>
                            <span className="font-medium">Arrivée:</span>
                            <p>{selectedMission.ville_arrivee}</p>
                          </div>
                          {selectedMission.prix_propose && (
                            <div>
                              <span className="font-medium">Prix proposé:</span>
                              <p>{selectedMission.prix_propose}€</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedMission.description && (
                        <div>
                          <h3 className="font-semibold mb-2">Description</h3>
                          <p className="text-sm">{selectedMission.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une mission</h3>
                <p className="text-muted-foreground">
                  Choisissez une mission dans la liste pour voir les détails et gérer les devis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevisManagement;