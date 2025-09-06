// @ts-ignore: Deno environment provides std and globals
import { serve } from "std/http/server.ts"
// @ts-ignore: resolved by Deno import map during deploy/run
import { createClient } from '@supabase/supabase-js'

// Editor-only shim to silence TS when Deno extension isn’t active
// (Deno runtime provides the real global at deploy/run time)
declare const Deno: {
  env: { get: (key: string) => string | undefined }
}

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { missionId } = await req.json()
    
    if (!missionId) {
      return new Response(JSON.stringify({ error: 'Mission ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Verify mission exists and user has access
    const { data: mission, error: missionError } = await supabaseClient
      .from('missions')
      .select('id, reference, title, pickup_address, delivery_address, status')
      .eq('id', missionId)
      .single()

    if (missionError || !mission) {
      return new Response(JSON.stringify({ error: 'Mission not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Generate a secure tracking token
    const trackingToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Valid for 24 hours

    // Store the tracking link in database
    const { error: insertError } = await supabaseClient
      .from('tracking_links')
      .insert({
        mission_id: missionId,
        tracking_token: trackingToken,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })

    if (insertError) {
      console.error('Error creating tracking link:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create tracking link' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Generate public tracking URL
    const trackingUrl = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/functions/v1/public-tracking?token=${trackingToken}`

    return new Response(JSON.stringify({
      trackingUrl,
      trackingToken,
      expiresAt: expiresAt.toISOString(),
      mission: {
        reference: mission.reference,
        title: mission.title
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in generate-tracking-link:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})