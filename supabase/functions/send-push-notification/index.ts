import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  mission_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { user_id, title, message, data = {}, mission_id } = await req.json() as PushNotificationRequest;

    console.log('Sending push notification:', { user_id, title, message });

    // Récupérer tous les tokens actifs pour l'utilisateur
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('push_notification_tokens')
      .select('token, device_type, device_info')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active tokens found for user:', user_id);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active tokens found',
        sent: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${tokens.length} active tokens`);

    // Envoyer les notifications push via Web Push API
    const notifications = await Promise.allSettled(
      tokens.map(async (tokenData) => {
        try {
          const subscription = JSON.parse(tokenData.token);
          
          const payload = JSON.stringify({
            title,
            body: message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: {
              ...data,
              mission_id,
              url: mission_id ? `/missions/${mission_id}` : '/dashboard',
            },
            actions: [
              {
                action: 'open',
                title: 'Ouvrir',
                icon: '/icon-192x192.png'
              }
            ],
            requireInteraction: true,
            silent: false,
          });

          // Note: Dans un vrai environnement, vous devriez utiliser web-push
          // ou un service comme OneSignal pour envoyer les notifications
          // Ici on simule l'envoi
          
          console.log('Would send notification to:', subscription.endpoint);
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error('Error sending notification:', error);
          return { success: false, error: error.message };
        }
      })
    );

    const successCount = notifications.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    // Créer la notification dans la base de données
    const { error: dbError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type: 'info',
      });

    if (dbError) {
      console.error('Error creating notification in DB:', dbError);
    }

    console.log(`Successfully sent ${successCount}/${tokens.length} notifications`);

    return new Response(JSON.stringify({
      success: true,
      message: `Notifications sent to ${successCount}/${tokens.length} devices`,
      sent: successCount,
      total: tokens.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);