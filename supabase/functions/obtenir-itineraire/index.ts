import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const base = `${url.origin}/functions/v1/get-directions`;

  // Try to read body and convert to query params for reliability
  let originParam = url.searchParams.get("origin") ?? undefined;
  let destinationParam = url.searchParams.get("destination") ?? undefined;
  let modeParam = url.searchParams.get("mode") ?? undefined;
  let languageParam = url.searchParams.get("language") ?? undefined;

  if (req.method !== "GET") {
    try {
      const ct = (req.headers.get("content-type") || "").toLowerCase();
      if (ct.includes("application/json")) {
        const j = await req.json();
        originParam = (j?.origin ?? originParam) || undefined;
        destinationParam = (j?.destination ?? destinationParam) || undefined;
        modeParam = (j?.mode ?? modeParam) || undefined;
        languageParam = (j?.language ?? languageParam) || undefined;
      } else {
        const raw = await req.text();
        if (raw) {
          try {
            const j = JSON.parse(raw);
            originParam = (j?.origin ?? originParam) || undefined;
            destinationParam = (j?.destination ?? destinationParam) || undefined;
            modeParam = (j?.mode ?? modeParam) || undefined;
            languageParam = (j?.language ?? languageParam) || undefined;
          } catch {
            const sp = new URLSearchParams(raw);
            originParam = sp.get("origin") ?? originParam ?? undefined;
            destinationParam = sp.get("destination") ?? destinationParam ?? undefined;
            modeParam = sp.get("mode") ?? modeParam ?? undefined;
            languageParam = sp.get("language") ?? languageParam ?? undefined;
          }
        }
      }
    } catch {}
  }

  const forwardUrl = new URL(base);
  if (originParam) forwardUrl.searchParams.set("origin", String(originParam));
  if (destinationParam) forwardUrl.searchParams.set("destination", String(destinationParam));
  if (modeParam) forwardUrl.searchParams.set("mode", String(modeParam));
  if (languageParam) forwardUrl.searchParams.set("language", String(languageParam));

  const resp = await fetch(forwardUrl.toString(), { method: "GET", redirect: "manual" });
  const resBody = await resp.arrayBuffer();
  const headers = new Headers(resp.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v as string);
  return new Response(resBody, { status: resp.status, headers });
});
