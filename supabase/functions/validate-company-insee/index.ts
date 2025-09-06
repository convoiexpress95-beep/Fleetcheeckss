import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMPANY-VALIDATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { siret } = await req.json();
    if (!siret) {
      throw new Error("SIRET number is required");
    }

    // Nettoyer le SIRET (enlever espaces et caractères spéciaux)
    const cleanSiret = siret.replace(/[^0-9]/g, '');
    if (cleanSiret.length !== 14) {
      throw new Error("SIRET must be exactly 14 digits");
    }
    logStep("SIRET validated", { siret: cleanSiret });

    // Utiliser l'API publique d'annuaire-entreprises.data.gouv.fr
    const publicApiResponse = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}&mtm_campaign=api`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!publicApiResponse.ok) {
      throw new Error(`API error: ${publicApiResponse.status}`);
    }

    const apiData = await publicApiResponse.json();
    logStep("Public API response received", { results: apiData.total_results });

    if (!apiData.results || apiData.results.length === 0) {
      throw new Error("SIRET number not found in database");
    }

    const etablissement = apiData.results[0];
    const siege = etablissement.siege;
    logStep("Company data found", { companyName: etablissement.nom_complet });

    // Construire l'adresse complète depuis les données du siège
    const addressParts = [];
    if (siege.numero_voie) {
      addressParts.push(siege.numero_voie);
    }
    if (siege.type_voie) {
      addressParts.push(siege.type_voie);
    }
    if (siege.libelle_voie) {
      addressParts.push(siege.libelle_voie);
    }
    if (siege.complement_adresse) {
      addressParts.push(siege.complement_adresse);
    }

    const fullAddress = addressParts.join(' ');

    // Formatter les données pour l'application
    const companyData = {
      siret: siege.siret,
      siren: etablissement.siren,
      company_name: etablissement.nom_complet || etablissement.nom_raison_sociale || "Nom non disponible",
      legal_form: etablissement.nature_juridique,
      address: fullAddress || siege.adresse,
      postal_code: siege.code_postal,
      city: siege.libelle_commune,
      country: siege.libelle_pays_etranger || "France",
      creation_date: etablissement.date_creation,
      is_head_office: siege.est_siege,
      administrative_status: etablissement.etat_administratif,
      main_activity: siege.activite_principale,
      employee_range: siege.tranche_effectif_salarie,
      is_active: etablissement.etat_administratif === 'A',
    };

    logStep("Company data formatted successfully", { companyName: companyData.company_name });

    return new Response(JSON.stringify({
      success: true,
      data: companyData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in INSEE validation", { message: errorMessage });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});