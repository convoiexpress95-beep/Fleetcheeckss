import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    const { paymentId, planType } = await req.json();

    if (!paymentId) {
      throw new Error("ID de paiement Mollie requis");
    }

    console.log("Verifying Mollie payment:", paymentId);

    // Obtenir la clé API Mollie
    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieApiKey) {
      throw new Error("Clé API Mollie manquante - vérifiez MOLLIE_API_KEY");
    }

    // Vérifier le statut du paiement Mollie
    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${mollieApiKey}`,
      }
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("Mollie payment verification error:", errorText);
      throw new Error("Erreur lors de la vérification du paiement Mollie");
    }

    const paymentData = await paymentResponse.json();
    console.log("Mollie payment status:", paymentData.status);

    // Vérifier que le paiement a été complété avec succès
    if (paymentData.status !== "paid") {
      throw new Error(`Le paiement Mollie n'a pas été complété. Statut: ${paymentData.status}`);
    }

    // Extraire les informations de paiement
    const amount = parseFloat(paymentData.amount.value);
    const credits = parseInt(paymentData.metadata?.credits || "0");

    // Utiliser la fonction de traitement de paiement
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Créer une fonction similaire à process_paypal_payment mais pour Mollie
    const { data: processResult, error } = await supabaseService.rpc('process_mollie_payment', {
      _user_id: user.id,
      _plan_type: planType,
      _amount: amount,
      _mollie_transaction_id: paymentId
    });

    if (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      
      // Fallback: utiliser process_paypal_payment si process_mollie_payment n'existe pas
      const { data: fallbackResult, error: fallbackError } = await supabaseService.rpc('process_paypal_payment', {
        _user_id: user.id,
        _plan_type: planType,
        _amount: amount,
        _paypal_transaction_id: paymentId
      });

      if (fallbackError) {
        console.error("Erreur de fallback:", fallbackError);
        throw new Error("Erreur lors du traitement du paiement");
      }

      console.log("Payment processed with fallback:", fallbackResult);

      return new Response(JSON.stringify({ 
        success: true,
        paymentId,
        amount,
        creditsAdded: fallbackResult.credits_added,
        planType: fallbackResult.plan_type
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Payment processed successfully:", processResult);

    return new Response(JSON.stringify({ 
      success: true,
      paymentId,
      amount,
      creditsAdded: processResult.credits_added,
      planType: processResult.plan_type
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erreur dans capture-mollie-payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});