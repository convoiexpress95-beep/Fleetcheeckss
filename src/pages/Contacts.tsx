import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useMyContacts, 
  useAddContact
} from '@/hooks/useContacts';
import { useSearchProfiles } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Plus, Search, Users, Mail, 
  ClipboardList, UserPlus, Activity, Clock, 
  Calendar, Target, Briefcase
} from 'lucide-react';

const TeamManager = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  
  const { data: contactsData, isLoading: contactsLoading } = useMyContacts(0, 50, search);
  const { data: profileResults, isLoading: profilesLoading } = useSearchProfiles(emailSearch);
  const addContact = useAddContact();

  const myTeam = contactsData?.data?.filter(contact => contact.status === 'accepted') || [];

  const handleAddContact = async (email: string, name: string) => {
    try {
      await addContact.mutateAsync({
        email,
        name: name || email.split('@')[0],
      });
      setEmailSearch('');
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleCreateMission = (contact: any) => {
    // Redirection directe vers la page de création de mission avec le contact pré-assigné
    const queryParams = new URLSearchParams({
      assigned_to: 'contact',
      assigned_contact_id: contact.id,
      assigned_contact_name: contact.name || contact.email.split('@')[0],
      assigned_contact_email: contact.email
    });
    
    navigate(`/missions/new?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                  <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Link>
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <Briefcase className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
                      Gestionnaire d'Équipe
                    </h1>
                    <p className="text-slate-400 text-lg">
                      Gérez vos collaborateurs et assignez des missions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{myTeam.length}</div>
                  <div className="text-xs text-slate-400">Membres actifs</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-teal-500/10 to-teal-600/10 border-teal-500/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <ClipboardList className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-slate-400">Missions en cours</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">87</div>
                  <div className="text-xs text-slate-400">Missions terminées</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">94%</div>
                  <div className="text-xs text-slate-400">Taux de succès</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Ajouter un membre */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <UserPlus className="w-5 h-5 text-teal-400" />
                Ajouter un Membre
              </CardTitle>
              <CardDescription className="text-slate-400">
                Recherchez par adresse email pour inviter un nouveau membre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    placeholder="membre@exemple.com"
                    className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Suggestions de profils */}
              {emailSearch && profileResults && profileResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <Label className="text-slate-200 text-sm">Suggestions :</Label>
                  {profileResults.map(profile => (
                    <div 
                      key={profile.id} 
                      className="flex items-center justify-between p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 transition-all duration-300 group cursor-pointer"
                      onClick={() => handleAddContact(profile.email, profile.full_name || profile.email.split('@')[0])}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {profile.full_name || profile.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-slate-400">Cliquer pour ajouter</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              )}

              {emailSearch && profilesLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-slate-600 border-t-teal-500 rounded-full animate-spin"></div>
                  <span className="ml-2 text-slate-400">Recherche...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Mon Équipe */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <Users className="w-5 h-5 text-blue-400" />
                      Mon Équipe ({myTeam.length})
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Vos collaborateurs actifs et leurs missions
                    </CardDescription>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="ml-3 text-slate-400">Chargement de l'équipe...</span>
                  </div>
                ) : myTeam.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aucun membre dans l'équipe</h3>
                    <p className="text-slate-400 mb-6">Commencez par ajouter votre premier collaborateur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTeam.map((member) => (
                      <div 
                        key={member.id}
                        className="group flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {(member.name || member.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-white text-lg">
                              {member.name || member.email.split('@')[0]}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {member.missions_count || 0} mission{(member.missions_count || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            size="sm"
                            onClick={() => handleCreateMission(member)}
                            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg"
                          >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Nouvelle Mission
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManager;