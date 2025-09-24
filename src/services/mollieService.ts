import { supabase } from '@/integrations/supabase/client';

export interface PaymentData {
  amount: number;
  description: string;
  metadata: {
    userId: string;
    packId: string;
    credits: number | string;
  };
}

export const createMolliePayment = async (paymentData: PaymentData) => {
  try {
    const { amount, description, metadata } = paymentData;

    if (!amount || !description || !metadata?.userId) {
      throw new Error('Paramètres manquants');
    }

    // Simuler la création d'un paiement Mollie pour le développement
    const paymentId = `payment_${Date.now()}`;
    
    // Pour une vraie intégration Mollie, remplacer par l'URL de checkout réelle
    const checkoutUrl = `https://www.mollie.com/checkout/select-method/${paymentId}`;

    // Sauvegarder les crédits dans la base de données
    const creditsAmount = metadata.credits === 'Infinity' ? 999999 : parseInt(metadata.credits.toString());
    
    const { error: dbError } = await supabase
      .from('credits_wallets')
      .upsert({
        user_id: metadata.userId,
        balance: creditsAmount,
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Erreur DB:', dbError);
      throw new Error('Erreur base de données: ' + dbError.message);
    }

    // Enregistrer la transaction dans l'historique
    const { error: ledgerError } = await supabase
      .from('credits_ledger')
      .insert({
        user_id: metadata.userId,
        delta: creditsAmount,
        reason: `Achat ${description}`,
        ref: `mollie:${paymentId}`,
        created_at: new Date().toISOString()
      });

    if (ledgerError) {
      console.error('Erreur ledger:', ledgerError);
      // Non bloquant
    }

    return {
      paymentId,
      checkoutUrl,
      status: 'open'
    };

  } catch (error) {
    console.error('Erreur création paiement:', error);
    throw error;
  }
};

export const simulatePaymentSuccess = async (userId: string, credits: number | string) => {
  // Fonction pour simuler un paiement réussi en développement
  const creditsAmount = credits === 'Infinity' ? 999999 : parseInt(credits.toString());
  
  const { error } = await supabase
    .from('credits_wallets')
    .upsert({
      user_id: userId,
      balance: creditsAmount,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error('Erreur lors de la mise à jour des crédits: ' + error.message);
  }

  return { success: true };
};