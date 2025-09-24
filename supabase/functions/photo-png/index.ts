// @ts-nocheck
// Edge Function: Convert a mission photo to PNG and return it (clickable & downloadable)
// Usage:
//   GET /functions/v1/photo-png?path=missions/..../file.jpg&name=photo.png&download=1
//   or /functions/v1/photo-png?url=https%3A%2F%2F.../mission-photos/.../file.jpg
// Notes:
//   - If the source is already PNG, we still re-emit as image/png.
//   - This function expects the bucket/object to be publicly accessible OR given as a full URL.
// @ts-ignore Deno import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// Lightweight image decode/encode in Deno
// https://deno.land/x/imagescript
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

declare const Deno: { env: { get(k: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const qs = url.searchParams;
    const path = (qs.get('path') || '').trim();
    const full = (qs.get('url') || '').trim();
    const name = (qs.get('name') || '').trim() || 'photo.png';
    const download = (qs.get('download') || '').trim() === '1';

    const SUPABASE_URL = (Deno.env.get('FUNCTION_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');

    let src = '';
    if (full && /^https?:\/\//i.test(full)) {
      src = full;
    } else if (path) {
      // Assume public bucket mission-photos
      const clean = path.replace(/^\/+/, '').replace(/^https?:\/\/[^/]+\//i, '');
      const base = `${SUPABASE_URL}/storage/v1/object/public/mission-photos`;
      src = `${base}/${clean}`;
    }
    if (!src) {
      return new Response(JSON.stringify({ error: 'Missing path or url' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const r = await fetch(src);
    if (!r.ok) {
      return new Response(JSON.stringify({ error: 'Source fetch failed', status: r.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 });
    }
    const buf = new Uint8Array(await r.arrayBuffer());
    // Decode any supported format and re-encode as PNG
    const img = await Image.decode(buf);
    const png = await img.encodePNG();

    const headers: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(png.length),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${name.replace(/"/g, '')}"`,
    };
    return new Response(png, { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
