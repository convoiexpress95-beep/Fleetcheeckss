/// <reference path="../types.d.ts" />
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || undefined; // 'upload' | 'download'
    const isGet = req.method === 'GET';
    const body = isGet ? {} : await req.json().catch(() => ({}));
    const missionId: string | undefined = (isGet ? url.searchParams.get('missionId') : body?.missionId) ?? undefined;
    const folder: string | undefined = (isGet ? url.searchParams.get('folder') : body?.folder) ?? undefined; // departure|arrival|receipts|documents
    const filename: string | undefined = (isGet ? url.searchParams.get('filename') : body?.filename) ?? undefined;
    const contentType: string | undefined = (isGet ? url.searchParams.get('contentType') : body?.contentType) ?? undefined;
    const requestedAction = action || body?.action;

    if (!missionId || !folder || !requestedAction) {
      return new Response(JSON.stringify({ error: 'missionId, folder and action are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const SUPA_URL = Deno.env.get('FUNCTION_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE_KEY = Deno.env.get('FUNCTION_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const ANON_KEY = Deno.env.get('FUNCTION_SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Get user from the incoming bearer token using anon client
    const incomingAuth = req.headers.get('Authorization') || undefined;
    const anon = createClient(SUPA_URL, ANON_KEY, { global: { headers: incomingAuth ? { Authorization: incomingAuth } : {} } });
    const { data: userRes } = await anon.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

  const admin = createClient(SUPA_URL, SERVICE_ROLE_KEY);

    // Verify participant
    const { data: mission, error: mErr } = await admin
      .from('missions')
      .select('id, created_by, donor_id, driver_id, reference')
      .eq('id', missionId)
      .single();
    if (mErr || !mission) {
      return new Response(JSON.stringify({ error: 'Mission not found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 });
    }
    const uid = user.id;
    const participant = mission.created_by === uid || mission.donor_id === uid || mission.driver_id === uid;
    if (!participant) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
    }

    const safeFolder = ['departure', 'arrival', 'receipts', 'documents'].includes(folder) ? folder : 'documents';
    const safeFilename = filename?.replace(/[^A-Za-z0-9._-]/g, '_') || `${crypto.randomUUID()}.bin`;
    const path = `missions/${missionId}/${safeFolder}/${safeFilename}`;

    if (requestedAction === 'upload') {
      // Ensure bucket exists (auto-create if missing)
      try {
        const { data: buckets } = await admin.storage.listBuckets();
        const exists = buckets?.some((b: any) => b.name === 'mission-photos');
        if (!exists) {
          await admin.storage.createBucket('mission-photos', { public: false });
        }
      } catch (_) { /* ignore - will error out at createSignedUploadUrl if truly missing */ }
      // Create a signed upload URL/token valid for a short time.
      const { data: signed, error: sErr } = await admin.storage
        .from('mission-photos')
        .createSignedUploadUrl(path, { upsert: false });
      if (sErr || !signed) {
        return new Response(JSON.stringify({ error: 'Cannot create upload URL', details: sErr?.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
      }
      return new Response(JSON.stringify({ path, uploadUrl: signed.signedUrl, token: signed.token, contentType: contentType || 'application/octet-stream' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    if (requestedAction === 'download') {
      const { data: dl, error: dErr } = await admin.storage
        .from('mission-photos')
        .createSignedUrl(path, 60 * 60);
      if (dErr || !dl?.signedUrl) {
        return new Response(JSON.stringify({ error: 'Cannot create download URL', details: dErr?.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
      }
      return new Response(JSON.stringify({ path, url: dl.signedUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Unsupported action' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
