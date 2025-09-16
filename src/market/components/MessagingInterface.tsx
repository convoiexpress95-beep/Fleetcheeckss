import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FileUploadButton from "./FileUploadButton";
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  metadata: any;
  created_at: string;
  profiles?: { full_name: string; email: string } | null;
}

interface Conversation {
  id: string;
  mission_id: string;
  owner_id: string;
  convoyeur_id: string;
  last_message?: string;
  updated_at: string;
  marketplace_missions?: { titre: string; ville_depart: string; ville_arrivee: string } | null;
}

export default function MessagingInterface({ userId }: { userId: string }) {
  const { balance, isConvoyeurConfirme } = useWallet();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=neq.${userId}` }, async (payload) => {
        if ((payload as any).new.conversation_id !== selectedConversation) {
          toast({ title: 'Nouveau message', description: 'Vous avez reçu un message' });
        }
        await fetchConversations();
        if ((payload as any).new.conversation_id === selectedConversation) await fetchMessages(selectedConversation);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, selectedConversation]);

  useEffect(() => { fetchConversations(); }, [userId]);
  useEffect(() => { if (selectedConversation) { fetchMessages(selectedConversation); markMessagesAsRead(selectedConversation); } }, [selectedConversation]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function fetchConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`*, marketplace_missions ( titre, ville_depart, ville_arrivee )`)
        .or(`owner_id.eq.${userId},convoyeur_id.eq.${userId}`)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setConversations((data as any) || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Chargement des conversations impossible', variant: 'destructive' });
    } finally { setLoading(false); }
  }

  async function fetchMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, profiles!sender_id ( full_name, email )`)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data as any) || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Chargement des messages impossible', variant: 'destructive' });
    }
  }

  async function markMessagesAsRead(conversationId: string) {
    try {
      await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).is('read_at', null).neq('sender_id', userId);
    } catch (e) { console.error(e); }
  }

  async function sendMessage() {
    if ((!newMessage.trim() && !attachmentUrl) || !selectedConversation) return;
    if (isConvoyeurConfirme && balance < 5) {
      toast({ title: 'Crédits insuffisants', description: 'Vous devez avoir au moins 5 crédits pour envoyer un message.', variant: 'destructive' });
      return;
    }
    setSendingMessage(true);
    try {
      const payload: any = { conversation_id: selectedConversation, sender_id: userId, content: newMessage.trim() || 'Fichier joint', message_type: attachmentUrl ? 'attachment' : 'text' };
      if (attachmentUrl) payload.metadata = { attachment_url: attachmentUrl, attachment_name: attachmentName };
      const { error } = await supabase.from('messages').insert(payload);
      if (error) throw error;
      setNewMessage(""); setAttachmentUrl(null); setAttachmentName(null);
      await fetchMessages(selectedConversation); await fetchConversations();
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: "Envoi impossible", variant: 'destructive' });
    } finally { setSendingMessage(false); }
  }

  const handleFileUploaded = (fileUrl: string, fileName: string) => { setAttachmentUrl(fileUrl); setAttachmentName(fileName); };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  if (loading) {
    return (
      <Card className="h-[600px]"><CardContent className="p-6"><div className="animate-pulse space-y-4"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-32 bg-muted rounded" /></div></CardContent></Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" />Conversations ({conversations.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground"><MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />Aucune conversation</div>
            ) : (
              conversations.map((c) => (
                <div key={c.id} className={`p-4 cursor-pointer hover:bg-muted transition-colors border-b ${selectedConversation === c.id ? 'bg-muted' : ''}`} onClick={() => setSelectedConversation(c.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><p className="font-semibold text-sm">{c.owner_id === userId ? 'Convoyeur' : "Donneur d'ordre"}</p><Badge variant="secondary" className="text-xs">Mission</Badge></div>
                      <p className="text-xs text-muted-foreground mb-2">{c.marketplace_missions?.titre || 'Transport de véhicule'}</p>
                      {c.marketplace_missions && (<p className="text-xs text-muted-foreground mb-1">{c.marketplace_missions.ville_depart} → {c.marketplace_missions.ville_arrivee}</p>)}
                      {c.last_message && (<p className="text-xs text-muted-foreground truncate">{c.last_message}</p>)}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: fr })}</div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>{selectedConversation ? (<div><p>Conversation</p><p className="text-sm font-normal text-muted-foreground">{conversations.find(x => x.id === selectedConversation)?.marketplace_missions?.titre || 'Mission de transport'}</p></div>) : ('Sélectionnez une conversation')}</CardTitle></CardHeader>
        <CardContent className="p-0 flex flex-col h-[500px]">
          {isConvoyeurConfirme && balance < 5 && (
            <div className="mx-4 mt-4 mb-0 p-3 rounded-md border border-amber-300/40 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
              Vous devez disposer d’au moins 5 crédits pour envoyer des messages en tant que convoyeur. 
              <Link to="/verification" className="underline font-medium ml-1">Vérifier mon profil</Link>
            </div>
          )}
          {selectedConversation ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${m.sender_id === userId ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                        {m.message_type === 'attachment' ? (
                          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-blue-600" /><span className="font-semibold text-blue-800 dark:text-blue-200">Fichier joint</span></div>
                            <p className="text-sm mb-2">{m.content}</p>
                            {m.metadata?.attachment_url && (
                              <a href={m.metadata.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm underline">{m.metadata.attachment_name || 'Télécharger le fichier'}</a>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{m.content}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{m.profiles?.full_name || 'Utilisateur'}</span>
                          <span>{formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />
              <div className="p-4">
                {(attachmentUrl || attachmentName) && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Fichier prêt à envoyer: {attachmentName}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setAttachmentUrl(null); setAttachmentName(null); }} className="h-5 w-5 p-0 ml-auto">×</Button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input placeholder="Tapez votre message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={sendingMessage} />
                  <FileUploadButton onFileUploaded={handleFileUploaded} disabled={sendingMessage} />
                  <Button onClick={sendMessage} disabled={sendingMessage || (!newMessage.trim() && !attachmentUrl) || (isConvoyeurConfirme && balance < 5)}>
                    <Send className="w-4 h-4 mr-2" /> Envoyer
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Sélectionnez une conversation</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
