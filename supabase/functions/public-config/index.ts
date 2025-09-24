// @ts-nocheck
import { serve } from "std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Politique: n'exposez que des valeurs explicitement publiques.
    // On privilégie PUBLIC_MAPBOX_TOKEN (si configuré). À défaut,
    // on utilise FUNCTION_MAPBOX_TOKEN uniquement s'il s'agit d'un token public (pk.).
    const PUBLIC_MAPBOX_TOKEN = Deno.env.get("PUBLIC_MAPBOX_TOKEN") || "";
    const FUNCTION_MAPBOX_TOKEN = Deno.env.get("FUNCTION_MAPBOX_TOKEN") || "";

    const chooseMapboxToken = () => {
      const t1 = (PUBLIC_MAPBOX_TOKEN || "").trim();
      if (t1 && t1.startsWith("pk.")) return t1;
      const t2 = (FUNCTION_MAPBOX_TOKEN || "").trim();
      if (t2 && t2.startsWith("pk.")) return t2;
      return "";
    };

    const mapboxToken = chooseMapboxToken();

    const body: Record<string, unknown> = {
      mapboxToken: mapboxToken || undefined,
      // Étendre ici d'autres configs publiques si besoin
    };

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("public-config error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
