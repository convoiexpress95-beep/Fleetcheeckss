import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export interface CreditBalance {
  credits_remaining: number;
  credits_total: number;
  plan_type: string;
  status: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && (error as any).code !== 'PGRST116') throw error;

      if (data) {
        setBalance(data as unknown as CreditBalance);
      } else {
        const { data: created, error: createError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              plan_type: 'decouverte',
              credits_remaining: 5,
              credits_total: 5,
              status: 'active',
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        setBalance(created as unknown as CreditBalance);
      }
    } catch (e) {
      console.error('Erreur chargement solde crédits (mobile):', e);
    }
  };

  const addCredits = async (credits: number, planType?: string) => {
    if (!user) return false;

    try {
      const current = balance;
      const updateData: any = {
        credits_remaining: (current?.credits_remaining || 0) + credits,
        credits_total: (current?.credits_total || 0) + credits,
      };
      if (planType) updateData.plan_type = planType;

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      await supabase.from('credit_transactions').insert([
        {
          user_id: user.id,
          credits_used: -credits,
          transaction_type: 'purchase',
          description: `Achat de ${credits} crédits${planType ? ` - Plan ${planType}` : ''}`,
        },
      ]);

      await loadBalance();
      Toast.show({ type: 'success', text1: 'Crédits ajoutés', text2: `${credits} crédits ajoutés` });
      return true;
    } catch (e: any) {
      console.error('Erreur ajout crédits (mobile):', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Achat de crédits impossible' });
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      if (user) {
        setLoading(true);
        await loadBalance();
        setLoading(false);
      }
    };
    init();
  }, [user]);

  return { balance, loading, addCredits, loadBalance };
};
