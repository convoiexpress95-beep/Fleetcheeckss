import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useBilling, TClient, TInvoiceItem } from '../hooks/useBilling';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Step = 'client' | 'details' | 'items';

const CreateInvoiceModal: React.FC<Props> = ({ visible, onClose }) => {
  const { clients, validateSiret, saveClient, createInvoice, addInvoiceItems, loading } = useBilling();

  const [step, setStep] = useState<Step>('client');

  // Client
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientSiret, setClientSiret] = useState('');
  const [newClient, setNewClient] = useState<Partial<TClient>>({
    is_company: true,
    address: '',
    postal_code: '',
    city: '',
    country: 'France',
  });

  // Details
  const [dueDate, setDueDate] = useState('');
  const [vatRate, setVatRate] = useState<number>(20);
  const [paymentTerms, setPaymentTerms] = useState('Paiement à 30 jours');
  const [paymentMethod, setPaymentMethod] = useState('Virement bancaire');
  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState<TInvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, total_ht: 0, vat_rate: 20 },
  ]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const totals = useMemo(() => {
    const subtotalHt = items.reduce((s, i) => s + (i.total_ht || 0), 0);
    const vatAmount = subtotalHt * (vatRate / 100);
    const totalTtc = subtotalHt + vatAmount;
    return { subtotalHt, vatAmount, totalTtc };
  }, [items, vatRate]);

  const reset = () => {
    setStep('client');
    setSelectedClientId('');
    setIsNewClient(false);
    setClientSiret('');
    setNewClient({ is_company: true, address: '', postal_code: '', city: '', country: 'France' });
    setDueDate('');
    setVatRate(20);
    setPaymentTerms('Paiement à 30 jours');
    setPaymentMethod('Virement bancaire');
    setNotes('');
    setItems([{ description: '', quantity: 1, unit_price: 0, total_ht: 0, vat_rate: 20 }]);
  };

  const handleValidateSiret = async () => {
    if (!clientSiret) return;
    const data = await validateSiret(clientSiret);
    if (data) {
      setNewClient((prev) => ({
        ...prev,
        company_name: data.company_name,
        siret: data.siret,
        address: data.address,
        postal_code: data.postal_code,
        city: data.city,
        country: data.country,
        is_company: true,
      }));
    }
  };

  const addItem = () => setItems((arr) => [...arr, { description: '', quantity: 1, unit_price: 0, total_ht: 0, vat_rate: vatRate }]);
  const removeItem = (idx: number) => setItems((arr) => (arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr));
  const updateItem = (idx: number, patch: Partial<TInvoiceItem>) => {
    setItems((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch } as TInvoiceItem;
      // recalc total_ht when quantity or unit_price changes
      const { quantity, unit_price } = next[idx];
      next[idx].total_ht = (quantity || 0) * (unit_price || 0);
      return next;
    });
  };

  const handleCreate = async () => {
    let clientId = selectedClientId;

    if (isNewClient) {
      const ok = await saveClient(newClient as TClient);
      if (!ok) return;
      // Try to find the client back (by siret or name)
      const match = clients.find((c) => (newClient.siret && c.siret === newClient.siret) || (newClient.company_name && c.company_name === newClient.company_name) || (newClient.email && c.email === newClient.email));
      if (match?.id) clientId = match.id;
    }

    if (!clientId) return;

    const inv = await createInvoice({
      client_id: clientId,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      subtotal_ht: totals.subtotalHt,
      vat_rate: vatRate,
      vat_amount: totals.vatAmount,
      total_ttc: totals.totalTtc,
      payment_terms: paymentTerms,
      payment_method: paymentMethod,
      notes,
      legal_mentions:
        "En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.",
    });

    if (inv && (inv as any).id) {
      await addInvoiceItems((inv as any).id, items);
      onClose();
      reset();
    }
  };

  const canProceedClient = !!selectedClientId || isNewClient;
  const canProceedItems = items.every((i) => i.description && i.unit_price > 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Créer une facture légale</Text>

        {/* Steps header */}
        <View style={styles.steps}>
          <View style={[styles.step, step === 'client' && styles.stepActive]}><Text style={styles.stepText}>Client</Text></View>
          <View style={[styles.step, step === 'details' && styles.stepActive]}><Text style={styles.stepText}>Détails</Text></View>
          <View style={[styles.step, step === 'items' && styles.stepActive]}><Text style={styles.stepText}>Lignes</Text></View>
        </View>

        {step === 'client' && (
          <View style={{ gap: 12 }}>
            {/* Existing client selector */}
            <Text style={styles.label}>Sélectionner un client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {clients.map((c) => (
                <TouchableOpacity key={c.id} onPress={() => setSelectedClientId(c.id!)} style={[styles.chip, selectedClientId === c.id && styles.chipActive]}>
                  <Text style={[styles.chipText, selectedClientId === c.id && styles.chipTextActive]}>
                    {c.is_company ? c.company_name : `${c.first_name ?? ''} ${c.last_name ?? ''}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setIsNewClient((v) => !v)} style={[styles.btnOutline]}> 
              <Text style={styles.btnOutlineText}>{isNewClient ? 'Annuler le nouveau client' : 'Nouveau client'}</Text>
            </TouchableOpacity>

            {isNewClient && (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setNewClient((p) => ({ ...p, is_company: true }))} style={[styles.toggle, newClient.is_company && styles.toggleActive]}>
                    <Text style={[styles.toggleText, newClient.is_company && styles.toggleTextActive]}>Entreprise</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setNewClient((p) => ({ ...p, is_company: false }))} style={[styles.toggle, !newClient.is_company && styles.toggleActive]}>
                    <Text style={[styles.toggleText, !newClient.is_company && styles.toggleTextActive]}>Particulier</Text>
                  </TouchableOpacity>
                </View>

                {newClient.is_company && (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput placeholder="SIRET" value={clientSiret} onChangeText={setClientSiret} style={[styles.input, { flex: 1 }]} keyboardType="number-pad" />
                      <TouchableOpacity onPress={handleValidateSiret} style={[styles.btnSm, { backgroundColor: '#06b6d4' }]} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSmText}>Valider</Text>}
                      </TouchableOpacity>
                    </View>
                    <TextInput placeholder="Nom de l'entreprise" value={newClient.company_name || ''} onChangeText={(t) => setNewClient({ ...newClient, company_name: t })} style={styles.input} />
                  </View>
                )}

                {!newClient.is_company && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TextInput placeholder="Prénom" value={newClient.first_name || ''} onChangeText={(t) => setNewClient({ ...newClient, first_name: t })} style={[styles.input, { flex: 1 }]} />
                    <TextInput placeholder="Nom" value={newClient.last_name || ''} onChangeText={(t) => setNewClient({ ...newClient, last_name: t })} style={[styles.input, { flex: 1 }]} />
                  </View>
                )}

                <TextInput placeholder="Adresse complète" value={newClient.address} onChangeText={(t) => setNewClient({ ...newClient, address: t })} style={[styles.input, { height: 80 }]} multiline />

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput placeholder="Code postal" value={newClient.postal_code} onChangeText={(t) => setNewClient({ ...newClient, postal_code: t })} style={[styles.input, { flex: 1 }]} />
                  <TextInput placeholder="Ville" value={newClient.city} onChangeText={(t) => setNewClient({ ...newClient, city: t })} style={[styles.input, { flex: 1 }]} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput placeholder="Téléphone" value={newClient.phone || ''} onChangeText={(t) => setNewClient({ ...newClient, phone: t })} style={[styles.input, { flex: 1 }]} />
                  <TextInput placeholder="Email" value={newClient.email || ''} onChangeText={(t) => setNewClient({ ...newClient, email: t })} style={[styles.input, { flex: 1 }]} keyboardType="email-address" />
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: '#6b7280' }]}>
                <Text style={styles.btnText}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={!canProceedClient} onPress={() => setStep('details')} style={[styles.btn, { backgroundColor: canProceedClient ? '#7c3aed' : '#c4b5fd' }]}>
                <Text style={styles.btnText}>Suivant</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'details' && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date d'échéance</Text>
                <TextInput placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} style={styles.input} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>TVA (%)</Text>
                <TextInput keyboardType="numeric" value={String(vatRate)} onChangeText={(t) => setVatRate(parseFloat(t) || 0)} style={styles.input} />
              </View>
            </View>

            <Text style={styles.label}>Conditions de paiement</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['Paiement à réception', 'Paiement à 15 jours', 'Paiement à 30 jours', 'Paiement à 45 jours', 'Paiement à 60 jours'].map((opt) => (
                <TouchableOpacity key={opt} onPress={() => setPaymentTerms(opt)} style={[styles.chip, paymentTerms === opt && styles.chipActive]}>
                  <Text style={[styles.chipText, paymentTerms === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Mode de règlement</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['Virement bancaire', 'Chèque', 'Espèces', 'Carte bancaire', 'Prélèvement'].map((opt) => (
                <TouchableOpacity key={opt} onPress={() => setPaymentMethod(opt)} style={[styles.chip, paymentMethod === opt && styles.chipActive]}>
                  <Text style={[styles.chipText, paymentMethod === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Notes</Text>
            <TextInput placeholder="Notes ou commentaires" value={notes} onChangeText={setNotes} style={[styles.input, { height: 80 }]} multiline />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <TouchableOpacity onPress={() => setStep('client')} style={[styles.btn, { backgroundColor: '#6b7280', flex: 1 }]}>
                <Text style={styles.btnText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('items')} style={[styles.btn, { backgroundColor: '#7c3aed', flex: 1 }]}>
                <Text style={styles.btnText}>Suivant</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'items' && (
          <View style={{ gap: 12 }}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.subtitle}>Ligne {idx + 1}</Text>
                <TextInput placeholder="Description" value={item.description} onChangeText={(t) => updateItem(idx, { description: t })} style={[styles.input, { height: 70 }]} multiline />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Quantité</Text>
                    <TextInput keyboardType="numeric" value={String(item.quantity)} onChangeText={(t) => updateItem(idx, { quantity: parseFloat(t) || 0 })} style={styles.input} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Prix unitaire HT</Text>
                    <TextInput keyboardType="numeric" value={String(item.unit_price)} onChangeText={(t) => updateItem(idx, { unit_price: parseFloat(t) || 0 })} style={styles.input} />
                  </View>
                </View>
                <Text style={styles.muted}>Total HT: {formatCurrency(item.total_ht || 0)}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(idx)} style={[styles.btnSm, { backgroundColor: '#ef4444', alignSelf: 'flex-start', marginTop: 6 }]}>
                    <Text style={styles.btnSmText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addItem} style={[styles.btn, { backgroundColor: '#0ea5e9' }]}>
              <Text style={styles.btnText}>Ajouter une ligne</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.subtitle}>Récapitulatif</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.muted}>Total HT</Text>
                <Text style={styles.value}>{formatCurrency(totals.subtotalHt)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.muted}>TVA ({vatRate}%)</Text>
                <Text style={styles.value}>{formatCurrency(totals.vatAmount)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={[styles.value, { fontSize: 18 }]}>Total TTC</Text>
                <Text style={[styles.value, { fontSize: 18 }]}>{formatCurrency(totals.totalTtc)}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <TouchableOpacity onPress={() => setStep('details')} style={[styles.btn, { backgroundColor: '#6b7280', flex: 1 }]}>
                <Text style={styles.btnText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} disabled={loading || !canProceedItems || !dueDate} style={[styles.btn, { backgroundColor: loading || !canProceedItems || !dueDate ? '#c4b5fd' : '#7c3aed', flex: 1 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Créer la facture</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={() => { onClose(); reset(); }} style={[styles.btn, { backgroundColor: '#6b7280', marginTop: 16 }]}>
          <Text style={styles.btnText}>Fermer</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  steps: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  step: { backgroundColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  stepActive: { backgroundColor: '#6366f1' },
  stepText: { color: '#111827', fontWeight: '700' },
  label: { color: '#6b7280', marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, color: '#111827' },
  card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  chip: { borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#ffffff' },
  chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipText: { color: '#374151', fontWeight: '700' },
  chipTextActive: { color: 'white' },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
  btnOutline: { padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff' },
  btnOutlineText: { color: '#111827', fontWeight: '700' },
  btnSm: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnSmText: { color: 'white', fontWeight: '700' },
  muted: { color: '#6b7280' },
  value: { color: '#111827', fontWeight: '700' },
  toggle: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  toggleActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  toggleText: { color: '#374151', fontWeight: '700' },
  toggleTextActive: { color: 'white' },
});

export default CreateInvoiceModal;
