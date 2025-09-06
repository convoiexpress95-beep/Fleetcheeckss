import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useMyContacts, 
  useIncomingInvitations, 
  useAcceptInvitation,
  useDeclineInvitation,
  useSendInvitation,
  useAddContact,
  useCancelContact
} from '@/hooks/useContacts';
import { useSearchProfiles } from '@/hooks/useProfiles';
import { statusMappings } from '@/lib/mappings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, Users, Mail, Check, X, Send, Trash2, Filter, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

const Contacts = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending' | 'declined'>('all');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [profileSearch, setProfileSearch] = useState('');
  
  const { data: contactsData, isLoading: contactsLoading } = useMyContacts(page, pageSize, search);
  const { data: invitations, isLoading: invitationsLoading } = useIncomingInvitations();
  const { data: profileResults } = useSearchProfiles(profileSearch);
  
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();
  const sendInvitation = useSendInvitation();
  const addContact = useAddContact();
  const cancelContact = useCancelContact();

  const handleAddContact = async (profileId?: string) => {
    if (!newContactEmail) return;
    
    try {
      if (profileId) {
        // User exists - add directly
        await addContact.mutateAsync({
          email: newContactEmail,
          name: newContactName || newContactEmail,
          invitedUserId: profileId
        });
      } else {
        // User doesn't exist - send invitation via edge function
        await sendInvitation.mutateAsync({
          email: newContactEmail,
          name: newContactName || newContactEmail
        });
      }
      
      setNewContactEmail('');
      setNewContactName('');
      setProfileSearch('');
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const filteredContacts = useMemo(() => {
    const list = contactsData?.data || [];
    if (statusFilter === 'all') return list;
    return list.filter((c) => c.status === statusFilter);
  }, [contactsData, statusFilter]);

  const total = contactsData?.count || 0;
  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const hasPrev = page > 0;
  const hasNext = page < maxPage;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent">
                Réseau Premium
              </h1>
              <p className="text-muted-foreground">
                Gérez votre réseau de contacts et invitations avec style
              </p>
            </div>
          </div>
        </div>

    <Tabs defaultValue="my-contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="my-contacts">
      Mes contacts ({contactsData?.count || 0})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations ({invitations?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="add-contact">
              Ajouter un contact
            </TabsTrigger>
          </TabsList>

          {/* Add Contact Tab */}
          <TabsContent value="add-contact">
            <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-royal bg-clip-text text-transparent">
                  Ajouter un nouveau contact
                </CardTitle>
                <CardDescription>
                  Recherchez un utilisateur par email ou invitez une nouvelle personne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => {
                        setNewContactEmail(e.target.value);
                        setProfileSearch(e.target.value);
                      }}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom (optionnel)</Label>
                    <Input
                      id="name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="Nom du contact"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {profileResults && profileResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Utilisateurs trouvés :</Label>
                    <div className="space-y-2">
                      {profileResults.map(profile => (
                        <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleAddContact(profile.id)}
                            disabled={addContact.isPending}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button 
                    onClick={() => handleAddContact()}
                    disabled={!newContactEmail || sendInvitation.isPending}
                    className="bg-gradient-royal hover:opacity-90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {profileResults?.length ? 'Envoyer invitation' : 'Inviter par email'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-contacts">
            <div className="space-y-6">
              {/* Search */}
              <Card className="glass-card border-border/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher dans mes contacts..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(0);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <div className="flex gap-2">
                        <Button variant={statusFilter==='all'? 'default':'outline'} size="sm" onClick={() => setStatusFilter('all')}>Tous</Button>
                        <Button variant={statusFilter==='accepted'? 'default':'outline'} size="sm" onClick={() => setStatusFilter('accepted')}>Acceptés</Button>
                        <Button variant={statusFilter==='pending'? 'default':'outline'} size="sm" onClick={() => setStatusFilter('pending')}>En attente</Button>
                        <Button variant={statusFilter==='declined'? 'default':'outline'} size="sm" onClick={() => setStatusFilter('declined')}>Refusés</Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>Page {page + 1} / {Math.max(1, maxPage + 1)}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p-1))} disabled={!hasPrev}>
                        <ChevronLeft className="w-4 h-4" /> Précédent
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(maxPage, p+1))} disabled={!hasNext}>
                        Suivant <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts List */}
              {contactsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <Card className="glass-card border-border/50">
                  <CardContent className="py-16">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun contact trouvé</h3>
                      <p className="text-muted-foreground mb-6">
                        Commencez par ajouter vos premiers contacts
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredContacts.map((contact, index) => (
                    <Card key={contact.id} className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{contact.name || contact.email}</h3>
                              <Badge variant="outline">
                                {statusMappings.contact[contact.status] || contact.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {contact.missions_count} mission{contact.missions_count !== 1 ? 's' : ''} partagée{contact.missions_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              className="bg-gradient-royal hover:opacity-90"
                              asChild
                              title="Créer une mission avec ce contact"
                            >
                              <Link to={`/missions/new?assigned_to=contact&assigned_contact_id=${contact.id}`}>
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Créer mission
                              </Link>
                            </Button>
                            {contact.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => sendInvitation.mutate({ contactId: contact.id })}
                                disabled={sendInvitation.isPending}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Renvoyer
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => cancelContact.mutate(contact.id)}
                              disabled={cancelContact.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            {invitationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : invitations?.length === 0 ? (
              <Card className="glass-card border-border/50">
                <CardContent className="py-16">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune invitation en attente</h3>
                    <p className="text-muted-foreground">
                      Vous n'avez pas de nouvelles invitations
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {invitations?.map((invitation, index) => (
                  <Card key={invitation.id} className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Invitation de {invitation.name || invitation.email}</h3>
                          <p className="text-sm text-muted-foreground">{invitation.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Envoyée le {new Date(invitation.invited_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => acceptInvitation.mutate(invitation.id)}
                            disabled={acceptInvitation.isPending}
                            className="bg-gradient-royal hover:opacity-90"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accepter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => declineInvitation.mutate(invitation.id)}
                            disabled={declineInvitation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contacts;