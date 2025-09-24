import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useMyContacts, 
  useAddContact
} from '@/hooks/useContacts';
import { useSearchProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarFallback } from '@/components/ui/avatar'; // Legacy fallback gardé si besoin ailleurs
import UserAvatar from '@/components/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Plus, Search, Users, Mail, 
  ClipboardList, UserPlus, Activity, Clock, 
  Calendar, Target, Briefcase, Phone, MapPin,
  MessageSquare, UserCheck, Filter, 
  MoreHorizontal, Edit3, Trash2, Send,
  CheckCircle, XCircle, AlertCircle, Globe
} from 'lucide-react';

interface Contact {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'active';
  invited_user_id: string | null;
  invited_at: string;
  accepted_at?: string | null;
  declined_at?: string | null;
  created_at: string;
  updated_at: string;
  missions_count?: number;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  is_convoyeur_confirme?: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const ContactsManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInvite, setEmailInvite] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { data: contactsData, isLoading: contactsLoading } = useMyContacts(0, 100, searchQuery);
  const { data: profileResults } = useSearchProfiles(emailInvite);
  const addContact = useAddContact();

  const contacts = contactsData?.data || [];
  const pendingContacts = contacts.filter(c => c.status === 'pending');
  const acceptedContacts = contacts.filter(c => c.status === 'accepted' || c.status === 'active');

  // Charger tous les profils utilisateurs
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user) return;
      
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('user_id', user.id)
          .order('full_name', { ascending: true });

        if (error) throw error;

        // Projection typée sans champs non existants (verification_status n'existe pas dans le schéma actuel)
        setAllProfiles((profiles || []) as unknown as Profile[]);
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('[RTC] Profile change:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newProfile = payload.new as Profile;
          if (newProfile.user_id !== user?.id) {
            setAllProfiles(prev => [...prev, newProfile]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedProfile = payload.new as Profile;
          setAllProfiles(prev => prev.map(p => 
            p.user_id === updatedProfile.user_id ? updatedProfile : p
          ));
        } else if (payload.eventType === 'DELETE') {
          const deletedProfile = payload.old as Profile;
          setAllProfiles(prev => prev.filter(p => p.user_id !== deletedProfile.user_id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filtrer les profils
  const filteredProfiles = allProfiles.filter(profile => {
    const matchesSearch = !searchQuery || 
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'verified' && !!profile.is_convoyeur_confirme) ||
      (selectedStatus === 'pending' && !profile.is_convoyeur_confirme);
    
    return matchesSearch && matchesStatus;
  });

  const handleInviteContact = async (email: string, name: string) => {
    try {
      await addContact.mutateAsync({
        email,
        name: name || email.split('@')[0],
      });
      setEmailInvite('');
    } catch (error) {
      console.error('Error inviting contact:', error);
    }
  };

  const handleCreateMission = (contact: Profile | Contact) => {
    const queryParams = new URLSearchParams({
      assigned_to: 'contact',
      assigned_contact_id: contact.id,
      assigned_contact_name: 'name' in contact ? (contact.name || contact.email.split('@')[0]) : (contact.full_name || contact.email.split('@')[0]),
      assigned_contact_email: contact.email
    });
    
    navigate(`/missions/new?${queryParams.toString()}`);
  };

  const getStatusBadge = (status: Contact['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'accepted':
      case 'active':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Accepté</Badge>;
      case 'declined':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Refusé</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative bg-slate-900/70 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white">
                    <Link to="/dashboard">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </Link>
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Gestion des Contacts
                      </h1>
                      <p className="text-slate-400">
                        Gérez votre réseau professionnel et vos collaborations
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats rapides */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{allProfiles.length}</div>
                    <div className="text-slate-400">Profils</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-teal-400">{acceptedContacts.length}</div>
                    <div className="text-slate-400">Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{pendingContacts.length}</div>
                    <div className="text-slate-400">En attente</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-slate-800/50 border-slate-700/50">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Tous les profils ({allProfiles.length})
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Mes contacts ({acceptedContacts.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Invitations ({pendingContacts.length})
              </TabsTrigger>
              <TabsTrigger value="invite" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Inviter
              </TabsTrigger>
            </TabsList>

            {/* Filtres et recherche */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400"
                />
              </div>
              
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-md text-white text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="verified">Vérifiés uniquement</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>

          {/* Contenu des onglets */}
          <TabsContent value="all" className="mt-0">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Tous les Profils ({filteredProfiles.length})</CardTitle>
                <CardDescription className="text-slate-400">
                  Liste complète des utilisateurs de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="ml-3 text-slate-400">Chargement...</span>
                  </div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {searchQuery ? 'Aucun résultat' : 'Aucun profil trouvé'}
                    </h3>
                    <p className="text-slate-400">
                      {searchQuery ? `Aucun profil ne correspond à "${searchQuery}"` : 'Aucun utilisateur enregistré'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProfiles.map((profile) => (
                      <Card key={profile.user_id} className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all duration-300 group">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <UserAvatar src={profile.avatar_url || undefined} name={profile.full_name || profile.email} className="w-12 h-12 ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all" />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white text-sm truncate">
                                  {profile.full_name || profile.email.split('@')[0]}
                                </h3>
                                {profile.is_convoyeur_confirme && (
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                                    Vérifié
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-slate-400 text-xs truncate mb-2">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {profile.email}
                              </p>
                              
                              {profile.location && (
                                <p className="text-slate-400 text-xs truncate mb-1">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {profile.location}
                                </p>
                              )}
                              
                              {profile.phone && (
                                <p className="text-slate-400 text-xs truncate">
                                  <Phone className="w-3 h-3 inline mr-1" />
                                  {profile.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="outline" className="flex-1 h-8 bg-slate-600/50 border-slate-500/50 text-white hover:bg-blue-500/20">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" onClick={() => handleCreateMission(profile)} className="flex-1 h-8 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                              <ClipboardList className="w-3 h-3 mr-1" />
                              Mission
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Mes Contacts ({acceptedContacts.length})</CardTitle>
                <CardDescription className="text-slate-400">
                  Vos contacts confirmés et collaborateurs actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Aucun contact confirmé</h3>
                    <p className="text-slate-400 mb-4">Commencez par inviter des collaborateurs</p>
                    <Button onClick={() => setActiveTab('invite')} className="bg-gradient-to-r from-blue-500 to-teal-500">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Inviter un contact
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedContacts.map((contact) => (
                      <Card key={contact.id} className="bg-slate-700/30 border-slate-600/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <UserAvatar className="w-10 h-10" name={contact.name || contact.email} />
                              <div>
                                <h3 className="font-semibold text-white">
                                  {contact.name || contact.email.split('@')[0]}
                                </h3>
                                <p className="text-slate-400 text-sm">{contact.email}</p>
                                {contact.accepted_at && (
                                  <p className="text-slate-500 text-xs">
                                    Accepté le {new Date(contact.accepted_at).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getStatusBadge(contact.status)}
                              <Button size="sm" onClick={() => handleCreateMission(contact)}>
                                <ClipboardList className="w-3 h-3 mr-1" />
                                Mission
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Invitations en attente ({pendingContacts.length})</CardTitle>
                <CardDescription className="text-slate-400">
                  Invitations envoyées en attente de réponse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Aucune invitation en attente</h3>
                    <p className="text-slate-400">Toutes vos invitations ont été traitées</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingContacts.map((contact) => (
                      <Card key={contact.id} className="bg-slate-700/30 border-slate-600/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <UserAvatar className="w-10 h-10" name={contact.name || contact.email} />
                              <div>
                                <h3 className="font-semibold text-white">
                                  {contact.name || contact.email.split('@')[0]}
                                </h3>
                                <p className="text-slate-400 text-sm">{contact.email}</p>
                                <p className="text-slate-500 text-xs">
                                  Invité le {new Date(contact.invited_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getStatusBadge(contact.status)}
                              <Button size="sm" variant="outline">
                                <Send className="w-3 h-3 mr-1" />
                                Relancer
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite" className="mt-0">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Inviter un nouveau contact</CardTitle>
                <CardDescription className="text-slate-400">
                  Recherchez et invitez de nouveaux collaborateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        value={emailInvite}
                        onChange={(e) => setEmailInvite(e.target.value)}
                        placeholder="contact@exemple.com"
                        className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {emailInvite && profileResults && profileResults.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-slate-200 text-sm">Suggestions :</Label>
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {profileResults.map(profile => (
                          <Card 
                            key={profile.id} 
                            className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all cursor-pointer"
                            onClick={() => handleInviteContact(profile.email, profile.full_name || profile.email.split('@')[0])}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <UserAvatar className="w-8 h-8" name={profile.full_name || profile.email} />
                                  <div>
                                    <p className="font-semibold text-white text-sm">
                                      {profile.full_name || profile.email.split('@')[0]}
                                    </p>
                                    <p className="text-slate-400 text-xs">{profile.email}</p>
                                  </div>
                                </div>
                                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-blue-500">
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Inviter
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => emailInvite && handleInviteContact(emailInvite, emailInvite.split('@')[0])}
                    disabled={!emailInvite || addContact.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                  >
                    {addContact.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer l'invitation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContactsManager;