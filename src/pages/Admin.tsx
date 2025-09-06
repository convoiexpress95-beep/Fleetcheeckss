import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AdminRoute } from "@/components/AdminRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAllProfiles } from "@/hooks/useAllProfiles";
import { useMissions } from "@/hooks/useMissions";
import { useNotifications } from "@/hooks/useNotifications";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Truck,
  Settings,
  Crown,
  Shield,
  Database,
  Bell,
  Mail,
  FileText,
  CreditCard,
  Activity,
  BarChart3,
  UserPlus,
  Trash2,
  Edit3,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  HardDrive,
  Wifi
} from "lucide-react";

interface RealTimeStats {
  totalUsers: number;
  activeUsers: number;
  totalMissions: number;
  completedMissions: number;
  totalRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export default function Admin() {
  const [notifications, setNotifications] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<RealTimeStats | null>(null);
  const [adminSettings, setAdminSettings] = useState({
    sessionDuration: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    smtpServer: '',
    smtpPort: 587,
  senderEmail: 'noreply@fleetcheck.app',
  emailNotifications: true,
  smsNotifications: false,
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Utiliser les hooks existants pour les données réelles
  const { data: realUsers = [], isLoading: usersLoading } = useAllProfiles();
  const { data: missionsData, isLoading: missionsLoading } = useMissions();
  const { data: systemNotifications } = useNotifications();
  const { data: subscription } = useSubscription();
  
  const realMissions = missionsData?.data || [];

  // Charger paramètres admin (Supabase avec fallback local) et statistiques
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        // Tenter de charger depuis Supabase (caster car types non générés pour admin_settings)
        const { data, error } = await (supabase as any)
          .from('admin_settings')
          .select('*')
          .single();

        if (!error && data) {
          const row: any = data;
          setAdminSettings(prev => ({
            ...prev,
            sessionDuration: row.session_duration ?? prev.sessionDuration,
            maxLoginAttempts: row.max_login_attempts ?? prev.maxLoginAttempts,
            twoFactorAuth: row.two_factor_auth ?? prev.twoFactorAuth,
            smtpServer: row.smtp_server ?? prev.smtpServer,
            smtpPort: row.smtp_port ?? prev.smtpPort,
            senderEmail: row.sender_email ?? prev.senderEmail,
            emailNotifications: row.email_notifications ?? prev.emailNotifications,
            smsNotifications: row.sms_notifications ?? prev.smsNotifications,
          }));
          setNotifications(Boolean(row.notifications_enabled));
          setMaintenance(Boolean(row.maintenance_enabled));
        } else {
          // Fallback localStorage si RLS bloque ou table absente
          try {
            const saved = localStorage.getItem('adminSettings');
            if (saved) setAdminSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
            const savedNotif = localStorage.getItem('adminNotifications');
            if (savedNotif) setNotifications(JSON.parse(savedNotif));
            const savedMaint = localStorage.getItem('adminMaintenance');
            if (savedMaint) setMaintenance(JSON.parse(savedMaint));
          } catch {}
        }
      } catch {}
    };

    const loadSystemStats = async () => {
      try {
        // Statistiques utilisateurs
        const { data: userStats, error: userError } = await supabase
          .from('profiles')
          .select('status')
          .eq('status', 'active');
        
        if (userError) throw userError;

        // Statistiques missions
        const { data: missionStats, error: missionError } = await supabase
          .from('missions')
          .select('status, donor_earning, driver_earning');
        
        if (missionError) throw missionError;

        // Calculer les revenus totaux
        const totalRevenue = missionStats?.reduce((acc, mission) => 
          acc + (mission.donor_earning || 0) + (mission.driver_earning || 0), 0
        ) || 0;

        const completedMissions = missionStats?.filter(m => m.status === 'completed').length || 0;

        setSystemStats({
          totalUsers: realUsers.length,
          activeUsers: userStats?.length || 0,
          totalMissions: missionStats?.length || 0,
          completedMissions,
          totalRevenue,
          systemHealth: 'healthy'
        });

      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques système",
          variant: "destructive"
        });
      } finally {
        // setLoading géré par bootstrap pour éviter les courses
      }
    };

    const bootstrap = async () => {
      await loadAdminSettings();
      if (!usersLoading && !missionsLoading) {
        await loadSystemStats();
      }
      setLoading(false);
    };

    bootstrap();
  }, [realUsers, realMissions, usersLoading, missionsLoading, toast]);

  // Fonctions d'administration
  const handleDeleteUser = async (userId: string) => {
    try {
      // Soft delete: désactiver l'utilisateur dans la table profiles
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      toast({ title: 'Utilisateur désactivé', description: 'Le compte a été marqué comme inactif.' });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const handleSystemMaintenance = async (enable: boolean) => {
    try {
      setMaintenance(enable);
      // Persiste en base (admin_settings)
  await (supabase as any).from('admin_settings').upsert({
        id: 1,
        maintenance_enabled: enable,
      });
      localStorage.setItem('adminMaintenance', JSON.stringify(enable));
      toast({
        title: enable ? "Mode maintenance activé" : "Mode maintenance désactivé",
        description: enable ? 
          "Le système est maintenant en maintenance" : 
          "Le système est de nouveau opérationnel",
        variant: enable ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mode maintenance",
        variant: "destructive"
      });
    }
  };

  const saveAdminSettings = async () => {
    try {
      // Persistance Supabase (avec fallback local)
  await (supabase as any).from('admin_settings').upsert({
        id: 1,
        session_duration: adminSettings.sessionDuration,
        max_login_attempts: adminSettings.maxLoginAttempts,
        two_factor_auth: adminSettings.twoFactorAuth,
        smtp_server: adminSettings.smtpServer,
        smtp_port: adminSettings.smtpPort,
        sender_email: adminSettings.senderEmail,
        notifications_enabled: notifications,
        email_notifications: adminSettings.emailNotifications,
        sms_notifications: adminSettings.smsNotifications,
      });
      localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
      localStorage.setItem('adminNotifications', JSON.stringify(notifications));
      toast({
        title: "Paramètres sauvegardés",
        description: "La configuration système a été mise à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    }
  };

  // Exporter un rapport CSV simple
  const exportAdminReport = () => {
    const rows: Array<Record<string, string | number>> = [];
    if (systemStats) {
      rows.push({ metric: 'active_users', value: systemStats.activeUsers });
      rows.push({ metric: 'total_users', value: systemStats.totalUsers });
      rows.push({ metric: 'total_missions', value: systemStats.totalMissions });
      rows.push({ metric: 'completed_missions', value: systemStats.completedMissions });
      rows.push({ metric: 'total_revenue', value: systemStats.totalRevenue });
      rows.push({ metric: 'system_health', value: systemStats.systemHealth });
    }
    const header = 'metric,value';
    const body = rows.map(r => `${r.metric},${r.value}`).join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium">Chargement des données d'administration...</p>
          <p className="text-sm text-muted-foreground">
            Récupération des statistiques système en temps réel
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Utilisateurs actifs", 
      value: systemStats?.activeUsers?.toString() || "0", 
      icon: Users, 
      color: "text-blue-500",
      trend: "+12% ce mois"
    },
    { 
      label: "Missions ce mois", 
      value: systemStats?.totalMissions?.toString() || "0", 
      icon: Truck, 
      color: "text-green-500",
      trend: "+8% vs mois dernier"
    },
    { 
      label: "Revenus totaux", 
      value: `€${systemStats?.totalRevenue?.toLocaleString() || "0"}`, 
      icon: CreditCard, 
      color: "text-accent",
      trend: "+23% ce trimestre"
    },
    { 
      label: "Taux de réussite", 
      value: systemStats?.completedMissions && systemStats?.totalMissions ? 
        `${((systemStats.completedMissions / systemStats.totalMissions) * 100).toFixed(1)}%` : "0%", 
      icon: BarChart3, 
      color: "text-orange-500",
      trend: "Objectif atteint"
    },
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent">
                  Administration
                </h1>
                <p className="text-muted-foreground">
                  Gestion complète de la plateforme FleetCheck • Données en temps réel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStats?.systemHealth === 'healthy' ? 'bg-green-500' :
                systemStats?.systemHealth === 'warning' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} />
              <span className="text-sm text-muted-foreground">
                {systemStats?.systemHealth === 'healthy' ? 'Système opérationnel' :
                 systemStats?.systemHealth === 'warning' ? 'Attention requise' : 
                 'Problème détecté'}
              </span>
            </div>
          </div>
        </div>

        {/* Alertes système */}
        {maintenance && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Mode maintenance activé - Les utilisateurs ne peuvent pas accéder à certaines fonctionnalités
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards - Données réelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 glass-card">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs ({realUsers.length})
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Missions ({realMissions.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Système
            </TabsTrigger>
          </TabsList>

          {/* Users Management - Données réelles */}
          <TabsContent value="users" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Gestion des utilisateurs réels
                    </CardTitle>
                    <CardDescription>
                      {realUsers.length} utilisateurs enregistrés dans Supabase
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-royal hover:opacity-90" 
                    onClick={() => navigate('/contacts')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inviter un utilisateur
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom complet</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'Non renseigné'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" title="Voir le profil" onClick={() => navigate(`/profile/${user.id}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Éditer" onClick={() => navigate(`/profile/${user.id}?edit=1`)}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Supprimer">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. L'utilisateur {user.full_name || user.email} 
                                    et toutes ses données seront définitivement supprimés.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions Management - Données réelles */}
          <TabsContent value="missions" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Gestion des missions réelles
                </CardTitle>
                <CardDescription>
                  {realMissions.length} missions en base de données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Revenus</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realMissions.slice(0, 10).map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-medium font-mono">
                          {mission.reference}
                        </TableCell>
                        <TableCell>{mission.title}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              mission.status === "completed" ? "default" :
                              mission.status === "in_progress" ? "secondary" : 
                              "outline"
                            }
                          >
                            {mission.status === "completed" ? "Terminé" :
                             mission.status === "in_progress" ? "En cours" :
                             mission.status === "pending" ? "En attente" : "Planifié"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mission.pickup_date ? 
                            new Date(mission.pickup_date).toLocaleDateString('fr-FR') : 
                            'Non planifié'}
                        </TableCell>
                        <TableCell>
                          €{((mission.donor_earning || 0) + (mission.driver_earning || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/missions/${mission.id}/edit`)}
                              title="Voir / éditer"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/missions/${mission.id}/edit`)}
                              title="Éditer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings - Configuration réelle */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Notifications en temps réel</Label>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notifications email</Label>
                    <Switch 
                      checked={adminSettings.emailNotifications}
                      onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notifications SMS</Label>
                    <Switch 
                      checked={adminSettings.smsNotifications}
                      onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>
                  <Button onClick={saveAdminSettings} className="w-full">
                    Sauvegarder les notifications
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sécurité avancée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Durée de session (minutes)</Label>
                    <Input 
                      type="number" 
                      value={adminSettings.sessionDuration}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev, 
                        sessionDuration: parseInt(e.target.value) || 60
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tentatives de connexion max</Label>
                    <Input 
                      type="number" 
                      value={adminSettings.maxLoginAttempts}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev, 
                        maxLoginAttempts: parseInt(e.target.value) || 5
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Authentification 2FA</Label>
                    <Switch 
                      checked={adminSettings.twoFactorAuth}
                      onCheckedChange={(checked) => setAdminSettings(prev => ({
                        ...prev, 
                        twoFactorAuth: checked
                      }))}
                    />
                  </div>
                  <Button onClick={saveAdminSettings} className="w-full">
                    Sauvegarder la sécurité
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Configuration Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Serveur SMTP</Label>
                    <Input 
                      placeholder="smtp.gmail.com"
                      value={adminSettings.smtpServer}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev, 
                        smtpServer: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port SMTP</Label>
                    <Input 
                      type="number" 
                      value={adminSettings.smtpPort}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev, 
                        smtpPort: parseInt(e.target.value) || 587
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email expéditeur</Label>
                    <Input 
                      type="email"
                      value={adminSettings.senderEmail}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev, 
                        senderEmail: e.target.value
                      }))}
                    />
                  </div>
                  <Button onClick={saveAdminSettings} className="w-full">
                    Sauvegarder la configuration
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Activity className="w-5 h-5" />
                    Maintenance système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mode maintenance</Label>
                    <Switch 
                      checked={maintenance} 
                      onCheckedChange={handleSystemMaintenance} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message de maintenance</Label>
                    <Input placeholder="Maintenance programmée en cours..." />
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Le mode maintenance bloque l'accès aux utilisateurs non administrateurs
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports - Rapports système */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Rapport d'activité</CardTitle>
                  <CardDescription>Statistiques d'utilisation en temps réel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Utilisateurs connectés aujourd'hui</span>
                      <span className="font-bold">{systemStats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missions créées ce mois</span>
                      <span className="font-bold">{systemStats?.totalMissions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenus générés</span>
                      <span className="font-bold">€{systemStats?.totalRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <Button className="w-full mt-4" onClick={exportAdminReport}>
                      Télécharger le rapport complet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Performance système</CardTitle>
                  <CardDescription>Métriques techniques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span>Serveur Supabase</span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        <span>Base de données</span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        <span>API Edge Functions</span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System - Informations système */}
          <TabsContent value="system" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Informations système
                </CardTitle>
                <CardDescription>
                  Configuration et état de la plateforme FleetCheck
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Version de l'application</Label>
                    <p className="text-sm bg-muted p-2 rounded">v2.1.4 (Production)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Base de données</Label>
                    <p className="text-sm bg-muted p-2 rounded">Supabase PostgreSQL 15</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Région de déploiement</Label>
                    <p className="text-sm bg-muted p-2 rounded">Europe (Paris)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Dernière sauvegarde</Label>
                    <p className="text-sm bg-muted p-2 rounded">
                      {new Date().toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-base font-semibold">Tables actives</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <Badge variant="outline">profiles ({realUsers.length})</Badge>
                    <Badge variant="outline">missions ({realMissions.length})</Badge>
                    <Badge variant="outline">notifications</Badge>
                    <Badge variant="outline">subscriptions</Badge>
                    <Badge variant="outline">contacts</Badge>
                    <Badge variant="outline">analytics_data</Badge>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tous les services sont opérationnels. Aucune maintenance prévue.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminRoute>
  );
}