import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, Send, ArrowLeft, Phone, MapPin, 
  Calendar, Car, Euro, Paperclip, Image as ImageIcon,
  Clock, CheckCheck, Check, MoreVertical, Star,
  Shield, Award, User, AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'convoyeur';
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
}

interface Conversation {
  id: string;
  missionId: string;
  missionTitle: string;
  clientId: string;
  clientName: string;
  convoyeurId: string;
  convoyeurName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'completed' | 'archived';
  missionDetails: {
    route: string;
    date: string;
    price: number;
    vehicleType: string;
  };
}

const MarketplaceMessages = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userType = user?.user_metadata?.user_type || "convoyeur";
  const isConvoyeur = userType === "convoyeur";

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        fetchMessages(conversationId);
      }
    } else if (conversations.length > 0 && !activeConversation) {
      // Sélectionner la première conversation si aucune n'est active
      setActiveConversation(conversations[0]);
      fetchMessages(conversations[0].id);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      // Mock conversations
      const mockConversations: Conversation[] = [
        {
          id: "1",
          missionId: "m1", 
          missionTitle: "Transport BMW X5 - Paris vers Monaco",
          clientId: "c1",
          clientName: "Premium Cars SARL",
          convoyeurId: "cv1", 
          convoyeurName: "Jean Dupont",
          lastMessage: "Parfait, je confirme le rendez-vous pour 8h demain matin.",
          lastMessageTime: "2025-09-15T16:30:00Z",
          unreadCount: isConvoyeur ? 1 : 0,
          status: "active",
          missionDetails: {
            route: "Paris → Monaco",
            date: "2025-09-20",
            price: 1200,
            vehicleType: "BMW X5"
          }
        },
        {
          id: "2",
          missionId: "m2",
          missionTitle: "Transport Mercedes Classe S - Lyon vers Genève", 
          clientId: "c2",
          clientName: "AutoNeuf Distribution",
          convoyeurId: "cv1",
          convoyeurName: "Jean Dupont", 
          lastMessage: "Mission terminée avec succès ! Merci pour votre confiance.",
          lastMessageTime: "2025-09-14T18:45:00Z",
          unreadCount: 0,
          status: "completed",
          missionDetails: {
            route: "Lyon → Genève",
            date: "2025-09-14",
            price: 800,
            vehicleType: "Mercedes Classe S"
          }
        },
        {
          id: "3",
          missionId: "m3",
          missionTitle: "Transport Audi A6 - Marseille vers Nice",
          clientId: "c3", 
          clientName: "Société Martin",
          convoyeurId: "cv1",
          convoyeurName: "Jean Dupont",
          lastMessage: "Pouvez-vous confirmer l'heure de prise en charge ?",
          lastMessageTime: "2025-09-13T10:15:00Z", 
          unreadCount: isConvoyeur ? 0 : 2,
          status: "active",
          missionDetails: {
            route: "Marseille → Nice", 
            date: "2025-09-18",
            price: 450,
            vehicleType: "Audi A6"
          }
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      // Mock messages pour la conversation
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: "c1",
          senderName: "Premium Cars SARL",
          senderType: "client",
          content: "Bonjour Jean, j'ai vu votre candidature pour le transport de notre BMW X5. Votre profil semble parfait pour cette mission.",
          timestamp: "2025-09-15T08:00:00Z",
          read: true,
          type: "text"
        },
        {
          id: "2", 
          senderId: "cv1",
          senderName: "Jean Dupont",
          senderType: "convoyeur",
          content: "Bonjour ! Merci pour votre retour. J'ai effectivement beaucoup d'expérience avec les véhicules de luxe. Je peux garantir un transport en toute sécurité.",
          timestamp: "2025-09-15T08:15:00Z", 
          read: true,
          type: "text"
        },
        {
          id: "3",
          senderId: "c1", 
          senderName: "Premium Cars SARL",
          senderType: "client",
          content: "Excellent ! Pouvez-vous confirmer votre disponibilité pour demain matin vers 8h ? Le véhicule se trouve dans notre showroom du 15ème arrondissement.",
          timestamp: "2025-09-15T09:30:00Z",
          read: true, 
          type: "text"
        },
        {
          id: "4",
          senderId: "cv1",
          senderName: "Jean Dupont", 
          senderType: "convoyeur",
          content: "Parfait, je confirme le rendez-vous pour 8h demain matin. Pouvez-vous m'envoyer l'adresse exacte du showroom s'il vous plaît ?",
          timestamp: "2025-09-15T10:00:00Z",
          read: true,
          type: "text"
        },
        {
          id: "5",
          senderId: "c1",
          senderName: "Premium Cars SARL", 
          senderType: "client",
          content: "123 Rue de Vaugirard, 75015 Paris. Demandez Mr. Martin à l'accueil. Merci !",
          timestamp: "2025-09-15T16:30:00Z",
          read: !isConvoyeur,
          type: "text"
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user?.id || "current_user", 
        senderName: isConvoyeur ? "Jean Dupont" : "Client",
        senderType: isConvoyeur ? "convoyeur" : "client",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        type: "text"
      };

      setMessages(prev => [...prev, message]);
      setNewMessage("");

      // Mettre à jour la dernière conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id
            ? { ...conv, lastMessage: message.content, lastMessageTime: message.timestamp }
            : conv
        )
      );

    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
      completed: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      archived: "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
    };

    const labels = {
      active: "Active",
      completed: "Terminée", 
      archived: "Archivée"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-20 bg-white/10 rounded-2xl mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
              <div className="bg-white/10 rounded-2xl"></div>
              <div className="lg:col-span-2 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/marketplace")}
            className="glass-card text-foreground border-border hover:bg-accent/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Marketplace
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-white/70">Communication avec vos clients et convoyeurs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  Conversations ({conversations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-2 p-4">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setActiveConversation(conversation);
                          fetchMessages(conversation.id);
                        }}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          activeConversation?.id === conversation.id
                            ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/30'
                            : 'bg-gray-700/30 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white text-sm truncate">
                                {isConvoyeur ? conversation.clientName : conversation.convoyeurName}
                              </h4>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/60 text-xs truncate">{conversation.missionTitle}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-white/50 text-xs">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                            {getStatusBadge(conversation.status)}
                          </div>
                        </div>
                        
                        <p className="text-white/70 text-sm truncate mb-2">
                          {conversation.lastMessage}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {conversation.missionDetails.route}
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="w-3 h-3" />
                            {conversation.missionDetails.price}€
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Zone de conversation */}
          <div className="lg:col-span-2">
            {activeConversation ? (
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 h-full flex flex-col">
                {/* Header de la conversation */}
                <CardHeader className="border-b border-gray-600/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                          {(isConvoyeur ? activeConversation.clientName : activeConversation.convoyeurName)
                            .split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white">
                          {isConvoyeur ? activeConversation.clientName : activeConversation.convoyeurName}
                        </h3>
                        <p className="text-white/60 text-sm">{activeConversation.missionTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Infos mission */}
                  <div className="flex items-center gap-4 text-sm text-white/70 pt-2 border-t border-gray-600/40">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {activeConversation.missionDetails.route}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(activeConversation.missionDetails.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {activeConversation.missionDetails.vehicleType}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {activeConversation.missionDetails.price}€
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-460px)] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = (isConvoyeur && message.senderType === 'convoyeur') || 
                                           (!isConvoyeur && message.senderType === 'client');
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${
                              isOwnMessage 
                                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' 
                                : 'bg-white/10 text-white'
                            } rounded-2xl p-3`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div className={`flex items-center gap-2 mt-2 ${
                                isOwnMessage ? 'justify-end' : 'justify-start'
                              }`}>
                                <span className={`text-xs ${
                                  isOwnMessage ? 'text-white/80' : 'text-white/60'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </span>
                                {isOwnMessage && (
                                  <div className="flex items-center">
                                    {message.read ? (
                                      <CheckCheck className="w-3 h-3 text-white/80" />
                                    ) : (
                                      <Check className="w-3 h-3 text-white/60" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Zone de saisie */}
                <div className="border-t border-gray-600/40 p-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-12"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/50 h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-white/70">
                    Choisissez une conversation pour commencer à échanger
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceMessages;
