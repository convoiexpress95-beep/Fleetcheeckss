import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, Truck, Building2, Sparkles, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"convoyeur" | "donneur_ordre">("convoyeur");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password || !fullName) {
      setError("Tous les champs sont requis");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Cette adresse email est déjà utilisée. Essayez de vous connecter.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data.user && !data.session) {
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      } else if (data.session) {
        toast({
          title: "Bienvenue !",
          description: "Votre compte a été créé avec succès.",
        });
        navigate("/");
      }
  } catch (error) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Email et mot de passe requis");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou mot de passe incorrect");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Veuillez confirmer votre email avant de vous connecter");
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur FleetChecks",
        });
        navigate("/");
      }
  } catch (error) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glass"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 bg-card/10 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary animate-glow" />
            <span className="text-sm font-medium text-foreground">Plateforme Premium</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            FleetChecks
          </h1>
          <p className="text-muted-foreground text-lg">
            Rejoignez la révolution du transport de véhicules
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center hover:shadow-glass transition-all duration-300">
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">100% Sécurisé</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center hover:shadow-glass transition-all duration-300">
            <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Ultra Rapide</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center hover:shadow-glass transition-all duration-300">
            <Sparkles className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Premium</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="shadow-premium backdrop-blur-sm bg-card/90 border-border/50 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-premium data-[state=active]:text-white">
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-premium data-[state=active]:text-white">
                  Inscription
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Mot de passe</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-premium hover:shadow-premium hover:scale-105 transition-all duration-300 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Nom complet</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Mot de passe</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum 6 caractères
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Type de compte</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={userType === "convoyeur" ? "default" : "outline"}
                        onClick={() => setUserType("convoyeur")}
                        className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 ${
                          userType === "convoyeur" 
                            ? "bg-gradient-premium text-white shadow-premium" 
                            : "bg-background/50 border-border/50 hover:border-primary/50"
                        }`}
                        disabled={isLoading}
                      >
                        <Truck className="w-6 h-6" />
                        <span className="text-sm">Convoyeur</span>
                      </Button>
                      <Button
                        type="button"
                        variant={userType === "donneur_ordre" ? "default" : "outline"}
                        onClick={() => setUserType("donneur_ordre")}
                        className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 ${
                          userType === "donneur_ordre" 
                            ? "bg-gradient-premium text-white shadow-premium" 
                            : "bg-background/50 border-border/50 hover:border-primary/50"
                        }`}
                        disabled={isLoading}
                      >
                        <Building2 className="w-6 h-6" />
                        <span className="text-sm">Donneur d'ordre</span>
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-premium hover:shadow-premium hover:scale-105 transition-all duration-300 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p>En vous inscrivant, vous acceptez nos conditions d'utilisation</p>
          <p className="mt-2 text-xs">© 2024 FleetChecks - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;