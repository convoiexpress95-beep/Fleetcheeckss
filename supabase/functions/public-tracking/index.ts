// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let token = url.searchParams.get('token')
    // Fallback: accepter aussi le token envoyé dans le corps (POST) via supabase.functions.invoke
    if (!token && req.method !== 'GET') {
      try {
        const body = await req.json()
        token = body?.token || null
      } catch (_) {
        // ignore body parse errors
      }
    }
    
  if (!token) {
      return new Response(JSON.stringify({ error: 'Tracking token is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get tracking link and verify it's valid
    const { data: trackingLink, error: linkError } = await supabaseClient
      .from('tracking_links')
      .select(`
        mission_id,
        expires_at,
        is_active,
        missions (
          id,
          reference,
          title,
          pickup_address,
          delivery_address,
          status,
          pickup_date,
          delivery_date
        )
      `)
      .eq('tracking_token', token)
      .eq('is_active', true)
      .single()

    if (linkError || !trackingLink) {
      return new Response(JSON.stringify({ error: 'Invalid or expired tracking link' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Check if link has expired
    const now = new Date()
    const expiresAt = new Date(trackingLink.expires_at)
    if (now > expiresAt) {
      return new Response(JSON.stringify({ error: 'Tracking link has expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 410,
      })
    }

    // Get current tracking data if available
    const { data: tracking } = await supabaseClient
      .from('mission_tracking')
      .select('*')
      .eq('mission_id', trackingLink.mission_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const response = {
      mission: trackingLink.missions,
      tracking: tracking || null,
      lastUpdate: tracking?.created_at || null
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in public-tracking:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})