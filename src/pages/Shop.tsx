import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, CreditCard, Clock, CheckCircle, Star, Shield, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

const Shop = () => {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const creditPacks = [
    {
      id: 'debutant',
      name: 'Pack Débutant',
      price: '9,99€',
      credits: 10,
      popular: false,
      gradient: 'bg-gradient-ocean'
    },
    {
      id: 'pro',
      name: 'Pack Pro',
      price: '19,99€',
      credits: 25,
      popular: true,
      gradient: 'bg-gradient-cosmic'
    },
    {
      id: 'expert',
      name: 'Pack Expert',
      price: '39,99€',
      credits: 100,
      popular: false,
      gradient: 'bg-gradient-sunset'
    },
    {
      id: 'entreprise',
      name: 'Pack Entreprise',
      price: '79,99€',
      credits: 650,
      popular: false,
      gradient: 'bg-gradient-royal'
    }
  ];

  useEffect(() => {
    // Gérer le retour de Mollie
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const planType = searchParams.get('plan');

    if (success && planType && !isProcessing) {
      handleMollieReturn(planType);
    } else if (cancelled) {
      toast({
        title: "Paiement annulé",
        description: "Votre paiement a été annulé.",
        variant: "destructive",
      });
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/shop');
    }
  }, [searchParams, isProcessing]);

  const handleMollieReturn = async (planType: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Obtenir l'ID de paiement depuis l'URL si disponible
      const paymentId = searchParams.get('id');
      
      if (!paymentId) {
        console.warn('No payment ID found in URL, payment verification may be limited');
        toast({
          title: "Paiement en cours",
          description: "Votre paiement est en cours de traitement. Vos crédits seront ajoutés sous peu.",
        });
        window.history.replaceState({}, '', '/shop');
        return;
      }

      console.log('Verifying Mollie payment:', { paymentId, planType });
      
      const { data, error } = await supabase.functions.invoke('capture-mollie-payment', {
        body: { paymentId, planType }
      });

      if (error) {
        console.error('Error verifying Mollie payment:', error);
        toast({
          title: "Erreur de paiement",
          description: "Une erreur est survenue lors de la vérification du paiement.",
          variant: "destructive",
        });
        return;
      }

      console.log('Mollie payment verified successfully:', data);
      
      toast({
        title: "Paiement réussi !",
        description: `Votre achat a été confirmé. ${data.creditsAdded} crédits ont été ajoutés à votre compte.`,
      });

      // Nettoyer l'URL
      window.history.replaceState({}, '', '/shop');
      
    } catch (error) {
      console.error('Error in handleMollieReturn:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de votre paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour acheter des crédits.",
        variant: "destructive",
      });
      return;
    }

    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelectedPack(packId);

    try {
      console.log('Creating Mollie payment:', packId);
      
      const { data, error } = await supabase.functions.invoke('create-mollie-payment', {
        body: { planType: packId }
      });

      if (error) {
        console.error('Error creating Mollie payment:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer le paiement Mollie. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      console.log('Mollie payment created:', data);
      
      // Rediriger vers Mollie dans un nouvel onglet
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        
        toast({
          title: "Redirection Mollie",
          description: "Une nouvelle fenêtre de paiement s'est ouverte. Complétez votre paiement puis revenez sur cette page.",
        });
      }
      
    } catch (error) {
      console.error('Error in handlePurchase:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedPack(null);
    }
  };

  const handleRecurringPayment = () => {
    setShowPaymentForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-blue-900/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-cosmic rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-sunset rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="p-3 bg-gradient-cosmic rounded-2xl glow animate-pulse-glow">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Crédits & Abonnements
            </h1>
            <p className="text-purple-100/80 text-lg">
              Choisissez la formule adaptée à vos besoins : pack ponctuel ou abonnement premium.
            </p>
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
              Packs de Crédits
            </h2>
            <p className="text-purple-100/70 text-lg">
              Achat ponctuel avec 30 jours d'expiration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {creditPacks.map((pack, index) => (
              <Card 
                key={pack.id} 
                className={`glass-card border-white/10 hover:scale-105 transition-all duration-500 animate-fade-in relative ${
                  pack.popular ? 'ring-2 ring-purple-400/50' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {pack.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-cosmic text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${pack.gradient} rounded-2xl mx-auto mb-4 flex items-center justify-center`}>
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {pack.name}
                  </CardTitle>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    {pack.price}
                  </div>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-white">
                      {pack.credits}
                    </div>
                    <p className="text-purple-100/70">crédits</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-purple-100/60">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Expiration : 30 jours</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Utilisation immédiate</span>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full ${pack.gradient} hover:scale-105 transition-all duration-300 glow-hover text-white border-0`}
                    onClick={() => handlePurchase(pack.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPack === pack.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </>
                    ) : (
                      <>Acheter avec Mollie</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recurring Payment Section */}
        <Card className="glass-card border-white/10 animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="p-3 bg-gradient-royal rounded-2xl mx-auto w-fit mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Paiement Récurrent
            </CardTitle>
            <CardDescription className="text-purple-100/70 text-lg">
              Enregistrez votre moyen de paiement pour des achats automatiques mensuels
            </CardDescription>
          </CardHeader>
          
          <CardContent className="max-w-2xl mx-auto">
            {!showPaymentForm ? (
              <div className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 glass-card rounded-lg border-white/5">
                    <Shield className="w-6 h-6 text-green-400" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Sécurisé</div>
                      <div className="text-sm text-purple-100/60">Cryptage SSL</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 glass-card rounded-lg border-white/5">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Flexible</div>
                      <div className="text-sm text-purple-100/60">Annulation libre</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 glass-card rounded-lg border-white/5">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Automatique</div>
                      <div className="text-sm text-purple-100/60">Rechargement auto</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="bg-gradient-royal hover:scale-105 transition-all duration-300 glow-hover px-8 py-3 text-lg"
                  onClick={handleRecurringPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Configurer le paiement automatique
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-purple-100/80">
                      Numéro de carte
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="glass-card border-white/20 text-white placeholder:text-purple-100/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-purple-100/80">
                      Nom sur la carte
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="Jean Dupont"
                      className="glass-card border-white/20 text-white placeholder:text-purple-100/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="text-purple-100/80">
                      Expiration
                    </Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      className="glass-card border-white/20 text-white placeholder:text-purple-100/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvc" className="text-purple-100/80">
                      CVC
                    </Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      className="glass-card border-white/20 text-white placeholder:text-purple-100/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-purple-100/80">
                    Fréquence de rechargement
                  </Label>
                  <Select>
                    <SelectTrigger className="glass-card border-white/20 text-white">
                      <SelectValue placeholder="Choisir la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Tous les mois</SelectItem>
                      <SelectItem value="quarterly">Tous les 3 mois</SelectItem>
                      <SelectItem value="yearly">Tous les ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultPack" className="text-purple-100/80">
                    Pack par défaut
                  </Label>
                  <Select>
                    <SelectTrigger className="glass-card border-white/20 text-white">
                      <SelectValue placeholder="Choisir le pack" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditPacks.map((pack) => (
                        <SelectItem key={pack.id} value={pack.id}>
                          {pack.name} - {pack.price} ({pack.credits} crédits)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 glass-card text-purple-100 border-white/20 hover:bg-white/10"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button className="flex-1 bg-gradient-royal hover:scale-105 transition-all duration-300 glow-hover">
                    <Shield className="w-4 h-4 mr-2" />
                    Enregistrer le paiement
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shop;