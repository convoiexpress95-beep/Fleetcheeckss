import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Search, 
  Phone,
  MoreVertical,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";
import { useState } from "react";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState("1");
  const [newMessage, setNewMessage] = useState("");

  const conversations = [
    {
      id: "1",
      participant: {
        name: "Thomas Martin",
        avatar: "/placeholder-avatar.jpg",
        online: true
      },
      lastMessage: {
        text: "Parfait ! À demain alors 😊",
        time: "14:30",
        unread: false,
        sender: "them"
      },
      trip: {
        departure: "Paris",
        destination: "Lyon",
        date: "15 Mars",
        time: "14:30"
      }
    },
    {
      id: "2",
      participant: {
        name: "Sophie Durand",
        avatar: "/placeholder-avatar.jpg",
        online: false
      },
      lastMessage: {
        text: "Salut ! Je peux prendre 2 bagages ?",
        time: "12:15",
        unread: true,
        sender: "them"
      },
      trip: {
        departure: "Lyon",
        destination: "Marseille",
        date: "20 Mars",
        time: "09:00"
      }
    },
    {
      id: "3",
      participant: {
        name: "Antoine Dubois",
        avatar: "/placeholder-avatar.jpg",
        online: true
      },
      lastMessage: {
        text: "Merci pour la confirmation !",
        time: "10:45",
        unread: false,
        sender: "me"
      },
      trip: {
        departure: "Marseille",
        destination: "Nice",
        date: "22 Mars",
        time: "16:00"
      }
    }
  ];

  const messages = [
    {
      id: "1",
      text: "Salut Marie ! J'ai réservé une place pour le trajet Paris-Lyon de demain.",
      sender: "them",
      time: "14:15",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: "2",
      text: "Parfait Thomas ! Bienvenue à bord 😊 Le rendez-vous est bien à 14h30 Porte de Bagnolet ?",
      sender: "me",
      time: "14:18",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: "3",
      text: "Oui c'est ça ! J'ai une valise moyenne, ça pose problème ?",
      sender: "them",
      time: "14:20",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: "4",
      text: "Aucun souci ! Il y a de la place dans le coffre. À demain !",
      sender: "me",
      time: "14:25",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: "5",
      text: "Parfait ! À demain alors 😊",
      sender: "them",
      time: "14:30",
      avatar: "/placeholder-avatar.jpg"
    }
  ];

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Logique d'envoi du message
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des conversations */}
            <Card className="glass backdrop-blur-lg border border-border/50 shadow-card lg:col-span-1">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une conversation..."
                      className="pl-10"
                    />
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
                                {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.participant.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {conversation.participant.name}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessage.time}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{conversation.trip.departure} → {conversation.trip.destination}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate ${
                                conversation.lastMessage.unread 
                                  ? "font-medium text-foreground" 
                                  : "text-muted-foreground"
                              }`}>
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
            <Card className="glass backdrop-blur-lg border border-border/50 shadow-card lg:col-span-2">
              {selectedConv ? (
                <CardContent className="p-0 flex flex-col h-[600px]">
                  {/* En-tête de la conversation */}
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={selectedConv.participant.avatar} />
                            <AvatarFallback>
                              {selectedConv.participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConv.participant.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {selectedConv.participant.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>{selectedConv.trip.departure} → {selectedConv.trip.destination}</span>
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
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            message.sender === "me" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback>
                              {message.sender === "me" ? "M" : "T"}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`max-w-[70%] ${
                            message.sender === "me" ? "text-right" : ""
                          }`}>
                            <div className={`p-3 rounded-lg ${
                              message.sender === "me"
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-muted text-foreground"
                            }`}>
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {message.time}
                            </div>
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
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
    </div>
  );
};

export default Messages;