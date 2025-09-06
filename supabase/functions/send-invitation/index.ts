// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('Invalid token');
    }

    const { contactId, email, name, inviterName } = await req.json();

    console.log('Sending invitation:', { contactId, email, name, inviterName });

  // Si contactId est fourni, c'est un renvoi d'invitation
    if (contactId) {
      const { error } = await supabaseClient
        .from('contacts')
        .update({ 
          invited_at: new Date().toISOString(),
          status: 'pending' 
        })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating contact:', error);
        throw error;
      }

      // Récupérer le contact pour déterminer s'il faut renvoyer un email
      const { data: contact, error: fetchErr } = await supabaseClient
        .from('contacts')
        .select('email, invited_user_id')
        .eq('id', contactId)
        .eq('user_id', user.id)
        .single();

      if (fetchErr) {
        console.error('Error fetching contact after update:', fetchErr);
        throw fetchErr;
      }

      if (!contact) {
        return new Response(
          JSON.stringify({ success: false, message: 'Contact introuvable après mise à jour' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Si l'utilisateur n'est pas encore inscrit, renvoyer une invitation Auth
      if (!contact.invited_user_id && contact.email) {
        const { error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(contact.email, {
          redirectTo: Deno.env.get('INVITE_REDIRECT_TO') || undefined,
          data: {
            invited_by: user.id,
            inviter_email: user.email,
            inviter_name: inviterName || user.email,
            intent: 'contact_invitation_resent'
          }
        });

        if (inviteError) {
          console.error('Error resending auth invite email:', inviteError);
          // Continuer mais signaler que l'email n'a pas été envoyé
          return new Response(
            JSON.stringify({ success: false, message: "Invitation mise à jour, mais l'email n'a pas pu être renvoyé.", details: inviteError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Invitation renvoyée par email au contact non inscrit.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Utilisateur déjà inscrit: on ne renvoie pas d'email via Auth
      return new Response(
        JSON.stringify({ success: true, message: "Invitation réinitialisée. Aucun email renvoyé (utilisateur déjà inscrit)." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Nouveau contact - vérifier si l'email existe dans auth.users
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingUser) {
      // L'utilisateur existe déjà : créer le contact et informer côté UI.
      const { error: contactError } = await supabaseClient
        .from('contacts')
        .insert({
          user_id: user.id,
          email,
          name: name || email,
          invited_user_id: existingUser.user_id,
          status: 'pending',
          invited_at: new Date().toISOString(),
        });

      if (contactError) {
        console.error('Error creating contact:', contactError);
        throw contactError;
      }

      // Option: envoyer un email de notification via un provider (RESEND/SendGrid) si configuré.
      // Non implémenté par défaut pour éviter d'échouer sans clés externes.

      console.log(`Invitation enregistrée pour utilisateur existant ${email} par ${inviterName || user.email}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation enregistrée pour un utilisateur existant'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // L'utilisateur n'existe pas : créer le contact puis envoyer une vraie invitation via Auth Admin
      const { error: contactError } = await supabaseClient
        .from('contacts')
        .insert({
          user_id: user.id,
          email,
          name: name || email,
          status: 'pending',
          invited_at: new Date().toISOString(),
        });

      if (contactError) {
        console.error('Error creating contact for non-registered user:', contactError);
        throw contactError;
      }

      // Envoi de l'email d'invitation via Supabase Auth (nécessite SMTP configuré dans Auth > Email)
      const { data: inviteData, error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
        // redirectTo optionnel; si omis, utilise Auth Site URL configuré dans Supabase
        redirectTo: Deno.env.get('INVITE_REDIRECT_TO') || undefined,
        data: {
          invited_by: user.id,
          inviter_email: user.email,
          inviter_name: inviterName || user.email,
          intent: 'contact_invitation'
        }
      });

      if (inviteError) {
        console.error('Error sending auth invite email:', inviteError);
        // Ne pas échouer l’ensemble si l’email ne part pas; retourner un message explicite
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Contact créé mais l'email d'invitation n'a pas pu être envoyé. Vérifiez la config SMTP de Supabase.",
            details: inviteError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Invitation email envoyée à ${email} par ${inviterName || user.email}`, inviteData);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invitation envoyée par email au nouveau contact"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});