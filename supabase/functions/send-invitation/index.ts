// @ts-nocheck
// Minimal send-invitation edge function
// Returns a success payload; can be extended to actually send emails via your provider.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const { email, name, contactId, inviterName } = await req.json().catch(() => ({
      email: null,
      name: null,
      contactId: null,
      inviterName: null,
    }));

    const msg = `Invitation initialisée${email ? ` pour ${email}` : ''}${name ? ` (${name})` : ''}${inviterName ? ` par ${inviterName}` : ''}.`;

    return new Response(
      JSON.stringify({ ok: true, message: msg, contactId }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message || "Unhandled error" }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});