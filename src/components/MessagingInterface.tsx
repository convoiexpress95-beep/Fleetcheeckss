import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle, Euro, AlertTriangle, Download, FileText } from "lucide-react";
import type { Database } from "@/integrations/supabase/types.extended";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FileUploadButton from "./FileUploadButton";

type BaseMessageMetadata = {
  attachment_url?: string;
  attachment_name?: string;
  price?: number;
  originalPrice?: number;
  counterOffer?: number;
};

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  metadata: BaseMessageMetadata | null;
  created_at: string;
  read_at?: string | null;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

interface Conversation {
  id: string;
  mission_id: string;
  owner_id: string;
  convoyeur_id: string;
  last_message?: string;
  updated_at: string;
}

interface MessagingInterfaceProps {
  userId: string;
  userRole: string;
}

const MessagingInterface = ({ userId, userRole }: MessagingInterfaceProps) => {
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

  // (Effet notifications déplacé plus bas après définition des callbacks)

  // (Effets montés plus bas pour éviter l'utilisation avant déclaration)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`*`)
        .or(`owner_id.eq.${userId},convoyeur_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

  if (error) throw error;
  interface RawConversation { id: string; mission_id: string | null; owner_id: string; convoyeur_id: string; last_message?: string | null; updated_at: string }
  const sanitized: Conversation[] = (data || []).map((rcRaw) => {
    const rc = rcRaw as RawConversation;
    return {
      id: rc.id,
      mission_id: rc.mission_id || '',
      owner_id: rc.owner_id,
      convoyeur_id: rc.convoyeur_id,
      last_message: rc.last_message || undefined,
      updated_at: rc.updated_at
    };
  });
  setConversations(sanitized);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userId]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!sender_id (
            full_name,
            email
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

  if (error) throw error;
  interface RawMessage { id: string; content: string; sender_id: string; message_type: string; metadata?: unknown; created_at: string; read_at?: string | null; profiles?: unknown }
  const isProfile = (val: unknown): val is { full_name?: string; email?: string } => {
    return !!val && typeof val === 'object' && !('error' in (val as Record<string, unknown>));
  };
  const safeData: Message[] = (data || []).map(raw => {
    const rm = raw as RawMessage;
    const prof = isProfile(rm.profiles) ? {
      full_name: rm.profiles.full_name || 'Utilisateur',
      email: rm.profiles.email || ''
    } : null;
    return {
      id: rm.id,
      content: rm.content,
      sender_id: rm.sender_id,
      message_type: rm.message_type,
      metadata: (rm.metadata && typeof rm.metadata === 'object') ? rm.metadata as BaseMessageMetadata : null,
      created_at: rm.created_at,
      read_at: rm.read_at,
      profiles: prof
    };
  });
  setMessages(safeData);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    }
  }, [toast]);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('read_at', null)
        .neq('sender_id', userId);
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
    }
  }, [userId]);

  type MessageInsert = Database['public']['Tables']['messages']['Insert'];
  const sendMessage = useCallback(async () => {
    if ((!newMessage.trim() && !attachmentUrl) || !selectedConversation) return;

    setSendingMessage(true);

    try {
      const messageData: MessageInsert = {
        conversation_id: selectedConversation,
        sender_id: userId,
        content: newMessage.trim() || 'Fichier joint',
        message_type: attachmentUrl ? 'attachment' : 'text'
      };

      if (attachmentUrl) {
        const meta: BaseMessageMetadata = {
          attachment_url: attachmentUrl,
          attachment_name: attachmentName || undefined
        };
        messageData.metadata = meta as unknown as MessageInsert['metadata'];
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      setNewMessage("");
      setAttachmentUrl(null);
      setAttachmentName(null);
      await fetchMessages(selectedConversation);
      await fetchConversations(); // Rafraîchir pour mettre à jour le dernier message
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, attachmentUrl, attachmentName, selectedConversation, userId, fetchMessages, fetchConversations, toast]);

  // Effects après définition des callbacks
  // Effets uniques (fetch + scroll)
  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { if (selectedConversation) { fetchMessages(selectedConversation); markMessagesAsRead(selectedConversation); } }, [selectedConversation, fetchMessages, markMessagesAsRead]);
  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const channel = supabase.channel('messages').on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=neq.${userId}`
    }, payload => {
      if (payload.new.conversation_id !== selectedConversation) {
        if (Notification.permission === 'granted') {
          new Notification('Nouveau message', { body: payload.new.content?.substring(0,50)+'...' || 'Vous avez reçu un nouveau message', icon: '/favicon.ico' });
        }
        toast({ title: 'Nouveau message reçu', description: 'Vous avez reçu un nouveau message' });
      }
      fetchConversations();
      if (payload.new.conversation_id === selectedConversation) fetchMessages(selectedConversation);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, selectedConversation, fetchConversations, fetchMessages, toast]);

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    setAttachmentUrl(fileUrl);
    setAttachmentName(fileName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherUserName = (conversation: Conversation) => {
    const isOwner = conversation.owner_id === userId;
    return isOwner ? "Convoyeur" : "Donneur d'ordre";
  };

  const renderMessageContent = (message: Message) => {
    switch (message.message_type) {
      case 'attachment':
        return (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">Fichier joint</span>
            </div>
            <p className="text-sm mb-2">{message.content}</p>
            {message.metadata?.attachment_url && (
              <div className="flex items-center gap-2">
                <a
                  href={message.metadata.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  <Download className="w-3 h-3" />
                  {message.metadata.attachment_name || 'Télécharger le fichier'}
                </a>
              </div>
            )}
          </div>
        );
      
      case 'devis':
        return (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">Nouveau devis</span>
            </div>
            <p className="text-sm">{message.content}</p>
            {message.metadata?.price && (
              <p className="font-bold text-blue-800 dark:text-blue-200 mt-1">
                Prix: {message.metadata.price}€
              </p>
            )}
          </div>
        );
      
      case 'price_contest':
        return (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-800 dark:text-red-200">Contestation de prix</span>
            </div>
            <p className="text-sm">{message.content}</p>
            {message.metadata?.originalPrice && message.metadata?.counterOffer && (
              <div className="mt-2 text-sm">
                <p>Prix original: <span className="line-through">{message.metadata.originalPrice}€</span></p>
                <p>Contre-proposition: <span className="font-bold text-red-800 dark:text-red-200">{message.metadata.counterOffer}€</span></p>
              </div>
            )}
          </div>
        );
      
      case 'system':
        return (
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{message.content}</p>
          </div>
        );
      
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Liste des conversations */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations ({conversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted transition-colors border-b ${
                    selectedConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">
                          {getOtherUserName(conversation)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Mission
                        </Badge>
                      </div>
                      {/* Infos spécifiques marketplace supprimées */}
                      {conversation.last_message && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zone de chat */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? (
              <div>
                <p>Conversation</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {conversations.find(c => c.id === selectedConversation)?.last_message ? 'Conversation active' : 'Conversation'}
                </p>
              </div>
            ) : (
              'Sélectionnez une conversation'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[500px]">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        message.sender_id === userId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      } rounded-lg p-3`}>
                        {renderMessageContent(message)}
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{message.profiles?.full_name || 'Utilisateur'}</span>
                          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />

              {/* Zone de saisie */}
              <div className="p-4">
                {(attachmentUrl || attachmentName) && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Fichier prêt à envoyer: {attachmentName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAttachmentUrl(null);
                          setAttachmentName(null);
                        }}
                        className="h-5 w-5 p-0 ml-auto"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                  />
                  <FileUploadButton
                    onFileUploaded={handleFileUploaded}
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sendingMessage || (!newMessage.trim() && !attachmentUrl)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une conversation pour commencer à discuter</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingInterface;