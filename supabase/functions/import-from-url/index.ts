// @ts-nocheck
// Supabase Edge Function: import-from-url
// POST { urls: string[], targetPrefix: string } -> uploads each URL into 'vehicle-assets/<targetPrefix>'
// Tries to resolve non-direct links (HTML) by reading og:image when available.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type RequestBody = {
  urls: string[];
  targetPrefix: string; // e.g. catalog/volkswagen
};

type ImportResult = {
  url: string;
  ok: boolean;
  error?: string;
  path?: string;
};

function sanitizePathPart(s: string) {
  return (s || '')
    .replace(/\\/g, '/')
    .split('/')
    .map((p) => p.trim().replace(/\s+/g, '_').toLowerCase())
    .filter(Boolean)
    .join('/');
}

function guessExtFromContentType(ct: string | null): string {
  const c = (ct || '').toLowerCase();
  if (c.includes('image/png')) return 'png';
  if (c.includes('image/webp')) return 'webp';
  if (c.includes('image/jpeg') || c.includes('image/jpg')) return 'jpg';
  if (c.includes('image/svg')) return 'svg';
  if (c.includes('image/gif')) return 'gif';
  return 'png';
}

async function fetchImageOrResolve(url: string): Promise<{ blob: Blob; finalUrl: string; contentType: string | null }>{
  const res = await fetch(url, { redirect: 'follow' });
  const ct = res.headers.get('content-type');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (ct && ct.startsWith('image/')) {
    const blob = await res.blob();
    return { blob, finalUrl: res.url || url, contentType: ct };
  }
  // Try to resolve indirect pages by grabbing og:image
  const text = await res.text();
  const m = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i);
  if (m && m[1]) {
    const direct = m[1];
    const res2 = await fetch(direct, { redirect: 'follow' });
    if (!res2.ok) throw new Error(`Resolved HTTP ${res2.status}`);
    const ct2 = res2.headers.get('content-type');
    const blob = await res2.blob();
    return { blob, finalUrl: res2.url || direct, contentType: ct2 };
  }
  throw new Error('Unsupported content type (not image and no og:image)');
}

function filenameFromUrl(u: string): string {
  try {
    const url = new URL(u);
    let name = url.pathname.split('/').pop() || `image_${Date.now()}`;
    name = name.split('?')[0].split('#')[0];
    return name;
  } catch {
    return `image_${Date.now()}`;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const body = (await req.json()) as RequestBody;
    const urls = Array.isArray(body.urls) ? body.urls : [];
    const targetPrefix = sanitizePathPart(body.targetPrefix || 'catalog');
    if (!urls.length) return new Response(JSON.stringify({ error: 'No URLs' }), { status: 400 });

  const SUPABASE_URL = Deno.env.get('PROJECT_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: ImportResult[] = [];
    for (const url of urls) {
      try {
        const { blob, finalUrl, contentType } = await fetchImageOrResolve(url);
        let fname = filenameFromUrl(finalUrl);
        if (!/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fname)) {
          fname = `${fname}.${guessExtFromContentType(contentType)}`;
        }
        fname = sanitizePathPart(fname);
        const path = `${targetPrefix}/${fname}`;
        const arrayBuffer = await blob.arrayBuffer();
        const { error } = await supabase.storage
          .from('vehicle-assets')
          .upload(path, new Uint8Array(arrayBuffer), { contentType: contentType || 'image/*', upsert: true });
        if (error) throw error;
        results.push({ url, ok: true, path });
      } catch (e: any) {
        results.push({ url, ok: false, error: String(e?.message || e) });
      }
    }
    return new Response(JSON.stringify({ results }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
});
