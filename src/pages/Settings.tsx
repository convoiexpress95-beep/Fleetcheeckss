import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserAvatar from '@/components/UserAvatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PushNotificationSettings } from '@/components/PushNotificationSettings';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  MapPin, 
  Palette,
  AlertTriangle,
  Camera,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  preferences?: UserSettings;
}

interface UserSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  location_sharing: boolean;
  auto_tracking: boolean;
  dark_mode: boolean;
  language: string;
  timezone: string;
}

const Settings = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    location_sharing: true,
    auto_tracking: false,
    dark_mode: false,
    language: 'fr',
    timezone: 'Europe/Paris'
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Charger le profil utilisateur et les paramètres
  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data as any);
        // Charger les paramètres depuis les métadonnées du profil (as any pour éviter les erreurs TypeScript)
        if ((data as any).preferences) {
          setSettings(prev => ({ ...prev, ...(data as any).preferences }));
        }
        // Déduire et charger l’avatar s’il existe
        await loadExistingAvatar();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Helper: construit une URL (publique ou signée) pour un fichier storage
  const normalizeAvatarKey = (path: string) => {
    let key = path.trim();
    if (/^https?:\/\//i.test(key)) return key; // déjà une URL
    key = key.replace(/^\/+/, '');
    const pubPrefix = `/storage/v1/object/public/avatars/`;
    const fullPrefix = `${(import.meta as any)?.env?.VITE_SUPABASE_URL || ''}${pubPrefix}`;
    if (key.startsWith(fullPrefix)) key = key.slice(fullPrefix.length);
    if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
    if (key.startsWith('avatars/')) key = key.slice('avatars/'.length);
    return key;
  };

  const getAvatarUrl = async (path: string): Promise<string | null> => {
    // Si on reçoit déjà une URL complète (ex: mémorisée précédemment), la réutiliser
    if (/^https?:\/\//i.test(path)) {
      return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    // Essaie publicUrl si bucket public
    const key = normalizeAvatarKey(path);
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(key);
    if (pub?.publicUrl) {
      return `${pub.publicUrl}${pub.publicUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
  // Bucket public: si pas d'URL publique, retourner null
  return null;
  };

  // Charge un avatar existant depuis le bucket (dossier user.id)
  const loadExistingAvatar = async () => {
    if (!user) return;
    try {
      const folder = user.id;
      const { data: files, error } = await supabase.storage
        .from('avatars')
        .list(folder, { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) {
        console.warn('No avatar list or storage error:', error.message);
        return;
      }
      if (!files || files.length === 0) return;

      // cherche un fichier nommé avatar.* sinon prend le plus récent
      const preferred = files.find(f => f.name.startsWith('avatar.')) || files[0];
      const path = `${folder}/${preferred.name}`;
      const url = await getAvatarUrl(path);
      if (url) setPreviewUrl(url);
    } catch (e) {
      console.error('Error loading existing avatar:', e);
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: { ...settings, ...newSettings } as any,
          updated_at: new Date().toISOString()
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    }
  };

  // Sauvegarder le profil
  const saveProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Changer le mot de passe
  const changePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: '', new: '', confirm: '' });
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    setLoading(true);
    try {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${user.id}/avatar.${ext}`;

      // Upload avec type explicite et upsert
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type || 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Tente d'obtenir une URL publique (si le bucket est public)
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);

  // Bucket avatars public: on utilise l'URL publique uniquement
  const finalUrl = pub?.publicUrl || '';

      // Bust cache pour rafraîchir l'aperçu après upsert
      const withCacheBust = finalUrl ? `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : '';

      setPreviewUrl(withCacheBust || URL.createObjectURL(file));

      toast({
        title: 'Avatar mis à jour',
        description: 'Votre photo de profil a été mise à jour.',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erreur',
        description: error?.message || "Impossible de télécharger l'avatar.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer l'avatar (bucket public): on supprime les fichiers avatar.* sinon tout le dossier user.id
  const deleteAvatar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const folder = user.id;
      const { data: files, error } = await supabase.storage
        .from('avatars')
        .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      if (!files || files.length === 0) {
        setPreviewUrl(null);
        toast({ title: 'Aucun avatar', description: "Aucune image à supprimer." });
        return;
      }
      const preferred = files.filter(f => f.name.startsWith('avatar.')).map(f => `${folder}/${f.name}`);
      const targets = preferred.length > 0 ? preferred : files.map(f => `${folder}/${f.name}`);
      const { error: delErr } = await supabase.storage.from('avatars').remove(targets);
      if (delErr) throw delErr;
      setPreviewUrl(null);
      toast({ title: 'Avatar supprimé', description: 'Votre photo de profil a été supprimée.' });
    } catch (e: any) {
      console.error('Error deleting avatar:', e);
      toast({ title: 'Erreur', description: e?.message || "Impossible de supprimer l'avatar.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer le compte
  const deleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Dans un vrai système, on ferait une soft delete ou on garderait les données anonymisées
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-blue-900/30 flex items-center justify-center">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Veuillez vous connecter pour accéder aux paramètres.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-blue-900/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-gradient-cosmic rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-sunset rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="p-3 bg-gradient-cosmic rounded-2xl glow animate-pulse-glow">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-foreground/80 text-lg">
              Gérez votre compte et vos préférences
            </p>
          </div>
        </div>

        {/* Settings Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass-card border-white/10 bg-white/5 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Préférences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card border-white/10 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Informations du profil
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Gérez vos informations personnelles et votre photo de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={previewUrl || undefined} />
                      <AvatarFallback className="bg-gradient-cosmic text-white text-2xl">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <UserAvatar src={previewUrl || undefined} name={profile?.full_name || user.email || ''} className="w-24 h-24" />
                    <div className="absolute -bottom-2 -right-2">
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-cosmic hover:scale-110 transition-all"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full hover:scale-110 transition-all"
                        onClick={deleteAvatar}
                        disabled={loading}
                        title="Supprimer l'avatar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          const url = URL.createObjectURL(file);
                          setPreviewUrl(url);
                          handleAvatarUpload(file);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{profile?.full_name || 'Nom non défini'}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30">
                      Compte actif
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Nom complet</Label>
                    <Input
                      value={profile?.full_name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Email</Label>
                    <Input
                      value={user.email || ''}
                      disabled
                      className="glass-card border-white/20 bg-white/5 text-white opacity-60"
                    />
                  </div>
                </div>

                <Button 
                  onClick={saveProfile} 
                  disabled={loading}
                  className="bg-gradient-cosmic hover:scale-105 transition-all duration-300"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-white/10 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Préférences de notification
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choisissez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'email_notifications', label: 'Notifications par email', description: 'Recevoir des mises à jour par email' },
                  { key: 'push_notifications', label: 'Notifications push', description: 'Notifications en temps réel dans le navigateur' },
                  { key: 'sms_notifications', label: 'Notifications SMS', description: 'Alertes importantes par SMS' },
                  { key: 'location_sharing', label: 'Partage de localisation', description: 'Partager votre position pendant les missions' },
                  { key: 'auto_tracking', label: 'Tracking automatique', description: 'Démarrer automatiquement le GPS en mission' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
                    <div>
                      <Label className="text-white font-medium">{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                     <Switch
                      checked={settings[setting.key as keyof UserSettings] as boolean}
                      onCheckedChange={(checked) => {
                        const newSettings = { [setting.key]: checked };
                        setSettings(prev => ({ ...prev, ...newSettings }));
                        saveSettings(newSettings);
                      }}
                    />
                  </div>
                 ))}
               </CardContent>
             </Card>
             
             {/* Push Notifications Settings */}
             <PushNotificationSettings />
           </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card border-white/10 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Sécurité du compte
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Gérez votre mot de passe et la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Changer le mot de passe</h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Label className="text-foreground">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                          className="glass-card border-white/20 bg-white/5 text-white pr-10"
                          placeholder="Nouveau mot de passe"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Label className="text-foreground">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                          className="glass-card border-white/20 bg-white/5 text-white pr-10"
                          placeholder="Confirmer le mot de passe"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={changePassword} 
                    disabled={loading || !passwords.new || !passwords.confirm}
                    className="bg-gradient-cosmic hover:scale-105 transition-all duration-300"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                    {loading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Logout */}
                <div className="flex justify-between items-center p-4 glass-card border-white/10 rounded-lg">
                  <div>
                    <Label className="text-white font-medium">Se déconnecter</Label>
                    <p className="text-sm text-muted-foreground">Fermer votre session actuelle</p>
                  </div>
                  <Button 
                    onClick={signOut}
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="glass-card border-white/10 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Préférences générales
                </CardTitle>
                <CardDescription className="text-purple-100/70">
                  Personnalisez votre expérience utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-purple-100 mb-2 block">Langue</Label>
                    <Select value={settings.language} onValueChange={(value) => {
                      const newSettings = { language: value };
                      setSettings(prev => ({ ...prev, ...newSettings }));
                      saveSettings(newSettings);
                    }}>
                      <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-100 mb-2 block">Fuseau horaire</Label>
                    <Select value={settings.timezone} onValueChange={(value) => {
                      const newSettings = { timezone: value };
                      setSettings(prev => ({ ...prev, ...newSettings }));
                      saveSettings(newSettings);
                    }}>
                      <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Danger Zone */}
                <Separator className="bg-white/10" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Zone de danger
                  </h3>
                  
                  <Card className="border-red-500/30 bg-red-500/10">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="text-red-200 font-medium">Supprimer le compte</Label>
                          <p className="text-sm text-red-200/70">Cette action est irréversible. Toutes vos données seront perdues.</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-red-500/30">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-400">Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription className="text-red-200/70">
                                Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte
                                et supprimera toutes vos données de nos serveurs.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-white/20 text-purple-100">Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={deleteAccount}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Oui, supprimer mon compte
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;