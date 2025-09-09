import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Truck, Plus, BarChart3, Sparkles, Zap, Crown, LogOut, Settings, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useWeeklyMissions, useTopDrivers } from '@/hooks/useDashboardAnalytics';

const InspectionDashboard = () => {
  const { user, signOut } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          contactsCount: 5,
          missionsCount: 8,
          invitationsCount: 2,
        };
      }

      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: missionsCount } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`);

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
    enabled: true,
  });

  const { data: weeklyMissions, isLoading: loadingWeekly } = useWeeklyMissions();
  const { data: topDrivers, isLoading: loadingDrivers } = useTopDrivers();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin glow"></div>
          <p className="text-foreground/80 text-lg">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-cosmic rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-sunset rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <Card className="glass-card border-white/10 hover:scale-[1.01] transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-cosmic rounded-2xl animate-float">
                  <Sparkles className="w-8 h-8 text-white animate-glow" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent mb-2">
                    🎉 Gestionnaire de missions FleetCheck
                  </h2>
                  <p className="text-foreground/80">
                    Tableau de bord central pour toutes vos opérations de transport
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-12 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-primary-glow animate-glow" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent">
                Tableau de bord Central
              </h1>
            </div>
            <p className="text-foreground/80 text-lg">
              Bienvenue, <span className="text-primary-glow font-semibold">{user?.user_metadata?.full_name || user?.email}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">Contacts</CardTitle>
              <div className="p-2 bg-gradient-ocean rounded-lg group-hover:animate-float">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-1">
                {stats?.contactsCount || 0}
              </div>
              <p className="text-xs text-foreground/60">
                Contacts actifs
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group animate-fade-in animation-delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">Missions</CardTitle>
              <div className="p-2 bg-gradient-sunset rounded-lg group-hover:animate-float">
                <Truck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent mb-1">
                {stats?.missionsCount || 0}
              </div>
              <p className="text-xs text-foreground/60">
                Missions totales
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 group animate-fade-in animation-delay-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/90">Invitations</CardTitle>
              <div className="p-2 bg-gradient-royal rounded-lg group-hover:animate-float">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-primary/90 bg-clip-text text-transparent mb-1">
                {stats?.invitationsCount || 0}
              </div>
              <p className="text-xs text-foreground/60">
                En attente
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
                    Évolution sur 7 semaines
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
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Line type="monotone" dataKey="missions" stroke="hsl(var(--primary))" strokeWidth={3} />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-foreground/60">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                    Classement des meilleurs
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
                    <XAxis type="number" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.7)" fontSize={12} width={100} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Bar dataKey="completedMissions" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-foreground/60">
                  <Award className="w-12 h-12 mb-4 opacity-50" />
                  <p>Aucun convoyeur trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InspectionDashboard;
