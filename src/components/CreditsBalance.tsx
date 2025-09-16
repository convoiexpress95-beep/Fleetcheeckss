import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';

interface CreditWallet {
  user_id: string;
  balance: number;
  updated_at: string;
}

const CreditsBalance = () => {
  const [creditWallet, setCreditWallet] = useState<CreditWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCreditsBalance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('credits_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun portefeuille trouvé, créer un nouveau
          const { data: newWallet, error: createError } = await supabase
            .from('credits_wallets')
            .insert([
              {
                user_id: user.id,
                balance: 0,
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Erreur création portefeuille:', createError);
            toast({
              title: "Erreur",
              description: "Impossible de créer le portefeuille de crédits.",
              variant: "destructive",
            });
            return;
          }

          setCreditWallet(newWallet);
        } else {
          console.error('Erreur récupération crédits:', error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer le solde des crédits.",
            variant: "destructive",
          });
        }
      } else {
        setCreditWallet(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCreditsBalance();
  };

  useEffect(() => {
    fetchCreditsBalance();
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 backdrop-blur-sm border-blue-200/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CreditCard className="h-5 w-5" />
            Chargement...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full bg-gradient-to-br from-gray-50/50 to-slate-50/50 backdrop-blur-sm border-gray-200/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <CreditCard className="h-5 w-5" />
            Crédits API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Connectez-vous pour voir votre solde de crédits.</p>
        </CardContent>
      </Card>
    );
  }

  const isLowBalance = (creditWallet?.balance || 0) < 5;

  return (
    <Card className={`w-full backdrop-blur-sm transition-all duration-300 ${
      isLowBalance 
        ? 'bg-gradient-to-br from-red-50/50 to-pink-50/50 border-red-200/30 shadow-red-100/50'
        : 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/30 shadow-green-100/50'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${
            isLowBalance ? 'text-red-900' : 'text-green-900'
          }`}>
            <CreditCard className="h-5 w-5" />
            Crédits API
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Solde actuel:</span>
          <div className="flex items-center gap-2">
            <Badge variant={isLowBalance ? "destructive" : "secondary"} className={
              isLowBalance 
                ? "bg-red-100 text-red-800 hover:bg-red-200" 
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }>
              {creditWallet?.balance || 0} crédits
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={isLowBalance ? 'text-red-600' : 'text-green-600'}>
            Dernière mise à jour:
          </span>
          <div className={`flex items-center gap-1 ${isLowBalance ? 'text-red-700' : 'text-green-700'}`}>
            <Calendar className="h-3 w-3" />
            {creditWallet?.updated_at 
              ? new Date(creditWallet.updated_at).toLocaleDateString('fr-FR')
              : 'Jamais'
            }
          </div>
        </div>

        {isLowBalance && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">
              ⚠️ Solde faible ! Rechargez votre compte pour continuer à utiliser l'API.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsBalance;