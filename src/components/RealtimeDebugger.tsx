import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  MessageSquare, 
  Car, 
  Truck, 
  Users, 
  Database,
  Wifi,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const RTC_DEBUG = import.meta.env.VITE_RTC_DEBUG === '1';

export const RealtimeDebugger: React.FC = () => {
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useRealtime();
  const { toast } = useToast();
  
  const [testMessage, setTestMessage] = useState('Hello Realtime!');
  const [channelStatus, setChannelStatus] = useState<Record<string, string>>({});
  const [liveEvents, setLiveEvents] = useState<Array<{ time: string; type: string; data: any }>>([]);
  const [dbStats, setDbStats] = useState<any>(null);

  // Test des principales tables realtime
  const [testChannels] = useState([
    { name: 'messages', table: 'messages', event: 'INSERT' },
    { name: 'rides', table: 'rides', event: '*' },
    { name: 'missions', table: 'marketplace_missions', event: '*' },
    { name: 'profiles', table: 'profiles', event: 'UPDATE' },
    { name: 'credits', table: 'credits_ledger', event: 'INSERT' }
  ]);

  useEffect(() => {
    if (!user || !isConnected) return;

    // Créer des channels de test pour chaque table
    const channels = testChannels.map(({ name, table, event }) => {
      const channel = supabase
        .channel(`debug-${name}`)
        .on('postgres_changes', { 
          event: event as any, 
          schema: 'public', 
          table,
          filter: event !== '*' ? `sender_id=neq.${user.id}` : undefined
        }, (payload) => {
          setLiveEvents(prev => [{
            time: new Date().toLocaleTimeString(),
            type: `${table}.${payload.eventType}`,
            data: payload.new || payload.old || payload
          }, ...prev.slice(0, 19)]); // Garder 20 derniers événements
        });

      channel.subscribe((status) => {
        setChannelStatus(prev => ({ ...prev, [name]: status }));
        if (RTC_DEBUG) console.debug(`[RTC Debug] Channel ${name}:`, status);
      });

      return { name, channel };
    });

    return () => {
      channels.forEach(({ channel }) => supabase.removeChannel(channel));
    };
  }, [user, isConnected]);

  // Stats de base de données
  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        const [profiles, messages, rides, missions] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('messages').select('id', { count: 'exact', head: true }),
          supabase.from('rides').select('id', { count: 'exact', head: true }),
          supabase.from('marketplace_missions').select('id', { count: 'exact', head: true })
        ]);

        setDbStats({
          profiles: profiles.count || 0,
          messages: messages.count || 0,
          rides: rides.count || 0,
          missions: missions.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Actualiser toutes les 30s
    return () => clearInterval(interval);
  }, [user]);

  const testProfileUpsert = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id,
          email: user.email || '',
          full_name: `Test ${Date.now()}`,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      toast({
        title: 'Test profil OK',
        description: 'Upsert profil réussi sans erreur 409',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur test profil',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const testMessageSend = async () => {
    if (!user || !testMessage.trim()) return;
    
    try {
      // Créer une conversation de test
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (!conv && !convError) {
        toast({
          title: 'Pas de conversation',
          description: 'Créez d\'abord une mission/conversation pour tester',
          variant: 'destructive'
        });
        return;
      }
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conv!.id,
          sender_id: user.id,
          content: testMessage,
          message_type: 'text'
        });
      
      if (error) throw error;
      
      toast({
        title: 'Message envoyé',
        description: 'Test envoi message realtime OK',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur envoi message',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getChannelStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CHANNEL_ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'TIMED_OUT': return <Clock className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Connectez-vous pour accéder au debugger realtime</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            État Connexion Realtime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Statut: </span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {connectionStatus}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            {testChannels.map(({ name }) => (
              <div key={name} className="flex items-center gap-2">
                {getChannelStatusIcon(channelStatus[name] || 'CLOSED')}
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {dbStats && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Statistiques Base de Données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Profils: {dbStats.profiles}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Messages: {dbStats.messages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span className="text-sm">Trajets: {dbStats.rides}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span className="text-sm">Missions: {dbStats.missions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Tests Fonctionnels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={testProfileUpsert} variant="outline">
              Tester Profil Upsert
            </Button>
            <span className="text-sm text-muted-foreground">Test fix erreur 409</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Message de test"
              className="flex-1"
            />
            <Button onClick={testMessageSend}>
              Envoyer Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Événements Temps Réel (Live)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {liveEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun événement détecté</p>
            ) : (
              liveEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                  <Badge variant="outline" className="text-xs">
                    {event.time}
                  </Badge>
                  <span className="font-medium">{event.type}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-muted-foreground truncate">
                    {JSON.stringify(event.data).substring(0, 100)}...
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};