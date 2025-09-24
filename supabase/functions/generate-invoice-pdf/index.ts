// deno-lint-ignore-file no-explicit-any
// Edge Function: generate-invoice-pdf
// POST body: { invoice: { ..., items?: [{ description, quantity, unit_price, tax_rate }], iban?, legal_mentions? }, company: { ..., iban?, legal_mentions? }, client?: { ... }, themeColor?: string, logoUrl?: string }
// Returns: { pdfBase64: string, filename: string }
// @ts-ignore - Deno import for edge function
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno import for edge function
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchLogoBytes(url?: string | null): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return new Uint8Array(ab);
  } catch {
    return null;
  }
}

type Item = {
  description: string;
  quantity?: number;
  unit_price?: number;
  tax_rate?: number; // percent
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 },
      );
    }

    const { invoice, company, client, themeColor, logoUrl } = await req.json();

    const colorHex = typeof themeColor === "string" && /^#?[0-9a-f]{6}$/i.test(themeColor)
      ? (themeColor.startsWith("#") ? themeColor : `#${themeColor}`)
      : "#2563eb";
    const r = parseInt(colorHex.slice(1, 3), 16) / 255;
    const g = parseInt(colorHex.slice(3, 5), 16) / 255;
    const b = parseInt(colorHex.slice(5, 7), 16) / 255;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4 portrait
    const { width, height } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Header bar
    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(r, g, b) });

    // Logo
    const logoBytes = await fetchLogoBytes(logoUrl || company?.logo_url || null);
    if (logoBytes) {
      let img: any = null;
      try { img = await pdf.embedPng(logoBytes); } catch {}
      if (!img) { try { img = await pdf.embedJpg(logoBytes); } catch {} }
      if (img) {
        const ratio = img.width / img.height;
        const targetH = 48;
        const targetW = targetH * ratio;
        page.drawImage(img, { x: 24, y: height - 24 - targetH, width: targetW, height: targetH });
      }
    }

    // Title and invoice number
    page.drawText("FACTURE", { x: 24, y: height - 110, size: 24, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    const invNo = String(invoice?.invoice_number || "—");
    page.drawText(`# ${invNo}`, { x: 24, y: height - 135, size: 12, font, color: rgb(0.3, 0.3, 0.3) });

    // Company block
    const compLines = [
      company?.company_name,
      company?.address,
      `${company?.postal_code || ""} ${company?.city || ""}`.trim(),
      company?.country,
      company?.email,
      company?.phone,
      company?.website,
      company?.siret ? `SIRET: ${company.siret}` : undefined,
      company?.vat_number ? `TVA: ${company.vat_number}` : undefined,
    ].filter(Boolean) as string[];
    let yy = height - 170;
    compLines.forEach((line: string) => {
      page.drawText(line, { x: 24, y: yy, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      yy -= 14;
    });

    // Client block
    const clientX = width / 2;
    const cliLines = [
      client?.name || invoice?.client_name,
      client?.email || invoice?.client_email,
      client?.address,
      client?.postal_code && client?.city ? `${client.postal_code} ${client.city}` : undefined,
    ].filter(Boolean) as string[];
    yy = height - 170;
    page.drawText("Client", { x: clientX, y: yy + 16, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    cliLines.forEach((line: string, idx: number) => {
      page.drawText(line, { x: clientX, y: yy - idx * 14, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    });

    // Table header
    const tableTop = height - 260;
    const tableWidth = width - 48;
    const colX = { desc: 32, qty: width - 260, unit: width - 200, tax: width - 120, total: width - 100 };
    page.drawRectangle({ x: 24, y: tableTop, width: tableWidth, height: 28, color: rgb(r, g, b) });
    page.drawText("Description", { x: colX.desc, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Qté", { x: colX.qty, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("PU HT", { x: colX.unit, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("TVA", { x: colX.tax, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Total TTC", { x: colX.total, y: tableTop + 9, size: 10, font: fontBold, color: rgb(1, 1, 1) });

    // Items
    const items: Item[] = Array.isArray(invoice?.items) ? invoice.items : [];
    let amount = Number(invoice?.amount || 0);
    let tax = Number(invoice?.tax_amount || 0);
    let total = Number(invoice?.total_amount || amount + tax);
    let rowY = tableTop - 24;

    if (items.length > 0) {
      let sumHT = 0, sumTVA = 0, sumTTC = 0;
      for (const it of items) {
        if (rowY < 120) break; // simple page bottom guard
        const q = Number(it.quantity ?? 1);
        const pu = Number(it.unit_price ?? 0);
        const tRate = Number(it.tax_rate ?? 20);
        const lineHT = q * pu;
        const lineTVA = lineHT * (tRate / 100);
        const lineTTC = lineHT + lineTVA;
        sumHT += lineHT; sumTVA += lineTVA; sumTTC += lineTTC;

        page.drawText(String(it.description || "—"), { x: colX.desc, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${q}`, { x: colX.qty, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${pu.toFixed(2)}€`, { x: colX.unit, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${tRate}%`, { x: colX.tax, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${lineTTC.toFixed(2)}€`, { x: colX.total, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

        rowY -= 18;
      }
      amount = sumHT; tax = sumTVA; total = sumTTC;
    } else {
      const singleDesc = String(invoice?.mission_title || invoice?.description || "Prestations");
      page.drawText(singleDesc, { x: colX.desc, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page.drawText("1", { x: colX.qty, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      const pu = amount.toFixed(2);
      page.drawText(`${pu}€`, { x: colX.unit, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      const ratePct = amount > 0 ? Math.round((tax / amount) * 100) : 20;
      page.drawText(`${ratePct}%`, { x: colX.tax, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`${total.toFixed(2)}€`, { x: colX.total, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    }

    // Totals
    const totalsY = rowY - 30;
    page.drawText("Récapitulatif", { x: width - 220, y: totalsY + 56, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`HT: ${amount.toFixed(2)}€`, { x: width - 220, y: totalsY + 38, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`TVA: ${tax.toFixed(2)}€`, { x: width - 220, y: totalsY + 22, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Total: ${total.toFixed(2)}€`, { x: width - 220, y: totalsY + 6, size: 12, font: fontBold, color: rgb(r, g, b) });

    // Footer: terms, IBAN, legal mentions
    const due = invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString("fr-FR") : "—";
    let footY = 76;
    page.drawText(`Échéance: ${due}`, { x: 24, y: footY, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    footY -= 16;
    if (invoice?.payment_terms) {
      page.drawText(String(invoice.payment_terms), { x: 24, y: footY, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      footY -= 16;
    }
    const iban = company?.iban || company?.rib_iban || invoice?.iban;
    const legal = company?.legal_mentions || company?.mentions_legales || invoice?.legal_mentions;
    if (iban) {
      page.drawText(`IBAN: ${String(iban)}`, { x: 24, y: footY, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      footY -= 16;
    }
    if (legal) {
      const text = String(legal).slice(0, 220); // simple overflow guard
      page.drawText(text, { x: 24, y: footY, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
    }

    const bytes = await pdf.save();
    const pdfBase64 = btoa(String.fromCharCode(...bytes));
    const filename = `facture_${invNo}.pdf`;
    return new Response(
      JSON.stringify({ pdfBase64, filename }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
