// Edge function: email mission report with attachments (summary PDF + photos PDF)
// Provider: Resend (https://resend.com) via RESEND_API_KEY
// @ts-ignore Deno import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

declare const Deno: { env: { get(k: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPdf(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = req.method === 'GET' ? Object.fromEntries(new URL(req.url).searchParams.entries()) : await req.json().catch(() => ({}));
    const missionId = body.missionId as string | undefined;
    const to = (body.to as string | undefined)?.trim();
    const cc = (body.cc as string | undefined)?.trim();
    const bcc = (body.bcc as string | undefined)?.trim();

    if (!missionId || !to) {
      return new Response(JSON.stringify({ error: 'missionId and to are required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const SUPA_URL = Deno.env.get('FUNCTION_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE_KEY = Deno.env.get('FUNCTION_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(SUPA_URL, SERVICE_ROLE_KEY);

    // Mission metadata for email subject
    const { data: mission } = await supabase
      .from('missions')
      .select('id, reference, title')
      .eq('id', missionId)
      .maybeSingle();

    const subject = `Rapport de mission ${mission?.reference || missionId}`;

    // Build URLs for PDFs from existing edge functions
    const baseUrl = SUPA_URL.replace(/\/$/, '');
    const summaryUrl = `${baseUrl}/functions/v1/generate-mission-summary?missionId=${encodeURIComponent(missionId)}`;
    const photosUrl = `${baseUrl}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(missionId)}`;

    // Fetch both PDFs
    const [summaryPdf, photosPdf] = await Promise.all([
      fetchPdf(summaryUrl),
      fetchPdf(photosUrl).catch(() => new Uint8Array()) // tolerate missing photos
    ]);

    // Prepare attachments base64
    const toBase64 = (u8: Uint8Array) => {
      let binary = '';
      for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
      return btoa(binary);
    };
    const attachments: any[] = [];
    if (summaryPdf.length) attachments.push({ filename: `mission-${mission?.reference || missionId}-resume.pdf`, content: toBase64(summaryPdf) });
    if (photosPdf.length) attachments.push({ filename: `mission-${mission?.reference || missionId}-photos.pdf`, content: toBase64(photosPdf) });

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'noreply@fleetcheck.local';
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    // Build HTML with signed links to each photo so client can view in full resolution
    let htmlBody = `<div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">`;
    htmlBody += `<p>Bonjour,</p>`;
    htmlBody += `<p>Veuillez trouver ci-joint le rapport de mission <strong>${mission?.reference || missionId}</strong>.</p>`;
    try {
      const { data: dep } = await supabase
        .from('inspection_departures')
        .select('photos')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data: arr } = await supabase
        .from('inspection_arrivals')
        .select('photos')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const depPhotos: string[] = (dep as any)?.photos || [];
      const arrPhotos: string[] = (arr as any)?.photos || [];
      const photoPng = (p: string) => {
        const file = p.split('/').pop() || 'photo';
        const safe = encodeURIComponent(p);
        const nm = encodeURIComponent(file.replace(/\.[A-Za-z0-9]+$/, '') + '.png');
        return `${baseUrl}/functions/v1/photo-png?path=${safe}&name=${nm}`;
      };
      htmlBody += `<h3>Photos de départ</h3><ul>`;
      for (const p of depPhotos) {
        const url = photoPng(p);
        htmlBody += `<li><a href="${url}">${(p.split('/').pop()||'photo').replace(/\.[A-Za-z0-9]+$/, '')}.png</a></li>`;
      }
      htmlBody += `</ul>`;
      htmlBody += `<h3>Photos d'arrivée</h3><ul>`;
      for (const p of arrPhotos) {
        const url = photoPng(p);
        htmlBody += `<li><a href="${url}">${(p.split('/').pop()||'photo').replace(/\.[A-Za-z0-9]+$/, '')}.png</a></li>`;
      }
      htmlBody += `</ul>`;
    } catch {}
    htmlBody += `<p>Cordialement,<br/>FleetCheck</p></div>`;

    const payload = {
      from: fromEmail,
      to: [to],
      ...(cc ? { cc: [cc] } : {}),
      ...(bcc ? { bcc: [bcc] } : {}),
      subject,
      text: `Bonjour,\n\nVeuillez trouver ci-joint le rapport de mission ${mission?.reference || missionId}.\n\nLes photos sont disponibles via les liens sécurisés dans la version HTML de cet email.\n\nCordialement,\nFleetCheck`,
      html: htmlBody,
      attachments,
    };

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const msg = await r.text();
      return new Response(JSON.stringify({ error: 'Email send failed', details: msg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
