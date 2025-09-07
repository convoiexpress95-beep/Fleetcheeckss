import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, FlatList, Image } from 'react-native';
import { useBilling, TCompanyInfo, TInvoice, TClient, TQuote } from '../hooks/useBilling';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import CreateQuoteModal from '../components/CreateQuoteModal';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import QuotePreviewModal from '../components/QuotePreviewModal';

const BillingScreen: React.FC = () => {
  const {
    loading,
    companyInfo,
    clients,
    invoices,
  quotes,
    saveCompanyInfo,
    validateSiret,
    updateInvoiceStatus,
    updateQuoteStatus,
    convertQuoteToInvoice,
  } = useBilling();

  const [companyOpen, setCompanyOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createQuoteOpen, setCreateQuoteOpen] = useState(false);
  const [tab, setTab] = useState<'invoices' | 'quotes' | 'clients' | 'settings'>('invoices');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<TInvoice | null>(null);
  const [previewQuoteOpen, setPreviewQuoteOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<TQuote | null>(null);
  const [siret, setSiret] = useState('');
  const [companyData, setCompanyData] = useState<TCompanyInfo>({
    company_name: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'France',
  });
  const [logoUrlInput, setLogoUrlInput] = useState('');

  React.useEffect(() => {
    if (companyInfo) {
      setCompanyData(companyInfo);
      setLogoUrlInput(companyInfo.logo_url || '');
    }
  }, [companyInfo]);

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid');
    const totalRevenue = paid.reduce((s, i) => s + (i.total_ttc || 0), 0);
    return {
      totalRevenue,
      paidInvoices: paid.length,
      pendingInvoices: invoices.filter((i) => i.status === 'sent' || i.status === 'draft').length,
      totalInvoices: invoices.length,
    };
  }, [invoices]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const getStatusLabel = (s: TInvoice['status']) =>
    ({ draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'En retard', cancelled: 'Annulée' }[s] || 'Brouillon');

  const handleValidateSiret = async () => {
    if (!siret) return;
    const data = await validateSiret(siret);
    if (data) setCompanyData((prev) => ({ ...prev, ...data }));
  };

  const handleSaveCompany = async () => {
    const ok = await saveCompanyInfo({ ...companyData, logo_url: logoUrlInput || companyData.logo_url });
    if (ok) setCompanyOpen(false);
  };

  //

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Facturation légale</Text>

        {!companyInfo && (
          <View style={[styles.card, { borderColor: '#f59e0b' }]}> 
            <Text style={{ color: '#92400e', fontWeight: '700' }}>Configuration entreprise requise</Text>
            <Text style={{ color: '#b45309', marginTop: 4 }}>Renseignez vos informations légales avant de créer des factures conformes.</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#7c3aed' }]} onPress={() => setCompanyOpen(true)}>
          <Text style={styles.btnText}>{companyInfo ? 'Modifier entreprise' : 'Configurer entreprise'}</Text>
        </TouchableOpacity>

        {/* KPIs */}
        <View style={styles.grid}>
          <View style={styles.card}> 
            <Text style={styles.muted}>Chiffre d'affaires</Text>
            <Text style={styles.kpi}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.micro}>Factures payées</Text>
          </View>
          <View style={styles.card}> 
            <Text style={styles.muted}>Factures payées</Text>
            <Text style={styles.kpi}>{stats.paidInvoices}</Text>
            <Text style={styles.micro}>Encaissées</Text>
          </View>
          <View style={styles.card}> 
            <Text style={styles.muted}>En attente</Text>
            <Text style={styles.kpi}>{stats.pendingInvoices}</Text>
            <Text style={styles.micro}>Brouillons + envoyées</Text>
          </View>
        </View>

  {/* */}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('invoices')} style={[styles.tab, tab === 'invoices' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'invoices' && styles.tabTextActive]}>Factures ({invoices.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('quotes')} style={[styles.tab, tab === 'quotes' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'quotes' && styles.tabTextActive]}>Devis</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('clients')} style={[styles.tab, tab === 'clients' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'clients' && styles.tabTextActive]}>Clients ({clients.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('settings')} style={[styles.tab, tab === 'settings' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'settings' && styles.tabTextActive]}>Configuration</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content lists (only one FlatList at a time to avoid nested virtualized lists) */}
      {tab === 'invoices' && (
        <FlatList
          key="invoices"
          data={invoices}
          keyExtractor={(i) => i.id || Math.random().toString()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListHeaderComponent={(
            <View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#7c3aed', flex: 1 }]} onPress={() => setCreateOpen(true)}>
                  <Text style={styles.btnText}>Nouvelle facture légale</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.subtitle, { marginTop: 16 }]}>Mes factures</Text>
              {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.invoiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{item.invoice_number || 'Sans n°'}</Text>
                <Text style={styles.mutedSmall}>{item.client?.company_name || `${item.client?.first_name ?? ''} ${item.client?.last_name ?? ''}`}</Text>
                <Text style={styles.mutedSmall}>{item.invoice_date} • {formatCurrency(item.total_ttc)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.badge, statusBg(item.status)]}>{getStatusLabel(item.status)}</Text>
                <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#0ea5e9', marginTop: 6 }]} onPress={() => { setPreviewInvoice(item); setPreviewOpen(true); }}>
                  <Text style={styles.btnSmText}>Prévisualiser</Text>
                </TouchableOpacity>
                {item.status !== 'paid' && (
                  <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#10b981', marginTop: 6 }]} onPress={() => updateInvoiceStatus(item.id!, 'paid')}>
                    <Text style={styles.btnSmText}>Marquer payée</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={!loading ? (
            <View style={[styles.card, { marginTop: 8 }]}> 
              <Text style={styles.muted}>Aucune facture.</Text>
            </View>
          ) : null}
        />
      )}

      {tab === 'clients' && (
        <FlatList<TClient>
          key="clients"
          data={clients}
          keyExtractor={(i) => i.id || Math.random().toString()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListHeaderComponent={(
            <Text style={styles.subtitle}>Clients</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.clientRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#111827' }}>
                  {item.is_company ? item.company_name : `${item.first_name ?? ''} ${item.last_name ?? ''}`}
                </Text>
                <Text style={styles.mutedSmall}>{item.address}{item.postal_code ? `, ${item.postal_code}` : ''}{item.city ? ` ${item.city}` : ''}</Text>
                {!!item.siret && <Text style={styles.mutedSmall}>SIRET: {item.siret}</Text>}
              </View>
              <View>
                <Text style={[styles.badge, { backgroundColor: '#e5e7eb', color: '#111827' }]}>{item.is_company ? 'Entreprise' : 'Particulier'}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={(
            <View style={[styles.card, { marginTop: 8 }]}> 
              <Text style={styles.muted}>Aucun client.</Text>
            </View>
          )}
        />
      )}

      {tab === 'quotes' && (
        <FlatList<TQuote>
          key="quotes"
          data={quotes as any}
          keyExtractor={(q) => (q.id as string) || Math.random().toString()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListHeaderComponent={(
            <View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text style={[styles.subtitle, { flex: 1 }]}>Mes devis</Text>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#0ea5e9', paddingVertical: 10 }]} onPress={() => setCreateQuoteOpen(true)}>
                  <Text style={styles.btnText}>Créer un devis</Text>
                </TouchableOpacity>
              </View>
              {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.invoiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{item.quote_number || 'Sans n°'}</Text>
                <Text style={styles.mutedSmall}>{item.client?.company_name || `${item.client?.first_name ?? ''} ${item.client?.last_name ?? ''}`}</Text>
                <Text style={styles.mutedSmall}>{item.quote_date} • Valide jusqu'au {item.validity_date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.badge, { backgroundColor: '#0ea5e9' }]}>Total TTC: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.total_ttc || 0)}</Text>
                <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#0ea5e9', marginTop: 6 }]} onPress={() => { setPreviewQuote(item); setPreviewQuoteOpen(true); }}>
                  <Text style={styles.btnSmText}>Prévisualiser</Text>
                </TouchableOpacity>
                {item.status !== 'accepted' && (
                  <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#10b981', marginTop: 6 }]} onPress={() => updateQuoteStatus(item.id!, 'accepted')}>
                    <Text style={styles.btnSmText}>Accepter</Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'rejected' && item.status !== 'accepted' && (
                  <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#ef4444', marginTop: 6 }]} onPress={() => updateQuoteStatus(item.id!, 'rejected')}>
                    <Text style={styles.btnSmText}>Refuser</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'accepted' && (
                  <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#7c3aed', marginTop: 6 }]} onPress={() => convertQuoteToInvoice(item.id!)}>
                    <Text style={styles.btnSmText}>Convertir en facture</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={!loading ? (
            <View style={[styles.card, { marginTop: 8 }]}> 
              <Text style={styles.muted}>Aucun devis.</Text>
            </View>
          ) : null}
        />
      )}

      {tab === 'settings' && (
        <FlatList
          key="settings"
          data={[]}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListHeaderComponent={(
            <View style={{ gap: 8 }}>
              <Text style={styles.subtitle}>Configuration du système</Text>
              <View style={styles.card}><Text style={styles.value}>Validation API INSEE: activée</Text></View>
              <View style={styles.card}><Text style={styles.value}>Numérotation séquentielle: activée</Text></View>
              <View style={styles.card}><Text style={styles.value}>Conformité légale française</Text></View>
              <View style={styles.card}><Text style={styles.value}>Calculs automatiques TVA/HT/TTC</Text></View>
            </View>
          )}
          renderItem={null as any}
        />
      )}

      {/* Company modal */}
      <Modal visible={companyOpen} animationType="slide" onRequestClose={() => setCompanyOpen(false)}>
        <ScrollView style={[styles.container, { backgroundColor: 'white' }]} contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.title}>Entreprise</Text>
          <Text style={styles.muted}>Validation automatique via API INSEE</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput placeholder="Numéro SIRET (14 chiffres)" value={siret} onChangeText={setSiret} style={styles.input} keyboardType="numeric" />
            <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#06b6d4' }]} onPress={handleValidateSiret} disabled={loading}>
              <Text style={styles.btnSmText}>Valider INSEE</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Raison sociale *</Text>
          <TextInput style={styles.input} value={companyData.company_name} onChangeText={(t) => setCompanyData({ ...companyData, company_name: t })} placeholder="Nom de l'entreprise" />

          <Text style={styles.label}>SIRET</Text>
          <TextInput style={styles.input} value={companyData.siret || ''} onChangeText={(t) => setCompanyData({ ...companyData, siret: t })} placeholder="12345678901234" />

          <Text style={styles.label}>N° TVA Intracommunautaire</Text>
          <TextInput style={styles.input} value={companyData.vat_number || ''} onChangeText={(t) => setCompanyData({ ...companyData, vat_number: t })} placeholder="FR12345678901" />

          <Text style={styles.label}>Logo de l'entreprise (URL)</Text>
          {!!(logoUrlInput || companyData.logo_url) && (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Image source={{ uri: logoUrlInput || companyData.logo_url! }} style={{ width: 96, height: 96, borderRadius: 12 }} />
            </View>
          )}
          <TextInput style={styles.input} value={logoUrlInput} onChangeText={setLogoUrlInput} placeholder="https://.../logo.png" />

          <Text style={styles.label}>Adresse *</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={companyData.address} onChangeText={(t) => setCompanyData({ ...companyData, address: t })} placeholder="Numéro, rue, bâtiment..." multiline />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Code postal *</Text>
              <TextInput style={styles.input} value={companyData.postal_code} onChangeText={(t) => setCompanyData({ ...companyData, postal_code: t })} placeholder="75001" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ville *</Text>
              <TextInput style={styles.input} value={companyData.city} onChangeText={(t) => setCompanyData({ ...companyData, city: t })} placeholder="Paris" />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput style={styles.input} value={companyData.phone || ''} onChangeText={(t) => setCompanyData({ ...companyData, phone: t })} placeholder="01 23 45 67 89" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={companyData.email || ''} onChangeText={(t) => setCompanyData({ ...companyData, email: t })} placeholder="contact@entreprise.fr" />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Forme juridique</Text>
              <TextInput style={styles.input} value={companyData.legal_form || ''} onChangeText={(t) => setCompanyData({ ...companyData, legal_form: t })} placeholder="SAS, SARL, ..." />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Capital social (€)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={companyData.capital_amount?.toString() || ''} onChangeText={(t) => setCompanyData({ ...companyData, capital_amount: parseFloat(t) || undefined })} placeholder="10000" />
            </View>
          </View>

          <TouchableOpacity style={[styles.btn, { backgroundColor: '#7c3aed', marginTop: 16 }]} onPress={handleSaveCompany} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sauvegarder</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, { backgroundColor: '#6b7280', marginTop: 8 }]} onPress={() => setCompanyOpen(false)}>
            <Text style={styles.btnText}>Fermer</Text>
          </TouchableOpacity>
        </ScrollView>
  </Modal>

  {/* Create invoice modal */}
  <CreateInvoiceModal visible={createOpen} onClose={() => setCreateOpen(false)} />
  {/* Create quote modal */}
  <CreateQuoteModal visible={createQuoteOpen} onClose={() => setCreateQuoteOpen(false)} />

  {/* Invoice preview modal */}
  <InvoicePreviewModal visible={previewOpen} onClose={() => { setPreviewOpen(false); setPreviewInvoice(null); }} invoice={previewInvoice} companyInfo={companyInfo || null} />
  {/* Quote preview modal */}
  <QuotePreviewModal visible={previewQuoteOpen} onClose={() => { setPreviewQuoteOpen(false); setPreviewQuote(null); }} quote={previewQuote} companyInfo={companyInfo || null} />
    </View>
  );
};

const statusBg = (s: TInvoice['status']) =>
  ({
    draft: { backgroundColor: '#6b7280' },
    sent: { backgroundColor: '#6366f1' },
    paid: { backgroundColor: '#0ea5e9' },
    overdue: { backgroundColor: '#f97316' },
    cancelled: { backgroundColor: '#ef4444' },
  }[s] || { backgroundColor: '#6b7280' });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  muted: { color: '#6b7280' },
  mutedSmall: { color: '#6b7280', fontSize: 12 },
  micro: { color: '#94a3b8', fontSize: 12 },
  card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  grid: { flexDirection: 'row', gap: 8, marginTop: 8 },
  kpi: { fontSize: 20, fontWeight: '800', color: '#0ea5e9' },
  value: { fontWeight: '700', color: '#111827' },
  badge: { color: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontWeight: '700' },
  invoiceRow: { flexDirection: 'row', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  clientRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 8 },
  btnText: { color: 'white', fontWeight: '700' },
  btnSm: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnSmText: { color: 'white', fontWeight: '700' },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, color: '#111827', flex: 1 },
  label: { color: '#6b7280', marginTop: 12, marginBottom: 6 },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tab: { flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { color: '#111827', fontWeight: '700' },
  tabTextActive: { color: 'white' },
});

export default BillingScreen;
