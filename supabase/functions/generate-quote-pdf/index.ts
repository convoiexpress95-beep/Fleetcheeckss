// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Deno import for edge function
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno import for edge function
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchLogoBytes(url?: string | null): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return new Uint8Array(ab);
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 });
    }
    const { quote, company, client, themeColor, logoUrl } = await req.json();
    const colorHex = typeof themeColor === 'string' && /^#?[0-9a-f]{6}$/i.test(themeColor) ? (themeColor.startsWith('#') ? themeColor : `#${themeColor}`) : '#10b981';
    const r = parseInt(colorHex.slice(1,3), 16) / 255;
    const g = parseInt(colorHex.slice(3,5), 16) / 255;
    const b = parseInt(colorHex.slice(5,7), 16) / 255;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(r, g, b) });

    const logoBytes = await fetchLogoBytes(logoUrl || company?.logo_url || null);
    if (logoBytes) {
      let img: any = null; try { img = await pdf.embedPng(logoBytes); } catch {} if (!img) { try { img = await pdf.embedJpg(logoBytes); } catch {} }
      if (img) { const ratio = img.width / img.height; const targetH = 48; const targetW = targetH * ratio; page.drawImage(img, { x: 24, y: height - 24 - targetH, width: targetW, height: targetH }); }
    }

    page.drawText('DEVIS', { x: 24, y: height - 110, size: 24, font: fontBold, color: rgb(0.1,0.1,0.1) });
    const no = String(quote?.quote_number || '—');
    page.drawText(`# ${no}`, { x: 24, y: height - 135, size: 12, font, color: rgb(0.3,0.3,0.3) });

    const compLines = [company?.company_name, company?.address, `${company?.postal_code || ''} ${company?.city || ''}`.trim(), company?.country, company?.email, company?.phone, company?.website, company?.siret ? `SIRET: ${company.siret}` : undefined, company?.vat_number ? `TVA: ${company.vat_number}` : undefined].filter(Boolean) as string[];
    let yy = height - 170; compLines.forEach((line: string) => { page.drawText(line, { x: 24, y: yy, size: 10, font, color: rgb(0.2,0.2,0.2) }); yy -= 14; });

    const clientX = width/2; const cliLines = [client?.name || quote?.client_name, client?.email || quote?.client_email].filter(Boolean) as string[];
    yy = height - 170; page.drawText('Client', { x: clientX, y: yy + 16, size: 12, font: fontBold, color: rgb(0.2,0.2,0.2) });
    cliLines.forEach((line: string, idx: number) => { page.drawText(line, { x: clientX, y: yy - idx*14, size: 10, font, color: rgb(0.2,0.2,0.2) }); });

    const tableTop = height - 260;
    page.drawRectangle({ x: 24, y: tableTop, width: width - 48, height: 28, color: rgb(r, g, b) });
    page.drawText('Description', { x: 32, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });
    page.drawText('Montant HT', { x: width - 200, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });
    page.drawText('TVA', { x: width - 120, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });
    page.drawText('Total TTC', { x: width - 60 - 40, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1,1,1) });

    const desc = String(quote?.description || 'Prestations');
    const amount = Number(quote?.amount || 0);
    const tax = Number(quote?.tax_amount || 0);
    const total = Number(quote?.total_amount || amount + tax);
    const rowY = tableTop - 24;
    page.drawText(desc, { x: 32, y: rowY, size: 10, font, color: rgb(0.2,0.2,0.2) });
    page.drawText(`${amount.toFixed(2)}€`, { x: width - 200, y: rowY, size: 10, font, color: rgb(0.2,0.2,0.2) });
    page.drawText(`${tax.toFixed(2)}€`, { x: width - 120, y: rowY, size: 10, font, color: rgb(0.2,0.2,0.2) });
    page.drawText(`${total.toFixed(2)}€`, { x: width - 60 - 40, y: rowY, size: 10, font, color: rgb(0.2,0.2,0.2) });

    const valUntil = quote?.valid_until ? new Date(quote.valid_until).toLocaleDateString('fr-FR') : '—';
    page.drawText(`Valide jusqu'au: ${valUntil}`, { x: 24, y: 60, size: 10, font, color: rgb(0.3,0.3,0.3) });

    const bytes = await pdf.save();
    const pdfBase64 = btoa(String.fromCharCode(...bytes));
    const filename = `devis_${no}.pdf`;
    return new Response(JSON.stringify({ pdfBase64, filename }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', details: e instanceof Error ? e.message : String(e) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
