// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
// Edge Function: enable-realtime-marketplace
// Objectif: ajouter fleetmarket_missions (+ éventuellement marketplace_missions) à la publication supabase_realtime
// Sécurisé par un header Authorization: Bearer <SERVICE_TOKEN> (configuré côté Vercel/Supabase, pas côté client)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Vérifier autorisation (token admin/service)
    const auth = req.headers.get("authorization") || "";
    const expected = Deno.env.get("EDGE_ADMIN_BEARER");
    if (!expected || !auth.startsWith("Bearer ") || auth !== `Bearer ${expected}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Connexion Postgres directe via variables d'env (service role recommended)
    const DB_HOST = Deno.env.get("DB_HOST");
    const DB_PORT = Number(Deno.env.get("DB_PORT")) || 5432;
    const DB_NAME = Deno.env.get("DB_NAME") || "postgres";
    const DB_USER = Deno.env.get("DB_USER") || "postgres";
    const DB_PASSWORD = Deno.env.get("DB_PASSWORD");
    const DB_SSL = (Deno.env.get("DB_SSL") || "require").toLowerCase();

    if (!DB_HOST || !DB_PASSWORD) {
      return new Response(JSON.stringify({ error: "DB env not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pool = new Pool({
      hostname: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      database: DB_NAME,
      password: DB_PASSWORD,
      tls: DB_SSL === "disable" ? undefined : {},
    }, 1);

    const sql = async (query: string) => {
      const client = await pool.connect();
      try { return await client.queryArray(query); }
      finally { client.release(); }
    };

    // Ajout des tables à la publication, idempotent
    const stmts = [
      "alter publication supabase_realtime add table public.fleetmarket_missions",
      "do $$ begin if exists (select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='marketplace_missions' and c.relkind='r') then begin execute 'alter publication supabase_realtime add table public.marketplace_missions'; exception when duplicate_object then null; end; end if; end $$;"
    ];

    for (const s of stmts) {
      try {
        await sql(s);
      } catch (e) {
        // Ignorer duplicate_object
        if (!String(e?.message || e).includes("duplicate")) {
          console.error("SQL error:", e);
          return new Response(JSON.stringify({ error: "SQL failed", detail: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Unexpected", detail: String(err?.message || err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
