import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Truck, Plus, BarChart3, Sparkles, Zap, Crown, LogOut, Settings, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useWeeklyMissions, useTopDrivers } from '@/hooks/useDashboardAnalytics';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        // Return demo stats when not authenticated
        return {
          contactsCount: 5,
          missionsCount: 8,
          invitationsCount: 2,
        };
      }

      // Get contacts count
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get missions count
      const { count: missionsCount } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`);

      // Get pending invitations count
      const { count: invitationsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('invited_user_id', user.id)
        .eq('status', 'pending');

      return {
        contactsCount: contactsCount || 0,
        missionsCount: missionsCount || 0,
        invitationsCount: invitationsCount || 0,
      };
    },
    enabled: true, // Always enabled to show demo data
  });

  // Hooks pour les analytics
  const { data: weeklyMissions, isLoading: loadingWeekly } = useWeeklyMissions();
  const { data: topDrivers, isLoading: loadingDrivers } = useTopDrivers();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin glow"></div>
          <p className="text-foreground/80 text-lg">Chargement de votre tableau de bord premium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-cosmic rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-sunset rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Message */}
        <div className="mb-8 animate-fade-in-up">
          <Card className="glass-card border-white/10 hover:scale-[1.01] transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-cosmic rounded-2xl animate-float">
                  <Sparkles className="w-8 h-8 text-white animate-glow" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent mb-2">
                    🎉 Bienvenue dans votre espace premium !
                  </h2>
                  <p className="text-foreground/80">
                    Découvrez la nouvelle façon de gérer vos missions de transport avec élégance et efficacité.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-12 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-primary-glow animate-glow" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent">
                Tableau de bord Premium
              </h1>
            </div>
            <p className="text-foreground/80 text-lg">
              Bienvenue, <span className="text-primary-glow font-semibold">{user?.user_metadata?.full_name || user?.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="glass-card text-foreground/90 border-white/20 hover:bg-white/10">
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut} className="glass-card text-foreground/90 border-white/20 hover:bg-red-500/20">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">Contacts Premium</CardTitle>
              <div className="p-2 bg-gradient-ocean rounded-lg group-hover:animate-float">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-1">
                {stats?.contactsCount || 0}
              </div>
              <p className="text-xs text-foreground/60">
                Contacts actifs dans votre réseau
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group animate-fade-in animation-delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">Missions Transport</CardTitle>
              <div className="p-2 bg-gradient-sunset rounded-lg group-hover:animate-float">
                <Truck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent mb-1">
                {stats?.missionsCount || 0}
              </div>
              <p className="text-xs text-foreground/60">
                Missions créées ou assignées
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group animate-fade-in animation-delay-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">Invitations VIP</CardTitle>
              <div className="p-2 bg-gradient-royal rounded-lg group-hover:animate-float">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent mb-1">
                {stats?.invitationsCount || 0}
              </div>
              <p className="text-xs text-foreground/60">
                Invitations en attente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Missions Chart */}
          <Card className="glass-card border-white/10 animate-fade-in animation-delay-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-cosmic rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Missions Hebdomadaires
                  </CardTitle>
                  <CardDescription className="text-foreground/60">
                    Évolution de vos missions sur 7 semaines
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWeekly ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : weeklyMissions && weeklyMissions.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyMissions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="week" 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="missions" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      name="Total missions"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      name="Missions complétées"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inProgress" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                      name="En cours"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-foreground/60">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                  <p>Aucune donnée de mission disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Drivers Chart */}
          <Card className="glass-card border-white/10 animate-fade-in animation-delay-400">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-sunset rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                    Top Convoyeurs
                  </CardTitle>
                  <CardDescription className="text-foreground/60">
                    Classement de vos meilleurs convoyeurs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDrivers ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : topDrivers && topDrivers.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topDrivers} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      type="number" 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelStyle={{ color: 'white' }}
                      formatter={(value: any, name: string) => [
                        `${value} ${name === 'completedMissions' ? 'missions complétées' : 
                          name === 'totalMissions' ? 'missions totales' : 
                          name === 'successRate' ? '% de réussite' : name}`,
                        ''
                      ]}
                    />
                    <Bar 
                      dataKey="completedMissions" 
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                      name="completedMissions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-foreground/60">
                  <Award className="w-12 h-12 mb-4 opacity-50" />
                  <p>Aucun convoyeur trouvé</p>
                  <p className="text-sm mt-2">Commencez par créer des missions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-cosmic rounded-2xl group-hover:animate-glow">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Missions Premium
                  </CardTitle>
                  <CardDescription className="text-foreground/60">
                    Gérez vos missions de transport avec style
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-gradient-cosmic hover:scale-105 transition-all duration-300 glow-hover">
                <Link to="/missions/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle mission
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full glass-card text-foreground/90 border-white/20 hover:bg-white/10">
                <Link to="/missions">Voir toutes les missions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-sunset rounded-2xl group-hover:animate-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                    Réseau Elite
                  </CardTitle>
                  <CardDescription className="text-foreground/60">
                    Gérez votre réseau de contacts premium
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-gradient-sunset hover:scale-105 transition-all duration-300 glow-hover">
                <Link to="/contacts">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gérer les contacts
                </Link>
              </Button>
              {stats?.invitationsCount ? (
                <Button variant="outline" asChild className="w-full glass-card text-foreground/90 border-white/20 hover:bg-white/10 animate-pulse-glow">
                  <Link to="/contacts">
                    <Zap className="w-4 h-4 mr-2" />
                    {stats.invitationsCount} invitation{stats.invitationsCount > 1 ? 's' : ''} en attente
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-royal rounded-2xl group-hover:animate-glow">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent">
                    Profil Premium
                  </CardTitle>
                  <CardDescription className="text-foreground/60">
                    Gérez vos informations personnelles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full glass-card text-foreground/90 border-white/20 hover:bg-white/10">
                <Link to="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Voir les paramètres
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;