import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type ChatDrawerProps = {
  missionId: string;
  ownerId: string;
  convoyeurId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ missionId, ownerId, convoyeurId, open, onOpenChange }) => {
  const { user } = useAuth();
  const [convId, setConvId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Array<{ id: string; sender_id: string; content: string; created_at: string }>>([]);
  const [text, setText] = React.useState('');

  const ensureConversation = React.useCallback(async () => {
    if (!user) return;
    // Try to find conversation
  const { data: existing, error: e1 } = await supabase
      .from('conversations')
      .select('id')
      .eq('mission_id', missionId)
      .eq('owner_id', ownerId)
      .eq('convoyeur_id', convoyeurId)
      .maybeSingle();
    if (e1) console.error(e1);
    if (existing?.id) {
      setConvId(existing.id);
      return existing.id;
    }
    // Create
  const { data: created, error: e2 } = await supabase
      .from('conversations')
      .insert({ mission_id: missionId, owner_id: ownerId, convoyeur_id: convoyeurId })
      .select('id')
      .single();
    if (e2) throw e2;
    setConvId(created.id);
    return created.id;
  }, [user, missionId, ownerId, convoyeurId]);

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      const id = await ensureConversation();
      if (!id) return;
  const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    })();
  }, [open, ensureConversation]);

  // Realtime messages
  React.useEffect(() => {
    if (!open || !convId) return;
  const ch = supabase.channel(`rt-conv-${convId}`).on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
      (payload) => {
        const m = payload.new as any;
        setMessages((prev) => [...prev, m]);
      }
    );
    ch.subscribe();
    return () => { ch.unsubscribe(); };
  }, [open, convId]);

  const send = async () => {
    if (!user || !text.trim() || !convId) return;
    const content = text.trim();
    setText('');
  const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, sender_id: user.id, content })
      .select('*')
      .single();
    if (!error && data) setMessages((prev) => [...prev, data]);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Messages</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={`text-sm ${m.sender_id === user?.id ? 'text-right' : ''}`}>
              <div className="inline-block rounded-lg px-3 py-2 bg-muted">{m.content}</div>
              <div className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="p-4 flex gap-2 border-t">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Écrire un message" />
          <Button onClick={send}>Envoyer</Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatDrawer;
