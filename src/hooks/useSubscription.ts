import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  credits_remaining: number;
  credits_total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;

      // Utilisation directe du client Supabase sans types stricts
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        // Si pas d'abonnement, retourner des valeurs par défaut
        console.log('No subscription found, user will get default discovery plan');
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });
};

export const useCreditsCount = () => {
  const { data: subscription, isLoading } = useSubscription();
  
  return {
    credits: subscription?.credits_remaining || 5, // Valeur par défaut de 5 crédits
    planType: subscription?.plan_type || 'decouverte',
    isLoading,
    isUnlimited: subscription?.plan_type === 'illimite'
  };
};