/// <reference path="../types.d.ts" />
import { serve } from "std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DirectionsRequest = {
  origin: string; // can be "lat,lng" or address string
  destination: string; // can be "lat,lng" or address string
  mode?: "driving" | "walking" | "bicycling" | "transit";
  language?: string; // default fr
};

function parseLatLng(input: string): { lat: number; lng: number } | null {
  const m = input.trim().match(/^\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\s*$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "";
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} h ${m} min`;
}

function makeOsrmInstruction(
  type: string | undefined,
  modifier: string | undefined,
  name: string | undefined,
  lang: string
): string {
  const road = name && name !== "" ? name : (lang === "fr" ? "la route" : "the road");
  const turnPhrase = (m?: string) => {
    const map: Record<string, { fr: string; en: string }> = {
      left: { fr: "à gauche", en: "left" },
      right: { fr: "à droite", en: "right" },
      straight: { fr: "tout droit", en: "straight" },
      "slight left": { fr: "légèrement à gauche", en: "slight left" },
      "slight right": { fr: "légèrement à droite", en: "slight right" },
      uturn: { fr: "demi-tour", en: "u-turn" },
    };
    const key = (m || "").toLowerCase();
    const t = map[key];
    if (!t) return lang === "fr" ? "" : "";
    return lang === "fr" ? t.fr : t.en;
  };
  const lowerType = (type || "").toLowerCase();
  switch (lowerType) {
    case "depart":
      return lang === "fr" ? "Commencez" : "Start";
    case "arrive":
      return lang === "fr" ? "Vous êtes arrivé" : "You have arrived";
    case "turn":
    case "end of road":
    case "merge":
    case "fork":
    case "new name": {
      const phrase = turnPhrase(modifier);
      if (lang === "fr") return phrase ? `Tournez ${phrase} sur ${road}` : `Continuez sur ${road}`;
      return phrase ? `Turn ${phrase} onto ${road}` : `Continue on ${road}`;
    }
    case "roundabout":
      return lang === "fr" ? `Prenez le rond-point et continuez sur ${road}` : `Enter roundabout and continue on ${road}`;
    default:
      return lang === "fr" ? `Continuez sur ${road}` : `Continue on ${road}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const isGet = req.method === "GET";
    const url = new URL(req.url);

    // Robust body parsing to tolerate various clients (JSON, form, raw text)
    const readBody = async (): Promise<Partial<DirectionsRequest>> => {
      if (isGet) return {};
      const ct = (req.headers.get("content-type") || "").toLowerCase();
      try {
        if (ct.includes("application/json")) {
          return await req.json();
        }
        const raw = await req.text();
        if (!raw) return {};
        if (ct.includes("application/x-www-form-urlencoded")) {
          const sp = new URLSearchParams(raw);
          return {
            origin: sp.get("origin") ?? undefined,
            destination: sp.get("destination") ?? undefined,
            mode: (sp.get("mode") as any) ?? undefined,
            language: sp.get("language") ?? undefined,
          };
        }
        // Try JSON even if content-type is wrong
        try {
          const j = JSON.parse(raw);
          return j;
        } catch {
          // Try to parse key=value&key2=value2 format as a last resort
          const sp = new URLSearchParams(raw);
          return {
            origin: sp.get("origin") ?? undefined,
            destination: sp.get("destination") ?? undefined,
            mode: (sp.get("mode") as any) ?? undefined,
            language: sp.get("language") ?? undefined,
          };
        }
      } catch {
        return {};
      }
    };

    const body = await readBody();

    // Accept parameters from either body or query string
    const origin = (body.origin || url.searchParams.get("origin") || "").toString().trim();
    const destination = (body.destination || url.searchParams.get("destination") || "").toString().trim();
    const mode = ((body.mode || url.searchParams.get("mode") || "driving").toString()) as DirectionsRequest["mode"];
    const language = (body.language || url.searchParams.get("language") || "fr").toString();

    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ error: "origin and destination are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // Mapbox uniquement
    const MAPBOX_TOKEN =
      Deno.env.get("FUNCTION_MAPBOX_TOKEN") ||
      Deno.env.get("MAPBOX_TOKEN") ||
      "";
    if (MAPBOX_TOKEN) {
      // Resolve coordinates (lat,lng or via geocoding)
      const ensureCoords = async (value: string): Promise<{ lat: number; lng: number }> => {
        const parsed = parseLatLng(value);
        if (parsed) return parsed;
        // Geocode address -> take the first result
        const geocodeUrl = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(value) + ".json");
        geocodeUrl.searchParams.set("access_token", MAPBOX_TOKEN);
        geocodeUrl.searchParams.set("limit", "1");
        geocodeUrl.searchParams.set("language", language);
        const g = await fetch(geocodeUrl.toString());
        if (!g.ok) throw new Error("Geocoding failed");
        const gj = await g.json();
        const feat = gj?.features?.[0];
        if (!feat?.center || feat.center.length < 2) throw new Error("Address not found");
        const [lng, lat] = feat.center;
        return { lat, lng };
      };

      const o = await ensureCoords(origin);
      const d = await ensureCoords(destination);
      const profile = mode === "walking" ? "walking" : mode === "bicycling" ? "cycling" : "driving";
      const directionsUrl = new URL(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${o.lng},${o.lat};${d.lng},${d.lat}`
      );
      directionsUrl.searchParams.set("alternatives", "false");
      directionsUrl.searchParams.set("steps", "true");
      directionsUrl.searchParams.set("geometries", "polyline");
      directionsUrl.searchParams.set("language", language);
      directionsUrl.searchParams.set("overview", "full");
      directionsUrl.searchParams.set("access_token", MAPBOX_TOKEN);
      const resp = await fetch(directionsUrl.toString(), { method: "GET" });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        return new Response(
          JSON.stringify({ error: "Failed to fetch directions (Mapbox)", details: txt }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
        );
      }
      const data = await resp.json();
      if (!data?.routes?.length) {
        return new Response(JSON.stringify({ error: "No route found (Mapbox)" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404,
        });
      }
      const route = data.routes[0];
      const leg = route.legs?.[0];
      const steps = (leg?.steps || []).map((s: any) => ({
        instruction: s?.maneuver?.instruction || "",
        distanceText: formatDistance(s?.distance ?? 0),
        durationText: formatDuration(s?.duration ?? 0),
        distanceMeters: s?.distance ?? undefined,
        durationSeconds: s?.duration ?? undefined,
        maneuverType: s?.maneuver?.type || undefined,
        maneuverModifier: s?.maneuver?.modifier || undefined,
        polyline: s?.geometry || undefined,
      }));
      const result = {
        overview_polyline: route.geometry || "",
        steps,
        routeDistanceMeters: route?.distance ?? undefined,
        routeDurationSeconds: route?.duration ?? undefined,
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }
    return new Response(
      JSON.stringify({ error: "Mapbox n'est pas configuré. Ajoutez FUNCTION_MAPBOX_TOKEN dans les secrets du projet." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 501 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
