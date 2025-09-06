import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export interface CreditTransaction {
  id: string;
  user_id: string;
  mission_id?: string;
  credits_used: number;
  transaction_type: string;
  description?: string;
  created_at: string;
}

export interface CreditBalance {
  credits_remaining: number;
  credits_total: number;
  plan_type: string;
  status: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger le solde de crédits
  const loadBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBalance(data);
      } else {
        // Créer un abonnement par défaut
        const { data: newSubscription, error: createError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: user.id,
            plan_type: 'decouverte',
            credits_remaining: 5,
            credits_total: 5,
            status: 'active'
          }])
          .select()
          .single();

        if (createError) throw createError;
        setBalance(newSubscription);
      }
    } catch (error) {
      console.error('Erreur chargement solde crédits:', error);
    }
  };

  // Charger l'historique des transactions
  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    }
  };

  // Consommer des crédits
  const consumeCredits = async (
    missionId: string,
    credits: number,
    type: string,
    description?: string
  ): Promise<boolean> => {
    if (!user || !balance) return false;

    try {
      // Vérifier si plan illimité
      if (balance.plan_type === 'illimite') {
        // Enregistrer la transaction sans décrémenter
        const { error } = await supabase
          .from('credit_transactions')
          .insert([{
            user_id: user.id,
            mission_id: missionId,
            credits_used: 0,
            transaction_type: type,
            description: `${description} (Plan illimité)`
          }]);

        if (error) throw error;
        await loadTransactions();
        return true;
      }

      // Vérifier les crédits disponibles
      if (balance.credits_remaining < credits) {
        toast({
          title: "Crédits insuffisants",
          description: `Il vous faut ${credits} crédits pour cette action. Rechargez votre compte.`,
          variant: "destructive"
        });
        return false;
      }

      // Utiliser la fonction Supabase pour consommer les crédits
      const { data, error } = await supabase.rpc('consume_credit', {
        _user_id: user.id,
        _mission_id: missionId,
        _credits: credits,
        _type: type,
        _description: description
      });

      if (error) throw error;

      if (data) {
        await loadBalance();
        await loadTransactions();
        
        toast({
          title: "Crédits utilisés",
          description: `${credits} crédit${credits > 1 ? 's' : ''} utilisé${credits > 1 ? 's' : ''} pour ${description}`,
        });
        
        return true;
      } else {
        toast({
          title: "Échec de la consommation",
          description: "Impossible d'utiliser les crédits. Vérifiez votre solde.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur consommation crédits:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'utilisation des crédits",
        variant: "destructive"
      });
      return false;
    }
  };

  // Ajouter des crédits (après achat)
  const addCredits = async (credits: number, planType?: string) => {
    if (!user) return false;

    try {
      const updateData: any = {
        credits_remaining: (balance?.credits_remaining || 0) + credits,
        credits_total: (balance?.credits_total || 0) + credits
      };

      if (planType) {
        updateData.plan_type = planType;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      // Enregistrer la transaction d'ajout
      await supabase
        .from('credit_transactions')
        .insert([{
          user_id: user.id,
          credits_used: -credits, // Négatif pour indiquer un ajout
          transaction_type: 'purchase',
          description: `Achat de ${credits} crédits${planType ? ` - Plan ${planType}` : ''}`
        }]);

      await loadBalance();
      await loadTransactions();

      toast({
        title: "Crédits ajoutés",
        description: `${credits} crédit${credits > 1 ? 's' : ''} ajouté${credits > 1 ? 's' : ''} à votre compte`,
      });

      return true;
    } catch (error) {
      console.error('Erreur ajout crédits:', error);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([loadBalance(), loadTransactions()]);
        setLoading(false);
      }
    };

    init();
  }, [user]);

  return {
    balance,
    transactions,
    loading,
    consumeCredits,
    addCredits,
    loadBalance,
    loadTransactions
  };
};