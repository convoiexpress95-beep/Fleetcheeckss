// Minimal proxy helper for French-named wrappers
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "std/http/server.ts";

export function proxyTo(targetName: string) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    const origin = new URL(req.url).origin;
    const url = `${origin}/functions/v1/${targetName}`;
    const body = req.body ? await req.arrayBuffer() : undefined;
    const resp = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body,
      redirect: "manual",
    });
    const resBody = await resp.arrayBuffer();
    const headers = new Headers(resp.headers);
    for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v as string);
    return new Response(resBody, { status: resp.status, headers });
  });
}
