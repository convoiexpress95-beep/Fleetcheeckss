import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatDrawer from '@/components/ChatDrawer';
import { MessageCircle, RefreshCw } from 'lucide-react';

type Conversation = {
  id: string;
  mission_id: string | null;
  owner_id: string;
  convoyeur_id: string;
  created_at: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
};

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [lastMessages, setLastMessages] = React.useState<Record<string, Message | undefined>>({});
  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({});
  const [openChat, setOpenChat] = React.useState<{ conversationId?: string; missionId: string; ownerId: string; convoyeurId: string } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`owner_id.eq.${user.id},convoyeur_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      const list = (convs || []) as unknown as Conversation[];
      setConversations(list);
      // Fetch last message + unread count per conversation
      const mapLast: Record<string, Message | undefined> = {};
      const mapUnread: Record<string, number> = {};
      for (const c of list) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1);
        mapLast[c.id] = (msgs || [])[0] as any;
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', c.id)
          .neq('sender_id', user.id);
        mapUnread[c.id] = count || 0;
      }
      setLastMessages(mapLast);
      setUnreadCounts(mapUnread);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('rt-messages').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      () => load()
    );
    channel.subscribe();
    return () => { channel.unsubscribe(); };
  }, [user, load]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent">Messages</h1>
            <p className="text-muted-foreground">Discutez avec les donneurs et convoyeurs</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1"/>Rafraîchir</Button>
          </div>
        </div>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Chargement…</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucune conversation</div>
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => {
                  const lm = lastMessages[c.id];
                  const unread = unreadCounts[c.id] || 0;
                  const ownerId = c.owner_id;
                  const convoyeurId = c.convoyeur_id;
                  return (
                    <div key={c.id} className="flex items-center justify-between border rounded-lg p-3 bg-card">
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">Conversation</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {lm ? lm.content : '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unread > 0 && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{unread} non lus</span>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => setOpenChat({ missionId: c.mission_id || '', ownerId, convoyeurId })}>Ouvrir</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {openChat && (
        <ChatDrawer
          missionId={openChat.missionId}
          ownerId={openChat.ownerId}
          convoyeurId={openChat.convoyeurId}
          open={!!openChat}
          onOpenChange={(o) => !o ? setOpenChat(null) : void 0}
        />
      )}
    </div>
  );
};

export default MessagesPage;
