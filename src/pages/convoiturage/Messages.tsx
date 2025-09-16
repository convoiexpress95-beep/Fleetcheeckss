import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Phone, MoreVertical, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ConversationItem, UIMessageItem, Ride, RideMessageRow } from "../../types/convoiturage";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<UIMessageItem[]>([]);
  const { user } = useAuth();

  // Load rides where user is participant (driver or passenger)
  useEffect(()=>{
    const loadConversations = async () => {
      if(!user?.id){ setConversations([]); return; }
      type RideReservation = { ride_id: string };
      const { data: asDriver } = await supabase.from('rides').select('*').eq('driver_id', user.id).limit(20) as { data: Ride[] | null };
      const { data: asPassenger } = await supabase
        .from('ride_reservations')
        .select('ride_id')
        .eq('passenger_id', user.id)
        .limit(50) as { data: RideReservation[] | null };
      const rideIds = new Set<string>();
      (asDriver||[]).forEach(r=>r && rideIds.add(r.id));
      (asPassenger||[]).forEach(r=>r && rideIds.add(r.ride_id));
      const ids = Array.from(rideIds);
      if (!ids.length) { setConversations([]); return; }
      const { data: rides } = await supabase.from('rides').select('*').in('id', ids).order('departure_time',{ascending:false}) as { data: Ride[] | null };
    const mapped: ConversationItem[] = (rides||[]).map(r=>({
        id: r.id,
        participant: { name: 'Participant', avatar: '/placeholder-avatar.jpg', online: false },
        lastMessage: { text: '', time: '', unread: false, sender: 'them' },
        trip: {
      id: r.id,
          departure: r.departure,
          destination: r.destination,
          date: new Date(r.departure_time).toLocaleDateString('fr-FR'),
            time: new Date(r.departure_time).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
        },
      }));
      setConversations(mapped);
      if (!selectedConversation && mapped.length) setSelectedConversation(mapped[0].id);
    };
    loadConversations();
  }, [user?.id, selectedConversation]);

  // Load messages for selected conversation
  useEffect(()=>{
    if (!selectedConversation) { setMessages([]); return; }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('ride_messages')
        .select('*')
        .eq('ride_id', selectedConversation)
        .order('created_at',{ascending:true}) as { data: RideMessageRow[] | null };
      if (active) setMessages((data||[]).map(m=>({
        id: m.id,
        text: m.content,
        sender: m.sender_id === user?.id ? 'me' : 'them',
        time: new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
        avatar: '/placeholder-avatar.jpg'
      })));
    };
    load();
    const ch = supabase
      .channel(`rt:ride_messages:${selectedConversation}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `ride_id=eq.${selectedConversation}` }, (payload:{ new?: RideMessageRow })=>{
        const m = payload.new;
        if(!m) return;
        setMessages(prev => [...prev, {
          id: m.id,
          text: m.content,
          sender: m.sender_id === user?.id ? 'me' : 'them',
          time: new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
          avatar: '/placeholder-avatar.jpg'
        }]);
      })
      .subscribe();
    return ()=>{ active = false; supabase.removeChannel(ch); };
  }, [selectedConversation, user?.id]);

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
  await supabase.from('ride_messages').insert({ ride_id: selectedConversation, sender_id: user.id, content: newMessage.trim() });
    setNewMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <Card className="glass-card border border-border/50 shadow-card lg:col-span-1">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher une conversation..." className="pl-10" />
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="p-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedConversation === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.participant.avatar} />
                            <AvatarFallback>
                              {conversation.participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.participant.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{conversation.participant.name}</h3>
                            <span className="text-xs text-muted-foreground">{conversation.lastMessage.time}</span>
                          </div>

                          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {conversation.trip.departure} → {conversation.trip.destination}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm truncate ${
                                conversation.lastMessage.unread ? "font-medium text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {conversation.lastMessage.text}
                            </p>
                            {conversation.lastMessage.unread && (
                              <Badge className="w-2 h-2 p-0 bg-primary"></Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversation active */}
          <Card className="glass-card border border-border/50 shadow-card lg:col-span-2">
            {selectedConv ? (
              <CardContent className="p-0 flex flex-col h-[600px]">
                {/* En-tête */}
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConv.participant.avatar} />
                          <AvatarFallback>
                            {selectedConv.participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConv.participant.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>
                            {selectedConv.trip.departure} → {selectedConv.trip.destination}
                          </span>
                          <span>•</span>
                          <span>{selectedConv.trip.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex items-start gap-3 ${message.sender === "me" ? "flex-row-reverse" : ""}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.avatar} />
                          <AvatarFallback>{message.sender === "me" ? "M" : "T"}</AvatarFallback>
                        </Avatar>

                        <div className={`max-w-[70%] ${message.sender === "me" ? "text-right" : ""}`}>
                          <div className={`p-3 rounded-lg ${message.sender === "me" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{message.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                  <p>Choisissez une conversation dans la liste pour commencer à discuter</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
