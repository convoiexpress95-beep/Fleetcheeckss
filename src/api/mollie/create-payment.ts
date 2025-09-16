import { supabase } from '@/integrations/supabase/client';

export async function POST(request: Request) {
  try {
    const { amount, description, redirectUrl, webhookUrl, metadata } = await request.json();

    if (!amount || !description || !metadata?.userId) {
      return Response.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Simuler la création d'un paiement pour le développement
    const paymentId = `payment_${Date.now()}`;
    const checkoutUrl = `https://www.mollie.com/checkout/select-method/${paymentId}`;

    // Sauvegarder la transaction en attente
    const { error: dbError } = await supabase
      .from('credits_wallets')
      .upsert({
        user_id: metadata.userId,
        credits_balance: metadata.credits === 'Infinity' ? 999999 : parseInt(metadata.credits),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Erreur DB:', dbError);
      return Response.json(
        { error: 'Erreur base de données: ' + dbError.message },
        { status: 500 }
      );
    }

    return Response.json({
      paymentId: paymentId,
      checkoutUrl: checkoutUrl,
      status: 'open'
    });

  } catch (error) {
    console.error('Erreur création paiement:', error);
    return Response.json(
      { error: 'Erreur serveur: ' + (error as Error).message },
      { status: 500 }
    );
  }
}