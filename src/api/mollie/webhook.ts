import { supabase } from '@/integrations/supabase/client';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json(
        { error: 'ID de paiement manquant' },
        { status: 400 }
      );
    }

    // Dans un vrai environnement, ici on vérifierait le statut du paiement avec Mollie
    // Pour le développement, on simule un paiement réussi
    console.log('Webhook reçu pour le paiement:', id);

    // Mettre à jour le statut du paiement comme réussi
    // (Dans la vraie implémentation, cela se ferait après vérification avec Mollie)

    return Response.json({ success: true });

  } catch (error) {
    console.error('Erreur webhook:', error);
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}