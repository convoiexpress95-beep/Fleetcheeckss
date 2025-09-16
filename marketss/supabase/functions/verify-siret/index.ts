import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INSEE_API_KEY = Deno.env.get('INSEE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { siret } = await req.json();

    if (!siret || siret.length !== 14) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SIRET invalide - doit contenir 14 chiffres' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!INSEE_API_KEY) {
      console.error('INSEE_API_KEY not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Service de vérification SIRET non configuré' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Verifying SIRET: ${siret}`);

    // First, get OAuth token from INSEE
    const tokenResponse = await fetch('https://api.insee.fr/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(INSEE_API_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get INSEE token:', tokenResponse.status);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur d\'authentification INSEE' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Then query the SIRENE API
    const sireneResponse = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!sireneResponse.ok) {
      console.error('SIRENE API error:', sireneResponse.status);
      
      if (sireneResponse.status === 404) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'SIRET non trouvé' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la requête INSEE' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sireneData = await sireneResponse.json();
    const etablissement = sireneData.etablissement;

    if (!etablissement) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Données établissement non trouvées' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract company information
    const uniteLegale = etablissement.uniteLegale;
    const adresseEtablissement = etablissement.adresseEtablissement;

    const company = {
      siret: etablissement.siret,
      siren: etablissement.siren,
      denomination: uniteLegale?.denominationUniteLegale || null,
      nom: uniteLegale?.prenom1UniteLegale && uniteLegale?.nomUniteLegale 
        ? `${uniteLegale.prenom1UniteLegale} ${uniteLegale.nomUniteLegale}` 
        : null,
      activitePrincipale: etablissement.activitePrincipaleEtablissement,
      adresse: adresseEtablissement ? [
        adresseEtablissement.numeroVoieEtablissement,
        adresseEtablissement.indiceRepetitionEtablissement,
        adresseEtablissement.typeVoieEtablissement,
        adresseEtablissement.libelleVoieEtablissement,
        adresseEtablissement.codePostalEtablissement,
        adresseEtablissement.libelleCommuneEtablissement
      ].filter(Boolean).join(' ') : null,
      etatAdministratif: etablissement.etatAdministratifEtablissement,
      dateCreation: etablissement.dateCreationEtablissement
    };

    console.log('SIRET verification successful:', company.siret);

    return new Response(JSON.stringify({ 
      success: true, 
      company 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-siret function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});