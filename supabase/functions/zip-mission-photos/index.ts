import { serve } from "std/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';
// deno-lint-ignore no-explicit-any
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    // Support both GET with query param and POST with JSON body
    let missionId: string | undefined;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      missionId = url.searchParams.get('missionId') ?? undefined;
    } else if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      missionId = body?.missionId;
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

    // Vérifier l'existence de la mission
    const { data: mission, error: missionErr } = await supabase
      .from('missions')
      .select('id, reference, title, pickup_address, delivery_address')
      .eq('id', missionId)
      .single();
    if (missionErr || !mission) {
      return new Response(JSON.stringify({ error: 'Mission not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

  // Lister les chemins connus (par sections)
    const basePath = `missions/${missionId}`;
    const subfolders = ['departure', 'arrival', 'receipts', 'documents', 'signatures'];

  const files: { path: string; name: string; folder: string }[] = [];
    for (const folder of subfolders) {
      const { data: list, error: listErr } = await supabase.storage
        .from('mission-photos')
        .list(`${basePath}/${folder}`, { limit: 1000 });
      if (listErr) continue;
      for (const it of list || []) {
    if (it.name) files.push({ path: `${basePath}/${folder}/${it.name}`, name: `${folder}/${it.name}`, folder });
      }
    }

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'No photos found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

  // Générer un PDF: page de garde + sommaire + sections
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Métadonnées PDF
  const now = new Date();
  pdfDoc.setTitle(`Rapport mission ${mission.reference || mission.id}`);
  pdfDoc.setAuthor('FleetChecks');
  pdfDoc.setSubject('Rapport de mission avec photos');
  pdfDoc.setKeywords(['FleetChecks', 'Rapport', 'Mission', String(mission.reference || mission.id)]);
  pdfDoc.setProducer('FleetChecks Exporter');
  pdfDoc.setCreator('FleetChecks PDF Generator');
  pdfDoc.setCreationDate(now);
  pdfDoc.setModificationDate(now);

    // Constantes A4
    const A4_WIDTH = 595.28;  // 72 dpi * 8.27"
    const A4_HEIGHT = 841.89; // 72 dpi * 11.69"
    const MARGIN = 36; // 0.5"
    const titleHeight = 18;

    // Page de garde
    const COVER_W = A4_WIDTH, COVER_H = A4_HEIGHT, COVER_MARGIN = MARGIN;
    const cover = pdfDoc.addPage([COVER_W, COVER_H]);
    cover.drawText('Rapport de mission', { x: COVER_MARGIN, y: COVER_H - 2 * COVER_MARGIN, size: 24, font, color: rgb(0.1, 0.1, 0.1) });
    cover.drawText(`Titre: ${mission.title || '-'}`, { x: COVER_MARGIN, y: COVER_H - 2 * COVER_MARGIN - 32, size: 14, font });
    cover.drawText(`Référence: ${mission.reference || mission.id}`, { x: COVER_MARGIN, y: COVER_H - 2 * COVER_MARGIN - 52, size: 14, font });
    if ((mission as any).pickup_address || (mission as any).delivery_address) {
      cover.drawText(`De: ${(mission as any).pickup_address || '-'}`, { x: COVER_MARGIN, y: COVER_H - 2 * COVER_MARGIN - 80, size: 12, font, color: rgb(0.25,0.25,0.25) });
      cover.drawText(`À: ${(mission as any).delivery_address || '-'}`, { x: COVER_MARGIN, y: COVER_H - 2 * COVER_MARGIN - 98, size: 12, font, color: rgb(0.25,0.25,0.25) });
    }

    // Logo optionnel (PDF_LOGO_URL ou COMPANY_LOGO_URL)
    try {
      const logoUrl = Deno.env.get('PDF_LOGO_URL')
        || Deno.env.get('COMPANY_LOGO_URL')
  || 'https://i.ibb.co/xqf1LCDC/Chat-GPT-Image-6-sept-2025-01-04-56.png';
      if (logoUrl) {
        const lr = await fetch(logoUrl);
        if (lr.ok) {
          const lType = lr.headers.get('content-type') || '';
          const lBytes = new Uint8Array(await lr.arrayBuffer());
          let logoImg: any = null;
          try {
            if (lType.includes('png')) logoImg = await pdfDoc.embedPng(lBytes);
            else if (lType.includes('jpeg') || lType.includes('jpg')) logoImg = await pdfDoc.embedJpg(lBytes);
            else { try { logoImg = await pdfDoc.embedPng(lBytes); } catch { logoImg = await pdfDoc.embedJpg(lBytes); } }
          } catch {}
          if (logoImg) {
            const maxLogoW = 140;
            const scaled = logoImg.scale(1);
            const scale = Math.min(maxLogoW / scaled.width, 100 / scaled.height);
            const w = scaled.width * scale;
            const h = scaled.height * scale;
            const x = COVER_W - COVER_MARGIN - w;
            const y = COVER_H - COVER_MARGIN - h;
            cover.drawImage(logoImg, { x, y, width: w, height: h });
          }
        }
      }
    } catch (_) { /* logo optionnel, ignorer erreurs */ }

    // Sommaire
    const toc = pdfDoc.addPage([COVER_W, COVER_H]);
    toc.drawText('Sommaire', { x: COVER_MARGIN, y: COVER_H - 2 * COVER_MARGIN, size: 18, font, color: rgb(0.1,0.1,0.1) });
  const labelMap: Record<string, string> = { departure: 'Départ', arrival: 'Arrivée', receipts: 'Justificatifs', documents: 'Documents', signatures: 'Signatures' };
  const grouped: Record<string, { path: string; name: string; folder: string }[]> = { departure: [], arrival: [], receipts: [], documents: [], signatures: [] };
    for (const f of files) grouped[f.folder]?.push(f);
    let yToc = COVER_H - 2 * COVER_MARGIN - 28;
    for (const key of subfolders) {
      const label = labelMap[key];
      const count = grouped[key]?.length || 0;
      toc.drawText(`• ${label}: ${count} photo${count > 1 ? 's' : ''}`, { x: COVER_MARGIN, y: yToc, size: 12, font, color: rgb(0.2,0.2,0.2) });
      yToc -= 16;
    }

    // Pagination simple sur pages de contenu (sections et images)
    let pageNo = 1;
    const drawFooter = (page: any) => {
      page.drawText(`${pageNo}`, { x: A4_WIDTH - MARGIN - 24, y: MARGIN / 2, size: 10, font, color: rgb(0.5,0.5,0.5) });
      pageNo += 1;
    };

    // Parcourir les sections
    for (const key of subfolders) {
      const filesInSection = grouped[key] || [];
      if (!filesInSection.length) continue;
      const sectionTitle = labelMap[key];

      const sectionPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      sectionPage.drawText(sectionTitle, { x: MARGIN, y: A4_HEIGHT - MARGIN - 4, size: 18, font, color: rgb(0.1,0.1,0.5) });
      sectionPage.drawText(`${filesInSection.length} photo${filesInSection.length>1?'s':''}`, { x: MARGIN, y: A4_HEIGHT - MARGIN - 24, size: 12, font, color: rgb(0.3,0.3,0.3) });
      drawFooter(sectionPage);

      for (const f of filesInSection) {
        // Bucket public: essayer URL publique d'abord
        const { data: pub } = supabase.storage.from('mission-photos').getPublicUrl(f.path);
        let fetchUrl = pub?.publicUrl;
        if (!fetchUrl) {
          const { data: signed } = await supabase.storage.from('mission-photos').createSignedUrl(f.path, 60);
          fetchUrl = signed?.signedUrl;
        }
        if (!fetchUrl) continue;
        const res = await fetch(fetchUrl);
        if (!res.ok) continue;
        const contentType = res.headers.get('content-type') || '';
        const bytes = new Uint8Array(await res.arrayBuffer());

        let img: any = null;
        try {
          if (contentType.includes('png')) img = await pdfDoc.embedPng(bytes);
          else if (contentType.includes('jpeg') || contentType.includes('jpg')) img = await pdfDoc.embedJpg(bytes);
          else { try { img = await pdfDoc.embedJpg(bytes); } catch (_) { img = await pdfDoc.embedPng(bytes); } }
        } catch (_) { continue; }

        const imgDims = img.scale(1);
        const maxW = A4_WIDTH - 2 * MARGIN;
        const maxH = A4_HEIGHT - 3 * MARGIN - titleHeight;
        const scale = Math.min(maxW / imgDims.width, maxH / imgDims.height);
        const drawW = imgDims.width * scale;
        const drawH = imgDims.height * scale;
        const x = (A4_WIDTH - drawW) / 2;
        const y = (A4_HEIGHT - drawH) / 2 - titleHeight / 2;

        const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        page.drawText(`${sectionTitle} – ${f.name.split('/').slice(-1)[0]}`, {
          x: MARGIN,
          y: A4_HEIGHT - MARGIN - titleHeight,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
          maxWidth: A4_WIDTH - 2 * MARGIN,
        });
        page.drawImage(img, { x, y, width: drawW, height: drawH });
        drawFooter(page);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `mission-${mission.reference || mission.id}-photos.pdf`;
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
