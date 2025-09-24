// Edge function pour générer un résumé PDF de mission (sans photos)
// @ts-ignore - Deno import pour edge function
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno import pour edge function
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { createClient } from '@supabase/supabase-js';

declare const Deno: { env: { get(k: string): string | undefined } };

interface MissionSummary {
  id: string;
  reference: string | null;
  title: string | null;
  status: string;
  pickup_address: string | null;
  delivery_address: string | null;
  pickup_contact_name: string | null;
  delivery_contact_name: string | null;
  license_plate: string | null;
  vehicle_model: string | null;
  donor_earning: number | null;
  description: string | null;
  pickup_date: string | null;
  created_at: string;
  created_by: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'in_progress': return 'En cours';
    case 'completed': return 'Terminée';
    case 'cancelled': return 'Annulée';
    default: return 'Inconnu';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  try {
    // Support GET et POST
    let missionId: string | undefined;
    let action: string = 'download'; // 'download' ou 'preview'
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      missionId = url.searchParams.get('missionId') ?? undefined;
      action = url.searchParams.get('action') ?? 'download';
    } else if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      missionId = body?.missionId;
      action = body?.action || 'download';
    }

    if (!missionId) {
      return new Response(JSON.stringify({ error: 'Mission ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const SUPA_URL = Deno.env.get('FUNCTION_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE_KEY = Deno.env.get('FUNCTION_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(SUPA_URL, SERVICE_ROLE_KEY);

    // Récupérer la mission complète
    const { data: mission, error: missionErr } = await supabase
      .from('missions')
      .select(`
        id, reference, title, status, pickup_address, delivery_address,
        pickup_contact_name, delivery_contact_name, license_plate, vehicle_model,
        donor_earning, description, pickup_date, created_at, created_by
      `)
      .eq('id', missionId)
      .single();

    if (missionErr || !mission) {
      return new Response(JSON.stringify({ error: 'Mission not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const missionData: MissionSummary = mission as MissionSummary;

    // Créer le PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Constantes A4
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;
    const MARGIN = 50;

    // Page principale
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    let currentY = A4_HEIGHT - MARGIN;

    // En-tête
    page.drawText('RÉSUMÉ DE MISSION', {
      x: MARGIN,
      y: currentY,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });
    currentY -= 40;

    // Informations générales
    const addSection = (title: string, fields: Array<[string, string | null]>) => {
      page.drawText(title, {
        x: MARGIN,
        y: currentY,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      currentY -= 25;

      fields.forEach(([label, value]) => {
        page.drawText(`${label}:`, {
          x: MARGIN + 10,
          y: currentY,
          size: 12,
          font: boldFont
        });
        page.drawText(value || '-', {
          x: MARGIN + 120,
          y: currentY,
          size: 12,
          font
        });
        currentY -= 18;
      });
      currentY -= 10;
    };

    addSection('IDENTIFICATION', [
      ['Référence', missionData.reference],
      ['Titre', missionData.title],
      ['Statut', getStatusLabel(missionData.status)],
      ['Date création', formatDate(missionData.created_at)],
      ['Date prévue', formatDate(missionData.pickup_date)]
    ]);

    addSection('ITINÉRAIRE', [
      ['Adresse départ', missionData.pickup_address],
      ['Contact départ', missionData.pickup_contact_name],
      ['Adresse arrivée', missionData.delivery_address],
      ['Contact arrivée', missionData.delivery_contact_name]
    ]);

    addSection('VÉHICULE', [
      ['Plaque', missionData.license_plate],
      ['Modèle', missionData.vehicle_model]
    ]);

    // Départ (extra champs inspection)
    try {
      const { data: dep } = await supabase
        .from('inspection_departures')
        .select('initial_mileage, initial_fuel, fuel_percent, keys_count, has_fuel_card, has_board_documents, has_delivery_report, client_email, internal_notes')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dep) {
        addSection('DÉPART', [
          ['Kilométrage', dep.initial_mileage != null ? String(dep.initial_mileage) : null],
          ['Carburant', dep.initial_fuel ?? null],
          ['% Carburant', dep.fuel_percent != null ? `${dep.fuel_percent}%` : null],
          ['Clés', dep.keys_count != null ? (dep.keys_count === 2 ? '2+' : String(dep.keys_count)) : null],
          ['Carte carburant', dep.has_fuel_card ? 'Oui' : 'Non'],
          ['Docs de bord', dep.has_board_documents ? 'Oui' : 'Non'],
          ['PV de livraison', dep.has_delivery_report ? 'Oui' : 'Non'],
          ['Email client', dep.client_email ?? null],
          ['Notes internes', dep.internal_notes ?? null],
        ]);
      }
    } catch {}

    addSection('COMMERCIAL', [
      ['Prix', missionData.donor_earning ? `${missionData.donor_earning}€` : null]
    ]);

    // Description (section spéciale plus large)
    if (missionData.description) {
      page.drawText('DESCRIPTION', {
        x: MARGIN,
        y: currentY,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      currentY -= 25;

      // Découper la description en lignes
      const maxWidth = A4_WIDTH - 2 * MARGIN - 20;
      const words = missionData.description.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, 12);
        
        if (textWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            page.drawText(currentLine, {
              x: MARGIN + 10,
              y: currentY,
              size: 12,
              font
            });
            currentY -= 18;
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        page.drawText(currentLine, {
          x: MARGIN + 10,
          y: currentY,
          size: 12,
          font
        });
        currentY -= 18;
      }
    }

    // Pied de page
    page.drawText(`Généré le ${formatDate(new Date().toISOString())} | FleetCheck`, {
      x: MARGIN,
      y: MARGIN,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Métadonnées PDF
    pdfDoc.setTitle(`Résumé mission ${missionData.reference || missionData.id}`);
    pdfDoc.setAuthor('FleetCheck');
    pdfDoc.setSubject('Résumé de mission');
    pdfDoc.setCreationDate(new Date());

    // Générer le PDF
    const pdfBytes = await pdfDoc.save();

    // Retourner selon l'action
    if (action === 'preview') {
      // Pour prévisualisation: retourner l'URL de téléchargement temporaire
      return new Response(JSON.stringify({
        success: true,
        previewUrl: `data:application/pdf;base64,${btoa(String.fromCharCode(...pdfBytes))}`,
        filename: `mission-${missionData.reference || missionData.id}-resume.pdf`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Pour téléchargement: retourner le PDF directement
      return new Response(pdfBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="mission-${missionData.reference || missionData.id}-resume.pdf"`
        }
      });
    }

  } catch (error) {
    console.error('Error generating mission summary PDF:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});