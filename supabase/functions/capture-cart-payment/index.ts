// @ts-nocheck
// Fichier Edge (Deno) – ignoré par le pipeline TS du front. Les imports HTTP sont valides à l'exécution Supabase.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error('Non authentifié');

  const { orderId, externalRef } = await req.json();
    if (!orderId) throw new Error('orderId requis');

    const { data: order, error: orderErr } = await supabaseClient
      .from('cart_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();
    if (orderErr) throw orderErr;
    if (!order) throw new Error('Commande introuvable');
  if (order.status === 'paid') {
      return new Response(JSON.stringify({ already: true, creditsAdded: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

  // Idempotence: si externalRef fourni et différent, on pourrait vérifier collisions (simplifié ici)

    // Ajouter crédits si présents
    let creditsAdded = 0;
    if (order.credits_expected && order.credits_expected > 0) {
      // Update subscription
      const { data: sub, error: subErr } = await serviceClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (subErr) throw subErr;

      if (sub) {
        const newRemaining = (sub.credits_remaining || 0) + order.credits_expected;
        const newTotal = (sub.credits_total || 0) + order.credits_expected;
        const { error: upErr } = await serviceClient
          .from('subscriptions')
          .update({ credits_remaining: newRemaining, credits_total: newTotal })
          .eq('user_id', user.id);
        if (upErr) throw upErr;
        creditsAdded = order.credits_expected;

        await serviceClient.from('credit_transactions').insert([{
          user_id: user.id,
          credits_used: -creditsAdded,
          transaction_type: 'purchase',
          description: `Achat panier (${creditsAdded} crédits)`
        }]);
      }
    }

    // Marquer commande payée
    const { error: updErr } = await serviceClient
      .from('cart_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString(), paid_amount: order.amount, paid_currency: order.currency })
      .eq('id', order.id);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true, creditsAdded }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    console.error('capture-cart-payment error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
