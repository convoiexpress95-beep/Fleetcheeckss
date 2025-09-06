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

    const { planType } = await req.json();

    // Définir les prix et crédits par plan
    const plans = {
      debutant: { price: "9.99", credits: 10, name: "Pack Débutant" },
      pro: { price: "19.99", credits: 25, name: "Pack Pro" },
      expert: { price: "39.99", credits: 100, name: "Pack Expert" },
      entreprise: { price: "79.99", credits: 650, name: "Pack Entreprise" }
    };

    const selectedPlan = plans[planType as keyof typeof plans];
    if (!selectedPlan) {
      throw new Error("Plan invalide");
    }

    // Obtenir la clé API Mollie
    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieApiKey) {
      throw new Error("Clé API Mollie manquante - vérifiez MOLLIE_API_KEY");
    }

    console.log("Creating Mollie payment:", { planType, amount: selectedPlan.price });

    // Créer un paiement Mollie
    const paymentResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: selectedPlan.price
        },
        description: `${selectedPlan.name} - ${selectedPlan.credits} crédits`,
        redirectUrl: `${req.headers.get("origin")}/shop?success=true&plan=${planType}`,
        cancelUrl: `${req.headers.get("origin")}/shop?cancelled=true`,
        metadata: {
          userId: user.id,
          planType: planType,
          credits: selectedPlan.credits.toString()
        },
        method: ["creditcard", "paypal"] // Accepter carte de crédit et PayPal
      })
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("Mollie API error:", errorText);
      throw new Error("Erreur lors de la création du paiement Mollie");
    }

    const paymentData = await paymentResponse.json();
    console.log("Mollie payment created:", paymentData.id);

    return new Response(JSON.stringify({ 
      paymentId: paymentData.id,
      checkoutUrl: paymentData._links.checkout.href,
      planType,
      credits: selectedPlan.credits
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erreur dans create-mollie-payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});