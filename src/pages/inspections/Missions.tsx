import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus, Eye, Edit, Calendar, MapPin, User } from 'lucide-react';

const InspectionMissions = () => {
  const { user } = useAuth();

  const { data: missions, isLoading } = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching missions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Terminée', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missions</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos missions de transport
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/gestionnaire-missions/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Mission
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {missions?.filter(m => m.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {missions?.filter(m => m.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {missions && missions.length > 0 ? (
          missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {mission.reference || 'Référence non définie'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(mission.status)}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/missions/${mission.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Donneur d'ordre :</p>
                    <p className="text-muted-foreground">
                      {mission.donor_id ? 'Assigné' : 'Non assigné'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Convoyeur :</p>
                    <p className="text-muted-foreground">
                      {mission.driver_id ? 'Assigné' : 'Non assigné'}
                    </p>
                  </div>
                  {mission.description && (
                    <div className="md:col-span-2">
                      <p className="font-medium">Description :</p>
                      <p className="text-muted-foreground">{mission.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune mission trouvée</h3>
              <p className="text-muted-foreground text-center mb-4">
                Commencez par créer votre première mission
              </p>
              <Button asChild>
                <Link to="/gestionnaire-missions/nouvelle">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une mission
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InspectionMissions;
