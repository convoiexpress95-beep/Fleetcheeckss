import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { TCompanyInfo, TInvoice, TInvoiceItem } from '../hooks/useBilling';
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Props {
  visible: boolean;
  onClose: () => void;
  invoice: TInvoice | null;
  companyInfo: TCompanyInfo | null;
}

const currency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

const buildHtml = (invoice: TInvoice, company: TCompanyInfo) => {
  const items = (invoice.items || []) as TInvoiceItem[];
  const date = new Date(invoice.invoice_date).toLocaleDateString('fr-FR');
  const due = new Date(invoice.due_date).toLocaleDateString('fr-FR');

  return `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Facture ${invoice.invoice_number || ''}</title>
    <style>
      :root {
        --bg: #0b1020;
        --panel: #0f172a;
        --panel-2: #111827;
        --text: #f8fafc;
        --muted: #9ca3af;
        --border: #1f2937;
        --brand: #7c3aed; /* violet premium */
        --accent: #f59e0b; /* or gold */
      }
      body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: var(--text); margin: 0; padding: 24px; background: linear-gradient(180deg, #0b1020, #0e1326); }
      .sheet { background: #0e152a; border: 1px solid #1f2a44; border-radius: 16px; padding: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.4); overflow: hidden; }
      .header { background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(245,158,11,0.2)); border-bottom: 1px solid #1f2a44; padding: 18px 20px; display:flex; align-items:center; justify-content:space-between; }
      .brand { display:flex; align-items:center; gap:12px; }
      .brand .logo { height:48px; width:auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }
      .brand .title { display:flex; flex-direction:column; }
      .title h1 { font-size: 22px; margin:0; letter-spacing: 0.3px; }
      .title .muted { color: var(--muted); font-size: 12px; }
      .idbox { text-align:right; }
      .idbox .badge { display:inline-block; background: rgba(245,158,11,0.12); color:#fde68a; padding:6px 10px; border: 1px solid rgba(245,158,11,0.35); border-radius:999px; font-weight:700; font-size:12px; }
      .section { padding: 16px 20px; }
      .card { background: #0b172e; border: 1px solid #1f2a44; border-radius: 12px; padding: 14px; }
      .row { display: flex; justify-content: space-between; gap: 16px; }
      .muted { color: var(--muted); }
      h2 { font-size: 16px; margin: 0 0 8px 0; }
      .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; overflow: hidden; border-radius: 12px; border:1px solid #1f2a44; }
      th, td { padding: 10px 12px; border-bottom: 1px solid #1f2a44; text-align: left; }
      thead th { background: linear-gradient(180deg, #131e38, #101a31); color:#c7d2fe; font-weight:700; border-bottom: 1px solid #263659; }
      tbody tr:nth-child(even) td { background: #0a152a; }
      .right { text-align: right; }
      .totals { margin-top: 12px; display:grid; gap: 6px; }
      .totals .row { align-items:center; }
      .total-line { font-weight:800; color:#e5e7eb; }
      .accent-line { border-top:2px dashed rgba(124,58,237,0.35); padding-top:8px; }
      .footer { margin: 16px 20px; font-size: 12px; color: var(--muted); border-top: 1px dashed #1f2a44; padding-top: 12px; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div class="brand">
          ${company.logo_url ? `<img class="logo" src="${company.logo_url}" alt="logo" />` : ''}
          <div class="title">
            <h1>${company.company_name}</h1>
            <div class="muted">${company.address} • ${company.postal_code} ${company.city} • ${company.country}</div>
          </div>
        </div>
        <div class="idbox">
          <div class="badge">Facture ${invoice.invoice_number || ''}</div>
          <div class="muted" style="margin-top:6px;">Émise le ${date} • Échéance ${due}</div>
        </div>
      </div>

      <div class="section">
        <div class="grid-2">
          <div class="card">
            <h2>Client</h2>
            <div>${invoice.client?.is_company ? invoice.client?.company_name : `${invoice.client?.first_name ?? ''} ${invoice.client?.last_name ?? ''}`}</div>
            <div class="muted">${invoice.client?.address || ''}</div>
            <div class="muted">${invoice.client?.postal_code || ''} ${invoice.client?.city || ''}</div>
            ${invoice.client?.siret ? `<div class=\"muted\">SIRET: ${invoice.client?.siret}</div>` : ''}
          </div>
          <div class="card">
            <h2>Entreprise</h2>
            <div>${company.company_name}</div>
            <div class="muted">${company.address}</div>
            <div class="muted">${company.postal_code} ${company.city}, ${company.country}</div>
            ${company.siret ? `<div class=\"muted\">SIRET: ${company.siret}</div>` : ''}
            ${company.vat_number ? `<div class=\"muted\">N° TVA: ${company.vat_number}</div>` : ''}
          </div>
        </div>

        <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qté</th>
            <th>PU HT</th>
            <th>TVA %</th>
            <th class="right">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(it => `<tr>
            <td>${(it.description || '').replace(/</g, '&lt;')}</td>
            <td>${it.quantity}</td>
            <td>${currency(it.unit_price)}</td>
            <td>${it.vat_rate}</td>
            <td class="right">${currency(it.total_ht)}</td>
          </tr>`).join('')}
        </tbody>
        </table>

        <div class="totals accent-line">
          <div class="row"><div>Sous-total HT</div><div>${currency(invoice.subtotal_ht)}</div></div>
          <div class="row"><div>TVA (${invoice.vat_rate}%)</div><div>${currency(invoice.vat_amount)}</div></div>
          <div class="row total-line"><div>Total TTC</div><div>${currency(invoice.total_ttc)}</div></div>
        </div>
      </div>

      <div class="footer">
        ${invoice.payment_terms ? `Conditions de paiement: ${invoice.payment_terms}<br/>` : ''}
        ${invoice.payment_method ? `Mode de règlement: ${invoice.payment_method}<br/>` : ''}
        ${invoice.notes ? `Notes: ${invoice.notes}<br/>` : ''}
        ${invoice.legal_mentions || ''}
      </div>
    </div>
  </body>
  </html>`;
};

const InvoicePreviewModal: React.FC<Props> = ({ visible, onClose, invoice, companyInfo }) => {
  const html = useMemo(() => {
    if (!invoice || !companyInfo) return '<html><body style="font-family:Arial;padding:16px;">Données indisponibles.</body></html>';
    return buildHtml(invoice, companyInfo);
  }, [invoice, companyInfo]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} accessibilityLabel="Fermer l'aperçu" style={[styles.iconBtn]}> 
          <Text style={styles.iconText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Aperçu facture</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              const file = await printToFileAsync({ html, base64: false });
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, { dialogTitle: 'Partager la facture (PDF)' });
              } else {
                Alert.alert('Export PDF', `Fichier créé: ${file.uri}`);
              }
            } catch (e: any) {
              Alert.alert('Erreur export', e?.message || 'Impossible de générer le PDF');
            }
          }}
          style={[styles.btn, { backgroundColor: '#0ea5e9' }]}
        >
          <Text style={styles.btnText}>Exporter PDF</Text>
        </TouchableOpacity>
      </View>
      <WebView originWhitelist={["*"]} source={{ html }} style={{ flex: 1, backgroundColor: '#f8fafc' }} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingHorizontal: 12, paddingBottom: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' },
  iconText: { fontSize: 22, lineHeight: 22, color: '#111827', marginTop: -1 },
});

export default InvoicePreviewModal;
