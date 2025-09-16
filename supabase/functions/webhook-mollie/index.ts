// @ts-nocheck
// Edge Function Deno: imports HTTP et objet global Deno résolus à l'exécution sur la plateforme Supabase.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Placeholder webhook Mollie (idempotent via external_ref). Add signature validation with Mollie secret header in prod.
serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const payload = await req.json();
    const paymentId = payload.id || payload.paymentId;
    if (!paymentId) return new Response('Missing payment id', { status: 400 });

    const service = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );

    // Lookup order by external_ref (assumes we stored PSP payment id there once created)
    const { data: order } = await service.from('cart_orders').select('*').eq('external_ref', paymentId).maybeSingle();
    if (!order) return new Response('OK', { status: 200 }); // ignore unknown
    if (order.status === 'paid') return new Response('OK', { status: 200 });

    // TODO: call Mollie API to verify status here.

    await service.from('cart_orders').update({ status: 'paid', paid_at: new Date().toISOString(), paid_amount: order.amount, paid_currency: order.currency }).eq('id', order.id);

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error('webhook-mollie error', e);
    return new Response('Error', { status: 500 });
  }
});
