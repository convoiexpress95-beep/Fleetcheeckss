// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Payload = {
  ride_id: string;
  recipient_id: string;
  body: string;
  sender_id?: string;
  sender_name?: string;
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const payload = await req.json() as Payload;
    const { ride_id, recipient_id, body, sender_id, sender_name } = payload || {} as any;
    if (!ride_id || !recipient_id || !body) {
      return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // Fetch active tokens for recipient
    const { data: tokens, error: tokenErr } = await sb
      .from('push_notification_tokens')
      .select('token, device_type, is_active')
      .eq('user_id', recipient_id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });
    if (tokenErr) throw tokenErr;
    const valid = (tokens || []).filter((t: any) => t?.token && (t.is_active ?? true));
    if (valid.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const title = sender_name ? `${sender_name}` : 'Nouveau message';
    const chunks = valid.map((t: any) => ({
      to: t.token,
      sound: 'default',
      title,
      body: body.length > 120 ? body.slice(0, 117) + '…' : body,
      data: { type: 'ride_message', ride_id, peer_user_id: sender_id || null },
      priority: 'high',
    }));

    const resp = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chunks),
    });
    const json = await resp.json().catch(() => ({}));

  return new Response(JSON.stringify({ ok: true, sent: valid.length, expo: json }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
  return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
