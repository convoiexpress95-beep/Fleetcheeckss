import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Star, 
  Shield, 
  Car, 
  Camera,
  Edit,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Clock,
  Users,
  Euro
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useUserReviews } from "@/hooks/useUserReviews";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user: sessionUser, loading: authLoading } = useAuth();
  const [authId, setAuthId] = useState<string | undefined>(undefined);
  useEffect(() => {
    setAuthId(sessionUser?.id);
  }, [sessionUser]);

  const user = {
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "06 12 34 56 78",
  avatar: "/placeholder-avatar.jpg",
    memberSince: "Mars 2021",
    rating: 4.8,
    totalReviews: 42,
    completedTrips: 87,
    bio: "Passionnée de voyages et de rencontres, j'aime partager mes trajets et découvrir de nouvelles personnes. Toujours à l'heure et respectueuse de l'environnement !",
    location: "Paris, France",
    preferences: {
      music: true,
      pets: false,
      smoking: false,
      chatty: true
    },
    car: {
      model: "Peugeot 308",
      color: "Bleu",
      year: 2020,
      seats: 4
    }
  };

  const { profile, upsert, uploadAvatar } = useProfile(authId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  useEffect(()=>{
    const dn = profile.data?.display_name || user.name;
    setFirstName(dn.split(' ')[0] || '');
    setLastName(dn.split(' ').slice(1).join(' ') || '');
    setLocation(profile.data?.location || '');
  }, [profile.data, user.name]);
  const { list: reviews, add: addReview } = useUserReviews(authId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const avgRating = useMemo(() => {
    const arr = reviews.data || [];
    if(!arr.length) return user.rating;
    return Math.round((arr.reduce((s,r)=>s+r.rating,0)/arr.length)*10)/10;
  }, [reviews.data, user.rating]);

  if (authLoading) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto px-4 py-8">Chargement…</div></div>;
  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto text-center border rounded-lg p-8 glass">
            <h2 className="text-2xl font-semibold mb-2">Connectez-vous pour accéder à votre profil</h2>
            <p className="text-muted-foreground mb-4">Vous devez être authentifié pour consulter et modifier votre profil.</p>
            <div className="flex justify-center gap-3">
              <Button asChild><Link to="/login">Se connecter</Link></Button>
              <Button variant="outline" asChild><Link to="/register">Créer un compte</Link></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6 mt-6">
              {/* En-tête du profil */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                          <AvatarImage src={profile.data?.avatar_url || user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                            {(profile.data?.display_name || user.name).split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="absolute bottom-0 right-0 rounded-full w-10 h-10"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if(!f) return;
                          await uploadAvatar.mutateAsync(f);
                        }} />
                      </div>
                      <div className="text-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4 text-primary" />
                          <span>Profil vérifié</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-foreground">{profile.data?.display_name || user.name}</h1>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{avgRating}</div>
                          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            Note moyenne
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{user.totalReviews}</div>
                          <div className="text-sm text-muted-foreground">Avis reçus</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{user.completedTrips}</div>
                          <div className="text-sm text-muted-foreground">Trajets réalisés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Membre depuis</div>
                          <div className="font-semibold text-foreground">{user.memberSince}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.data?.location || user.location}</span>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Véhicule */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Mon véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{user.car.model}</div>
                      <div className="text-muted-foreground">
                        {user.car.color} • {user.car.year} • {user.car.seats} places
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Préférences de voyage */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Préférences de voyage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.music ? "default" : "outline"}>
                        Musique
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.pets ? "default" : "outline"}>
                        Animaux
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={!user.preferences.smoking ? "default" : "outline"}>
                        Non-fumeur
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.chatty ? "default" : "outline"}>
                        Bavard
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4 mt-6">
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Avis reçus ({user.totalReviews})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(reviews.data || []).map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {"A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">Utilisateur</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-muted-foreground mb-2">{review.comment}</p>
                        </div>
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  ))}
                  {!(reviews.data || []).length && (
                    <div className="text-sm text-muted-foreground">Aucun avis pour le moment.</div>
                  )}
                  <div className="mt-6 p-4 border rounded-lg">
                    <div className="font-medium mb-2">Donner un avis</div>
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} className={"p-1"} onClick={() => setReviewRating(n)}>
                          <Star className={`w-6 h-6 ${n <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea placeholder="Votre avis" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
                    <div className="mt-2">
                      <Button size="sm" onClick={async () => {
                        try {
                          await addReview.mutateAsync({ rating: reviewRating, comment: reviewComment });
                          setReviewComment('');
                        } catch (e) {
                          console.error(e);
                        }
                      }}>Envoyer</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6 mt-6">
              {/* Informations personnelles */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" value={firstName} onChange={(e)=> setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" value={lastName} onChange={(e)=> setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="email" defaultValue={user.email} className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="location" className="pl-10" placeholder="Ville, Pays" value={location} onChange={(e)=> setLocation(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">À propos de moi</Label>
                    <Textarea id="bio" defaultValue={profile.data?.bio || user.bio} className="min-h-[100px]" onChange={(e)=>upsert.mutate({ bio: e.target.value })} />
                  </div>
                  <Button variant="hero" disabled={saving} onClick={async ()=>{
                    try{
                      setSaving(true);
                      const display_name = `${firstName}`.trim() + (lastName ? ` ${lastName}` : '');
                      if(!display_name.trim()) throw new Error('Prénom/Nom requis');
                      if(!location.trim()) throw new Error('Localisation requise');
                      await upsert.mutateAsync({ display_name, location });
                    } finally {
                      setSaving(false);
                    }
                  }}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </Button>
                </CardContent>
              </Card>

              {/* Paramètres de notification */}
              <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Nouvelles réservations</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir une notification lors de nouvelles réservations
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Messages</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir une notification pour les nouveaux messages
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Rappels de trajet</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir des rappels avant vos trajets
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Activé</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;