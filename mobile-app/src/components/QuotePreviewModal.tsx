import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { TCompanyInfo, TQuote, TQuoteItem } from '../hooks/useBilling';
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Props {
  visible: boolean;
  onClose: () => void;
  quote: TQuote | null;
  companyInfo: TCompanyInfo | null;
}

const currency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

const buildHtml = (quote: TQuote, company: TCompanyInfo) => {
  const items = (quote.items || []) as TQuoteItem[];
  const qDate = new Date(quote.quote_date).toLocaleDateString('fr-FR');
  const vDate = new Date(quote.validity_date).toLocaleDateString('fr-FR');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Devis ${quote.quote_number || ''}</title>
  <style>body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;margin:0;padding:24px;background:#f8fafc} .sheet{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)} .header{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,rgba(14,165,233,.08),rgba(99,102,241,.08))} .title h1{margin:0;font-size:20px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left} thead th{background:#f1f5f9} .right{text-align:right} .muted{color:#64748b} .footer{padding:16px 20px;border-top:1px dashed #e5e7eb;color:#64748b;font-size:12px}</style></head>
  <body><div class="sheet">
  <div class="header"><div class="title"><h1>${company.company_name}</h1><div class="muted">${company.address} • ${company.postal_code} ${company.city} • ${company.country}</div></div><div style="text-align:right"><div style="font-weight:800;color:#0ea5e9">DEVIS ${quote.quote_number || ''}</div><div class="muted">Émis le ${qDate} • Valide jusqu'au ${vDate}</div></div></div>
  <div style="padding:16px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div><div style="font-weight:700;margin-bottom:6px">Client</div>
        <div>${quote.client?.is_company ? quote.client?.company_name : `${quote.client?.first_name ?? ''} ${quote.client?.last_name ?? ''}`}</div>
        <div class="muted">${quote.client?.address || ''}</div>
        <div class="muted">${quote.client?.postal_code || ''} ${quote.client?.city || ''}</div>
      </div>
      <div><div style="font-weight:700;margin-bottom:6px">Entreprise</div>
        <div>${company.company_name}</div>
        <div class="muted">${company.address}</div>
        <div class="muted">${company.postal_code} ${company.city}, ${company.country}</div>
      </div>
    </div>
    <table><thead><tr><th>Description</th><th>Qté</th><th>PU HT</th><th>TVA %</th><th class="right">Total HT</th></tr></thead><tbody>
      ${items.map(it => `<tr><td>${(it.description||'').replace(/</g,'&lt;')}</td><td>${it.quantity}</td><td>${currency(it.unit_price)}</td><td>${it.vat_rate}</td><td class="right">${currency(it.total_ht)}</td></tr>`).join('')}
    </tbody></table>
    <div style="display:grid;gap:6px;margin-top:12px;max-width:320px;margin-left:auto">
      <div style="display:flex;justify-content:space-between"><div class="muted">Sous-total HT</div><div>${currency(quote.subtotal_ht)}</div></div>
      <div style="display:flex;justify-content:space-between"><div class="muted">TVA (${quote.vat_rate}%)</div><div>${currency(quote.vat_amount)}</div></div>
      <div style="display:flex;justify-content:space-between;font-weight:800;border-top:1px solid #e5e7eb;padding-top:6px"><div>Total TTC</div><div>${currency(quote.total_ttc)}</div></div>
    </div>
  </div>
  <div class="footer">${quote.payment_terms ? `Conditions de paiement: ${quote.payment_terms}<br/>` : ''}${quote.payment_method ? `Mode de règlement: ${quote.payment_method}<br/>` : ''}${quote.notes ? `Notes: ${quote.notes}<br/>` : ''}Devis valable jusqu'à la date indiquée. Prestations exécutées après acceptation du devis.</div>
  </div></body></html>`;
};

const QuotePreviewModal: React.FC<Props> = ({ visible, onClose, quote, companyInfo }) => {
  const html = useMemo(() => {
    if (!quote || !companyInfo) return '<html><body style="font-family:Arial;padding:16px;">Données indisponibles.</body></html>';
    return buildHtml(quote, companyInfo);
  }, [quote, companyInfo]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} accessibilityLabel="Fermer l'aperçu" style={styles.iconBtn}>
          <Text style={styles.iconText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Aperçu devis</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              const file = await printToFileAsync({ html, base64: false });
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, { dialogTitle: 'Partager le devis (PDF)' });
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

export default QuotePreviewModal;
