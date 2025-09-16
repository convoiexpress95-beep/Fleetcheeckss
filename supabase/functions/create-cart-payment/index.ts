// @ts-nocheck
// Fichier Edge (Deno) – imports HTTP résolus par Deno, on neutralise la vérification TS côté IDE.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncomingItemClient {
  id: string; // product id
  quantity: number;
}

function computeHash(str: string) {
  const data = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', data).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error('Non authentifié');

    const body = await req.json();
  const items: IncomingItemClient[] = Array.isArray(body.items) ? body.items : [];
    const promo: string | undefined = body.promo;
    const clientHash: string | undefined = body.hash;

    if (!items.length) throw new Error('Panier vide');

    // Normalisation & tri
    const normalizedReq = items.map(i => ({
      id: String(i.id),
      quantity: Number(i.quantity || 0)
    })).filter(i => i.quantity > 0);

    normalizedReq.sort((a,b)=> a.id.localeCompare(b.id));

    // Charger produits officiels
    const ids = normalizedReq.map(i=> i.id);
    const { data: products, error: prodErr } = await supabaseClient
      .from('catalog_products')
      .select('*')
      .in('id', ids)
      .eq('active', true);
    if (prodErr) throw prodErr;
    if (!products || !products.length) throw new Error('Produits introuvables');

    const productMap: Record<string, any> = {};
    for (const p of products) productMap[p.id] = p;

    const lineItems = normalizedReq.map(r => {
      const p = productMap[r.id];
      if (!p) throw new Error(`Produit inconnu: ${r.id}`);
      return {
        id: p.id,
        name: p.name,
        price: Number(p.base_price),
        quantity: r.quantity,
        kind: p.kind,
        creditAmount: p.credit_amount || null,
        currency: 'EUR'
      };
    });

    // Recalcul
    const subtotal = lineItems.reduce((acc,i)=> acc + i.price * i.quantity, 0);
    const creditsExpected = lineItems.filter(i=> i.kind === 'credit').reduce((acc,i)=> acc + (i.creditAmount||0) * i.quantity, 0);

    // Remise via table promo_codes
    let discount = 0;
    if (promo) {
      const up = promo.toUpperCase();
      const { data: promoRow } = await supabaseClient
        .from('promo_codes')
        .select('*')
        .eq('code', up)
        .eq('active', true)
        .maybeSingle();
      if (promoRow) {
        const now = new Date();
        if (!promoRow.expires_at || new Date(promoRow.expires_at) > now) {
          // Check global usage limit
            if (promoRow.usage_limit && promoRow.used_count >= promoRow.usage_limit) {
              // Ignore promo
            } else {
              // Per user usage
              if (promoRow.per_user_limit) {
                const { data: perUserUsed } = await supabaseClient
                  .from('promo_code_usages')
                  .select('order_id', { count: 'exact', head: true })
                  .eq('code', up)
                  .eq('user_id', user.id);
                if ((perUserUsed as any)?.count >= promoRow.per_user_limit) {
                  // exceeded user limit
                } else {
                  discount = subtotal * (promoRow.percent / 100);
                }
              } else {
                discount = subtotal * (promoRow.percent / 100);
              }
            }
        }
      }
    }

    // TVA 20% sur non-credit
  const taxable = lineItems.filter(i=> i.kind !== 'credit').reduce((acc,i)=> acc + i.price * i.quantity, 0);
    const vat = taxable * 0.2;

    const amount = subtotal - discount + vat;

    // Vérification hash intégrité
  const serverHashBase = JSON.stringify({items: lineItems, promo: promo||null});
    const serverHash = await computeHash(serverHashBase);
    if (clientHash && clientHash !== serverHash) {
      throw new Error('Hash intégrité invalide');
    }

    // external_ref simple (future: PSP payment id après création) pour idempotence
    const externalRef = crypto.randomUUID();

    // Enregistrer commande (pending)
    const { data: order, error: orderErr } = await supabaseClient.from('cart_orders').insert([{
      user_id: user.id,
      status: 'pending',
      amount,
      currency: 'EUR',
      subtotal,
      vat_amount: vat,
      discount_amount: discount,
      promo_code: promo || null,
      credits_expected: creditsExpected,
  items: lineItems,
      payment_provider: 'mock',
      external_ref: externalRef
    }]).select().single();

    if (orderErr) throw orderErr;

    // Mock checkout URL (remplacer par vrai PSP ensuite)
    // Enregistrer usage promo (limites non encore décrémentées) si promo
    if (promo && discount > 0) {
      const up = promo.toUpperCase();
      await supabaseClient.from('promo_code_usages').insert([{
        code: up,
        user_id: user.id,
        order_id: order.id
      }]);
      // Increment global usage (best-effort)
      await supabaseClient.rpc('increment_promo_usage', { _code: up });
    }

    const checkoutUrl = `${req.headers.get('origin')}/cart?mockPaid=true&orderId=${order.id}&ext=${externalRef}`;

    return new Response(JSON.stringify({ orderId: order.id, checkoutUrl, amount, currency: 'EUR', hash: serverHash }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (e) {
    console.error('create-cart-payment error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
