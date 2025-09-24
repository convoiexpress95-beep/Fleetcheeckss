import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CompanyInfo {
  company_name: string;
  siret?: string;
  vat_number?: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  legal_form?: string;
}

interface Client {
  id: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  siret?: string;
  vat_number?: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  is_company: boolean;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_ht: number;
  vat_rate: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client: Client;
  items: InvoiceItem[];
  subtotal_ht: number;
  vat_rate: number;
  vat_amount: number;
  total_ttc: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  payment_terms: string;
  payment_method?: string;
  notes?: string;
  legal_mentions: string;
}

const FacturationScreenComplete = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'clients' | 'quotes' | 'settings'>('dashboard');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [siretLoading, setSiretLoading] = useState(false);
  
  // Company info state
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_name: 'FleetChecks SAS',
    siret: '12345678901234',
    vat_number: 'FR12345678901',
    address: '123 Rue de la Paix',
    postal_code: '75001',
    city: 'Paris',
    country: 'France',
    phone: '01 23 45 67 89',
    email: 'contact@fleetchecks.fr',
    legal_form: 'SAS',
  });

  // New client state (modal)
  const [newClient, setNewClient] = useState<Partial<Client>>({
    is_company: true,
    company_name: '',
    first_name: '',
    last_name: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'France',
    email: '',
    phone: '',
    siret: '',
    vat_number: '',
  });

  // Create invoice modal state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnitPrice, setItemUnitPrice] = useState('0');
  const [vatRate, setVatRate] = useState('20');
  const [dueDate, setDueDate] = useState<string>('');
  // Quote modal state
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [quoteClientId, setQuoteClientId] = useState('');
  const [quoteItemDescription, setQuoteItemDescription] = useState('');
  const [quoteItemQuantity, setQuoteItemQuantity] = useState('1');
  const [quoteItemUnitPrice, setQuoteItemUnitPrice] = useState('0');
  const [quoteVatRate, setQuoteVatRate] = useState('20');
  const [validityDate, setValidityDate] = useState('');

  // Clients mock data
  const mockClients: Client[] = [
    {
      id: '1',
      company_name: 'SARL Transport Express',
      address: '456 Avenue du Commerce',
      postal_code: '69000',
      city: 'Lyon',
      country: 'France',
      siret: '98765432101234',
      email: 'contact@transport-express.fr',
      phone: '04 78 90 12 34',
      is_company: true,
    },
    {
      id: '2',
      first_name: 'Martin',
      last_name: 'Dupont',
      address: '789 Rue des Fleurs',
      postal_code: '13000',
      city: 'Marseille',
      country: 'France',
      email: 'martin.dupont@email.fr',
      phone: '04 91 23 45 67',
      is_company: false,
    },
    {
      id: '3',
      company_name: 'Entreprise Dupont',
      address: '321 Boulevard de l\'Industrie',
      postal_code: '31000',
      city: 'Toulouse',
      country: 'France',
      siret: '11223344556677',
      email: 'contact@dupont-entreprise.fr',
      is_company: true,
    },
  ];

  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'FA-2025-001',
      client: mockClients[0],
      items: [
        {
          id: '1',
          description: 'Transport de marchandises Paris-Lyon',
          quantity: 1,
          unit_price: 450,
          total_ht: 450,
          vat_rate: 20,
        }
      ],
      subtotal_ht: 450,
      vat_rate: 20,
      vat_amount: 90,
      total_ttc: 540,
      status: 'sent',
      invoice_date: '2025-01-01',
      due_date: '2025-01-31',
      payment_terms: 'Paiement à 30 jours',
      legal_mentions: 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal.',
    },
    {
      id: '2',
      invoice_number: 'FA-2025-002',
      client: mockClients[1],
      items: [
        {
          id: '2',
          description: 'Service de livraison urgente',
          quantity: 2,
          unit_price: 140,
          total_ht: 280,
          vat_rate: 20,
        }
      ],
      subtotal_ht: 280,
      vat_rate: 20,
      vat_amount: 56,
      total_ttc: 336,
      status: 'paid',
      invoice_date: '2025-01-05',
      due_date: '2025-02-05',
      payment_terms: 'Paiement à 30 jours',
      legal_mentions: 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal.',
    },
    {
      id: '3',
      invoice_number: 'FA-2025-003',
      client: mockClients[2],
      items: [
        {
          id: '3',
          description: 'Déménagement bureaux 50m²',
          quantity: 1,
          unit_price: 650,
          total_ht: 650,
          vat_rate: 20,
        }
      ],
      subtotal_ht: 650,
      vat_rate: 20,
      vat_amount: 130,
      total_ttc: 780,
      status: 'overdue',
      invoice_date: '2024-12-15',
      due_date: '2025-01-15',
      payment_terms: 'Paiement à 30 jours',
      legal_mentions: 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal.',
    },
    {
      id: '4',
      invoice_number: 'FA-2025-004',
      client: {
        id: '4',
        first_name: 'Sophie',
        last_name: 'Martin',
        address: '159 Avenue des Lilas',
        postal_code: '33000',
        city: 'Bordeaux',
        country: 'France',
        email: 'sophie.martin@email.fr',
        phone: '05 56 78 90 12',
        is_company: false,
      },
      items: [
        {
          id: '4',
          description: 'Livraison produits fragiles',
          quantity: 1,
          unit_price: 125,
          total_ht: 125,
          vat_rate: 20,
        }
      ],
      subtotal_ht: 125,
      vat_rate: 20,
      vat_amount: 25,
      total_ttc: 150,
      status: 'paid',
      invoice_date: '2025-01-08',
      due_date: '2025-02-08',
      payment_terms: 'Paiement à 30 jours',
      legal_mentions: 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal.',
    },
    {
      id: '5',
      invoice_number: 'FA-2025-005',
      client: {
        id: '5',
        company_name: 'Restaurant Le Gourmet',
        address: '84 Place de la République',
        postal_code: '67000',
        city: 'Strasbourg',
        country: 'France',
        siret: '33445566778899',
        email: 'contact@le-gourmet.fr',
        is_company: true,
      },
      items: [
        {
          id: '5',
          description: 'Transport équipement cuisine',
          quantity: 1,
          unit_price: 320,
          total_ht: 320,
          vat_rate: 20,
        }
      ],
      subtotal_ht: 320,
      vat_rate: 20,
      vat_amount: 64,
      total_ttc: 384,
      status: 'draft',
      invoice_date: '2025-01-10',
      due_date: '2025-02-10',
      payment_terms: 'Paiement à 30 jours',
      legal_mentions: 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal.',
    },
  ];

  const handleCreateInvoice = () => {
    // Default due date +30 days
    const base = new Date();
    const due = new Date(base);
    due.setDate(due.getDate() + 30);
    setDueDate(due.toISOString().split('T')[0]);
    setShowCreateInvoiceModal(true);
  };

  const handleSubmitCreateInvoice = async () => {
    if (!user) return;
    if (!selectedClientId) {
      Alert.alert('Client requis', 'Veuillez sélectionner un client.');
      return;
    }
    const quantity = parseFloat(itemQuantity) || 0;
    const unitPrice = parseFloat(itemUnitPrice) || 0;
    const vat = parseFloat(vatRate) || 0;
    const total_ht = parseFloat((quantity * unitPrice).toFixed(2));
    const vat_amount = parseFloat(((total_ht * vat) / 100).toFixed(2));
    const total_ttc = parseFloat((total_ht + vat_amount).toFixed(2));

    try {
      setLoading(true);
      // Generate invoice number
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc('generate_invoice_number', { _user_id: user.id });
      if (numberError) throw numberError;

      // Insert invoice
      const { data: created, error: insertError } = await supabase
        .from('invoices')
        .insert({
          client_id: selectedClientId,
          user_id: user.id,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: dueDate || new Date().toISOString().split('T')[0],
          subtotal_ht: total_ht,
          vat_rate: vat,
          vat_amount,
          total_ttc,
          payment_terms: 'Paiement à 30 jours',
          status: 'draft',
          legal_mentions:
            "En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.",
        })
        .select()
        .single();
      if (insertError) throw insertError;

      // Add one item if provided
      if (itemDescription && quantity > 0 && unitPrice > 0) {
        const { error: itemError } = await supabase
          .from('invoice_items')
          .insert({
            invoice_id: (created as any).id,
            description: itemDescription,
            quantity,
            unit_price: unitPrice,
            total_ht,
            vat_rate: vat,
          });
        if (itemError) throw itemError;
      }

      await loadInvoices();
      setShowCreateInvoiceModal(false);
      // Reset form
      setSelectedClientId('');
      setItemDescription('');
      setItemQuantity('1');
      setItemUnitPrice('0');
      setVatRate('20');
      Alert.alert('Succès', 'Facture créée avec succès.');
      setActiveTab('invoices');
    } catch (e) {
      console.error('Error creating invoice (mobile):', e);
      Alert.alert('Erreur', "Impossible de créer la facture.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#16a34a';
      case 'sent': return '#2563eb';
      case 'overdue': return '#dc2626';
      case 'cancelled': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '✅ Payée';
      case 'sent': return '📤 Envoyée';
      case 'overdue': return '⚠️ En retard';
      case 'cancelled': return '❌ Annulée';
      default: return '📝 Brouillon';
    }
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_ttc, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_ttc, 0);

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

  const getClientName = (client: Client) => {
    return client.is_company 
      ? client.company_name || 'Entreprise' 
      : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Particulier';
  };

  // INSEE lookup via Edge Function used on web (validate-company-insee)
  const autoCompleteBySiret = async (siret: string) => {
    if (!siret || siret.replace(/\D/g, '').length !== 14) {
      Alert.alert('SIRET invalide', 'Le SIRET doit contenir 14 chiffres.');
      return null;
    }
    try {
      setSiretLoading(true);
      const { data, error } = await supabase.functions.invoke('validate-company-insee', {
        body: { siret }
      });
      if (error) throw error;
      if (!data?.success || !data?.data) {
        Alert.alert('Introuvable', "Aucune entreprise trouvée pour ce SIRET.");
        return null;
      }
      return data.data as any; // expected fields: name, address, postal_code, city, ...
    } catch (e) {
      console.error('INSEE lookup error:', e);
      Alert.alert('Erreur', "Impossible de récupérer les informations INSEE.");
      return null;
    } finally {
      setSiretLoading(false);
    }
  };

  // Loaders
  const loadClients = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (e) {
      console.error('Error loading clients (mobile):', e);
    }
  };

  const saveClient = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const payload: any = {
        ...newClient,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      // Minimal required fields: is_company and a display name
      if (payload.is_company) {
        if (!payload.company_name) {
          Alert.alert('Nom requis', "Renseignez le nom de l'entreprise.");
          setLoading(false);
          return;
        }
      } else {
        if (!payload.first_name && !payload.last_name) {
          Alert.alert('Nom requis', 'Renseignez le prénom et/ou nom.');
          setLoading(false);
          return;
        }
      }
      const { error } = await supabase.from('clients').insert(payload);
      if (error) throw error;
      await loadClients();
      setShowClientModal(false);
      setNewClient({ is_company: true, company_name: '', first_name: '', last_name: '', address: '', postal_code: '', city: '', country: 'France', email: '', phone: '', siret: '', vat_number: '' });
      Alert.alert('Succès', 'Client créé.');
    } catch (e) {
      console.error('Error saving client (mobile):', e);
      Alert.alert('Erreur', 'Impossible de sauvegarder le client.');
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyInfoMobile = async (): Promise<boolean> => {
    if (!user) return;
    try {
      setLoading(true);
      const payload: any = {
        ...companyInfo,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('company_info').upsert(payload);
      if (error) throw error;
      Alert.alert('Succès', "Informations d'entreprise sauvegardées.");
      // Optionnel: recharger company_info depuis DB si besoin
      return true;
    } catch (e) {
      console.error('Save company info error:', e);
      Alert.alert('Erreur', "Impossible de sauvegarder l'entreprise.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data || []) as unknown as Invoice[]);
    } catch (e) {
      console.error('Error loading invoices (mobile):', e);
    }
  };

  const loadQuotes = async () => {
    if (!user) return;
    try {
      // Fetch quotes without embedded relationships to avoid PGRST200 on missing FK constraints
      const { data: qs, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const quotes = qs || [];
      // Fetch items for these quotes
      const quoteIds = Array.from(new Set(quotes.map((q: any) => q.id).filter(Boolean)));
      let itemsByQuote = new Map<string, any[]>();
      if (quoteIds.length) {
        const { data: items, error: itemsErr } = await supabase
          .from('quote_items')
          .select('*')
          .in('quote_id', quoteIds);
        if (itemsErr) console.warn('[Quotes] fetch items error:', itemsErr);
        (items || []).forEach((it: any) => {
          const arr = itemsByQuote.get(it.quote_id) || [];
          arr.push(it);
          itemsByQuote.set(it.quote_id, arr);
        });
      }
      // Optionally fetch clients referenced by quotes if client_id present
      const clientIds = Array.from(new Set(quotes.map((q: any) => q.client_id).filter(Boolean)));
      let clientsMap = new Map<string, any>();
      if (clientIds.length) {
        const { data: cls, error: clErr } = await supabase
          .from('clients')
          .select('*')
          .in('id', clientIds);
        if (clErr) console.warn('[Quotes] fetch clients error:', clErr);
        clientsMap = new Map((cls || []).map((c: any) => [c.id, c]));
      }
      const enriched = quotes.map((q: any) => ({
        ...q,
        items: itemsByQuote.get(q.id) || [],
        client: q.client || clientsMap.get(q.client_id) || null,
      }));
      setQuotes(enriched);
    } catch (e) {
      console.error('Error loading quotes (mobile):', e);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([loadClients(), loadInvoices(), loadQuotes()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
              📊 Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
            onPress={() => setActiveTab('invoices')}
          >
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>
              📄 Factures ({totalInvoices})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
            onPress={() => setActiveTab('clients')}
          >
            <Text style={[styles.tabText, activeTab === 'clients' && styles.activeTabText]}>
              👥 Clients ({clients.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quotes' && styles.activeTab]}
            onPress={() => setActiveTab('quotes')}
          >
            <Text style={[styles.tabText, activeTab === 'quotes' && styles.activeTabText]}>
              📑 Devis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              ⚙️ Config
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Company Alert */}
          {!companyInfo && (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>🏢 Configuration entreprise requise</Text>
              <Text style={styles.alertText}>
                Veuillez configurer les informations légales de votre entreprise avant de créer des factures conformes.
              </Text>
            </View>
          )}

          {activeTab === 'dashboard' && (
            <View>
              {/* Statistiques */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statTitle}>💰 Chiffre d'affaires</Text>
                  <Text style={styles.statValue}>{totalRevenue.toFixed(2)}€</Text>
                  <Text style={styles.statSubtitle}>Factures payées</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statTitle}>⏳ En attente</Text>
                  <Text style={[styles.statValue, styles.pendingValue]}>{pendingAmount.toFixed(2)}€</Text>
                  <Text style={styles.statSubtitle}>À encaisser</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statTitle}>✅ Factures payées</Text>
                  <Text style={styles.statValue}>{paidInvoices}</Text>
                  <Text style={styles.statSubtitle}>sur {totalInvoices}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statTitle}>📊 Total factures</Text>
                  <Text style={styles.statValue}>{totalInvoices}</Text>
                  <Text style={styles.statSubtitle}>Émises</Text>
                </View>
              </View>

              {/* Actions rapides */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCreateInvoice}>
                  <Text style={styles.actionButtonText}>📄 Créer une facture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setShowClientModal(true)}>
                  <Text style={styles.actionButtonText}>👤 Nouveau client</Text>
                </TouchableOpacity>
              </View>

              {/* Factures récentes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Factures récentes</Text>
                {invoices.slice(0, 3).map((invoice) => (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceHeader}>
                      <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                      </View>
                    </View>
                    {invoice.client && (
                      <Text style={styles.clientName}>{getClientName(invoice.client)}</Text>
                    )}
                    <Text style={styles.serviceDescription}>{invoice.items?.[0]?.description}</Text>
                    <Text style={styles.amount}>💰 {invoice.total_ttc.toFixed(2)}€ TTC</Text>
                    <Text style={styles.invoiceDate}>
                      📅 Émise: {invoice.invoice_date} | Échéance: {invoice.due_date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'invoices' && (
            <View>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>📋 Toutes les factures légales</Text>
                  <TouchableOpacity style={styles.createBtn} onPress={handleCreateInvoice}>
                    <Text style={styles.createBtnText}>➕ Créer</Text>
                  </TouchableOpacity>
                </View>
                {invoices.map((invoice) => (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceHeader}>
                      <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                      </View>
                    </View>
                    {invoice.client && (
                      <Text style={styles.clientName}>{getClientName(invoice.client)}</Text>
                    )}
                    <Text style={styles.serviceDescription}>{invoice.items?.[0]?.description}</Text>
                    
                    {/* Détail montants */}
                    <View style={styles.amountDetails}>
                      <Text style={styles.amountLine}>HT: {invoice.subtotal_ht.toFixed(2)}€</Text>
                      <Text style={styles.amountLine}>TVA ({invoice.vat_rate}%): {invoice.vat_amount.toFixed(2)}€</Text>
                      <Text style={styles.amount}>TTC: {invoice.total_ttc.toFixed(2)}€</Text>
                    </View>
                    
                    <Text style={styles.invoiceDate}>
                      📅 Émise: {invoice.invoice_date} | Échéance: {invoice.due_date}
                    </Text>
                    
                    <Text style={styles.paymentTerms}>
                      💳 {invoice.payment_terms}
                    </Text>
                    
                    {/* Actions */}
                    <View style={styles.invoiceActions}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>👁️ Aperçu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>📤 Envoyer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>💾 PDF</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'clients' && (
            <View>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>👥 Gestion des clients</Text>
                  <TouchableOpacity style={styles.createBtn} onPress={() => setShowClientModal(true)}>
                    <Text style={styles.createBtnText}>➕ Ajouter</Text>
                  </TouchableOpacity>
                </View>
                {clients.map((client) => (
                  <View key={client.id} style={styles.clientCard}>
                    <View style={styles.clientHeader}>
                      <Text style={styles.clientName}>{getClientName(client)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: client.is_company ? '#2563eb' : '#16a34a' }]}>
                        <Text style={styles.statusText}>{client.is_company ? 'Entreprise' : 'Particulier'}</Text>
                      </View>
                    </View>
                    <Text style={styles.clientAddress}>{client.address}, {client.postal_code} {client.city}</Text>
                    {client.siret && <Text style={styles.clientSiret}>SIRET: {client.siret}</Text>}
                    {client.vat_number && <Text style={styles.clientSiret}>N° TVA: {client.vat_number}</Text>}
                    {client.email && <Text style={styles.clientContact}>📧 {client.email}</Text>}
                    {client.phone && <Text style={styles.clientContact}>📞 {client.phone}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'quotes' && (
            <View>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>📑 Devis</Text>
                  <TouchableOpacity style={styles.createBtn} onPress={() => {
                    const base = new Date();
                    const v = new Date(base);
                    v.setDate(v.getDate() + 30);
                    setValidityDate(v.toISOString().split('T')[0]);
                    setShowCreateQuoteModal(true);
                  }}>
                    <Text style={styles.createBtnText}>➕ Créer</Text>
                  </TouchableOpacity>
                </View>
                {quotes.map((quote: any) => (
                  <View key={quote.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceHeader}>
                      <Text style={styles.invoiceNumber}>{quote.quote_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: quote.status === 'accepted' ? '#16a34a' : quote.status === 'sent' ? '#2563eb' : quote.status === 'rejected' ? '#dc2626' : quote.status === 'expired' ? '#9ca3af' : '#6b7280' }]}>
                        <Text style={styles.statusText}>
                          {quote.status === 'accepted' ? '✅ Accepté' : quote.status === 'sent' ? '📤 Envoyé' : quote.status === 'rejected' ? '❌ Refusé' : quote.status === 'expired' ? '⌛ Expiré' : '📝 Brouillon'}
                        </Text>
                      </View>
                    </View>
                    {quote.client && (
                      <Text style={styles.clientName}>{getClientName(quote.client)}</Text>
                    )}
                    <Text style={styles.serviceDescription}>{quote.items?.[0]?.description}</Text>
                    <View style={styles.amountDetails}>
                      <Text style={styles.amountLine}>HT: {quote.subtotal_ht?.toFixed ? quote.subtotal_ht.toFixed(2) : Number(quote.subtotal_ht || 0).toFixed(2)}€</Text>
                      <Text style={styles.amountLine}>TVA ({quote.vat_rate}%): {quote.vat_amount?.toFixed ? quote.vat_amount.toFixed(2) : Number(quote.vat_amount || 0).toFixed(2)}€</Text>
                      <Text style={styles.amount}>TTC: {quote.total_ttc?.toFixed ? quote.total_ttc.toFixed(2) : Number(quote.total_ttc || 0).toFixed(2)}€</Text>
                    </View>
                    <Text style={styles.invoiceDate}>
                      📅 Émis: {quote.quote_date} | Validité: {quote.validity_date}
                    </Text>
                    <View style={styles.invoiceActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={async () => {
                        try {
                          setLoading(true);
                          await supabase.from('quotes').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', quote.id);
                          await loadQuotes();
                        } finally {
                          setLoading(false);
                        }
                      }}>
                        <Text style={styles.actionBtnText}>✅ Accepter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={async () => {
                        try {
                          setLoading(true);
                          await supabase.from('quotes').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', quote.id);
                          await loadQuotes();
                        } finally {
                          setLoading(false);
                        }
                      }}>
                        <Text style={styles.actionBtnText}>❌ Refuser</Text>
                      </TouchableOpacity>
                      {quote.status === 'accepted' && (
                        <TouchableOpacity style={styles.actionBtn} onPress={async () => {
                          // Convert to invoice: recreate minimal flow (server has a helper in web hook)
                          try {
                            setLoading(true);
                            // Create invoice number
                            const { data: number, error: numErr } = await supabase.rpc('generate_invoice_number', { _user_id: user!.id });
                            if (numErr) throw numErr;
                            const { data: created, error: insErr } = await supabase
                              .from('invoices')
                              .insert({
                                client_id: quote.client_id,
                                user_id: user!.id,
                                invoice_number: number,
                                invoice_date: new Date().toISOString().split('T')[0],
                                due_date: new Date().toISOString().split('T')[0],
                                subtotal_ht: quote.subtotal_ht || 0,
                                vat_rate: quote.vat_rate ?? 20,
                                vat_amount: quote.vat_amount || 0,
                                total_ttc: quote.total_ttc || 0,
                                payment_terms: quote.payment_terms || 'Paiement à 30 jours',
                                payment_method: quote.payment_method,
                                notes: quote.notes,
                                legal_mentions: quote.legal_mentions || "En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.",
                                status: 'draft'
                              })
                              .select()
                              .single();
                            if (insErr) throw insErr;
                            if (quote.items?.length) {
                              const items = quote.items.map((i: any) => ({
                                invoice_id: (created as any).id,
                                description: i.description,
                                quantity: i.quantity,
                                unit_price: i.unit_price,
                                total_ht: i.total_ht,
                                vat_rate: i.vat_rate,
                              }));
                              const { error: addErr } = await supabase.from('invoice_items').insert(items);
                              if (addErr) throw addErr;
                            }
                            await Promise.all([loadInvoices(), loadQuotes()]);
                            Alert.alert('Succès', 'Facture créée depuis le devis.');
                            setActiveTab('invoices');
                          } catch (e) {
                            console.error('Convert quote -> invoice (mobile) error', e);
                            Alert.alert('Erreur', "Impossible de convertir le devis en facture.");
                          } finally {
                            setLoading(false);
                          }
                        }}>
                          <Text style={styles.actionBtnText}>🧾 Convertir</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Configuration du système</Text>
                
                {/* Company Setup Button */}
                <TouchableOpacity 
                  style={styles.companyButton}
                  onPress={() => setShowCompanyModal(true)}
                >
                  <Text style={styles.companyButtonText}>
                    🏢 {companyInfo ? 'Modifier entreprise' : 'Configurer entreprise'}
                  </Text>
                </TouchableOpacity>

                {/* Company Info Display */}
                {companyInfo && (
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{companyInfo.company_name}</Text>
                    <Text style={styles.companyDetail}>{companyInfo.address}</Text>
                    <Text style={styles.companyDetail}>{companyInfo.postal_code} {companyInfo.city}</Text>
                    {companyInfo.siret && <Text style={styles.companyDetail}>SIRET: {companyInfo.siret}</Text>}
                    {companyInfo.vat_number && <Text style={styles.companyDetail}>N° TVA: {companyInfo.vat_number}</Text>}
                    {companyInfo.phone && <Text style={styles.companyDetail}>📞 {companyInfo.phone}</Text>}
                    {companyInfo.email && <Text style={styles.companyDetail}>📧 {companyInfo.email}</Text>}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Paramètres de facturation</Text>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Numérotation automatique</Text>
                  <Switch value={true} />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Archivage sécurisé</Text>
                  <Switch value={true} />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Conformité légale française</Text>
                  <Switch value={true} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Company Info Modal */}
        <Modal visible={showCompanyModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏢 Informations légales de l'entreprise</Text>
              <TouchableOpacity onPress={() => setShowCompanyModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Ces informations apparaîtront sur toutes vos factures légales
              </Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom de l'entreprise *</Text>
                <TextInput
                  style={styles.input}
                  value={companyInfo.company_name}
                  onChangeText={(text) => setCompanyInfo({...companyInfo, company_name: text})}
                  placeholder="FleetChecks SAS"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>SIRET</Text>
                  <TextInput
                    style={styles.input}
                    value={companyInfo.siret}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, siret: text})}
                    placeholder="12345678901234"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>N° TVA</Text>
                  <TextInput
                    style={styles.input}
                    value={companyInfo.vat_number}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, vat_number: text})}
                    placeholder="FR12345678901"
                  />
                </View>
              </View>

              {/* SIRET autocomplete */}
              <TouchableOpacity
                style={styles.secondaryButton}
                disabled={siretLoading}
                onPress={async () => {
                  const res = await autoCompleteBySiret(companyInfo.siret || '');
                  if (res) {
                    setCompanyInfo(prev => ({
                      ...prev,
                      company_name: res.name || prev.company_name || '',
                      address: res.address || prev.address || '',
                      postal_code: res.postal_code || prev.postal_code || '',
                      city: res.city || prev.city || '',
                    }));
                  }
                }}
              >
                <Text style={styles.secondaryButtonText}>{siretLoading ? 'Recherche…' : '🔎 Remplir via SIRET'}</Text>
              </TouchableOpacity>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Adresse *</Text>
                <TextInput
                  style={styles.input}
                  value={companyInfo.address}
                  onChangeText={(text) => setCompanyInfo({...companyInfo, address: text})}
                  placeholder="123 Rue de la Paix"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Code postal</Text>
                  <TextInput
                    style={styles.input}
                    value={companyInfo.postal_code}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, postal_code: text})}
                    placeholder="75001"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Ville</Text>
                  <TextInput
                    style={styles.input}
                    value={companyInfo.city}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, city: text})}
                    placeholder="Paris"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Téléphone</Text>
                  <TextInput
                    style={styles.input}
                    value={companyInfo.phone}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, phone: text})}
                    placeholder="01 23 45 67 89"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={companyInfo.email}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, email: text})}
                    placeholder="contact@fleetchecks.fr"
                    keyboardType="email-address"
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.saveButton} disabled={loading}
                onPress={async () => {
                  const ok = await saveCompanyInfoMobile();
                  if (ok) setShowCompanyModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>{loading ? 'Sauvegarde…' : '💾 Sauvegarder'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Client Modal */}
        <Modal visible={showClientModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 Nouveau client</Text>
              <TouchableOpacity onPress={() => setShowClientModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Ajoutez les informations de votre nouveau client pour la facturation
              </Text>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Type de client:</Text>
                <View style={styles.switchOption}>
                  <Text style={styles.switchText}>👤 Particulier</Text>
                  <Switch value={newClient.is_company ? false : true} onValueChange={(v) => setNewClient(prev => ({ ...prev, is_company: !v }))} />
                  <Text style={styles.switchText}>🏢 Entreprise</Text>
                </View>
              </View>

              {newClient.is_company ? (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Raison sociale *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: SARL Transport Express"
                    value={newClient.company_name}
                    onChangeText={(t) => setNewClient(prev => ({ ...prev, company_name: t }))}
                  />
                </View>
              ) : (
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput style={styles.input} value={newClient.first_name}
                      onChangeText={(t) => setNewClient(prev => ({ ...prev, first_name: t }))} />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput style={styles.input} value={newClient.last_name}
                      onChangeText={(t) => setNewClient(prev => ({ ...prev, last_name: t }))} />
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Adresse</Text>
                <TextInput style={styles.input} value={newClient.address}
                  onChangeText={(t) => setNewClient(prev => ({ ...prev, address: t }))} />
              </View>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Code postal</Text>
                  <TextInput style={styles.input} value={newClient.postal_code}
                    onChangeText={(t) => setNewClient(prev => ({ ...prev, postal_code: t }))} keyboardType="number-pad" />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Ville</Text>
                  <TextInput style={styles.input} value={newClient.city}
                    onChangeText={(t) => setNewClient(prev => ({ ...prev, city: t }))} />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Pays</Text>
                <TextInput style={styles.input} value={newClient.country}
                  onChangeText={(t) => setNewClient(prev => ({ ...prev, country: t }))} />
              </View>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput style={styles.input} value={newClient.email}
                    onChangeText={(t) => setNewClient(prev => ({ ...prev, email: t }))} keyboardType="email-address" />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Téléphone</Text>
                  <TextInput style={styles.input} value={newClient.phone}
                    onChangeText={(t) => setNewClient(prev => ({ ...prev, phone: t }))} keyboardType="phone-pad" />
                </View>
              </View>
              {newClient.is_company && (
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>SIRET</Text>
                    <TextInput style={styles.input} value={newClient.siret}
                      onChangeText={(t) => setNewClient(prev => ({ ...prev, siret: t }))} keyboardType="number-pad" />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>N° TVA</Text>
                    <TextInput style={styles.input} value={newClient.vat_number}
                      onChangeText={(t) => setNewClient(prev => ({ ...prev, vat_number: t }))} />
                  </View>
                </View>
              )}

              {/* SIRET autocomplete for client */}
              {newClient.is_company && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  disabled={siretLoading}
                  onPress={async () => {
                    const res = await autoCompleteBySiret(newClient.siret || '');
                    if (res) {
                      setNewClient(prev => ({
                        ...prev,
                        is_company: true,
                        company_name: res.name || prev.company_name || '',
                        address: res.address || prev.address || '',
                        postal_code: res.postal_code || prev.postal_code || '',
                        city: res.city || prev.city || '',
                      }));
                    }
                  }}
                >
                  <Text style={styles.secondaryButtonText}>{siretLoading ? 'Recherche…' : '🔎 Remplir via SIRET'}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.saveButton} onPress={saveClient}>
                <Text style={styles.saveButtonText}>💾 Créer le client</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Create Invoice Modal */}
        <Modal visible={showCreateInvoiceModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📄 Nouvelle facture</Text>
              <TouchableOpacity onPress={() => setShowCreateInvoiceModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>Sélectionnez un client et renseignez au moins une ligne.</Text>
              <Text style={styles.label}>Client</Text>
              {/* Simple client selector */}
              {clients.length === 0 ? (
                <Text style={{ color: '#9ca3af', marginBottom: 12 }}>Aucun client. Créez-en un d'abord.</Text>
              ) : (
                <View style={{ marginBottom: 12 }}>
                  {clients.map((c) => (
                    <TouchableOpacity key={c.id} style={[styles.clientOption, selectedClientId === c.id && styles.clientOptionSelected]} onPress={() => setSelectedClientId(c.id)}>
                      <Text style={{ color: 'white' }}>{getClientName(c)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={styles.input} value={itemDescription} onChangeText={setItemDescription} placeholder="Ex: Prestation de transport" />
              </View>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Quantité</Text>
                  <TextInput style={styles.input} keyboardType="decimal-pad" value={itemQuantity} onChangeText={setItemQuantity} />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Prix unitaire (€ HT)</Text>
                  <TextInput style={styles.input} keyboardType="decimal-pad" value={itemUnitPrice} onChangeText={setItemUnitPrice} />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>TVA (%)</Text>
                  <TextInput style={styles.input} keyboardType="decimal-pad" value={vatRate} onChangeText={setVatRate} />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Échéance (AAAA-MM-JJ)</Text>
                  <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSubmitCreateInvoice} disabled={loading || !selectedClientId}>
                <Text style={styles.saveButtonText}>{loading ? 'Création…' : '💾 Créer la facture'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Create Quote Modal */}
        <Modal visible={showCreateQuoteModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📑 Nouveau devis</Text>
              <TouchableOpacity onPress={() => setShowCreateQuoteModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>Sélectionnez un client et ajoutez une ligne.</Text>
              <Text style={styles.label}>Client</Text>
              {clients.length === 0 ? (
                <Text style={{ color: '#9ca3af', marginBottom: 12 }}>Aucun client. Créez-en un d'abord.</Text>
              ) : (
                <View style={{ marginBottom: 12 }}>
                  {clients.map((c) => (
                    <TouchableOpacity key={c.id} style={[styles.clientOption, quoteClientId === c.id && styles.clientOptionSelected]} onPress={() => setQuoteClientId(c.id)}>
                      <Text style={{ color: 'white' }}>{getClientName(c)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={styles.input} value={quoteItemDescription} onChangeText={setQuoteItemDescription} placeholder="Ex: Prestation de transport" />
              </View>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Quantité</Text>
                  <TextInput style={styles.input} keyboardType="decimal-pad" value={quoteItemQuantity} onChangeText={setQuoteItemQuantity} />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Prix unitaire (€ HT)</Text>
                  <TextInput style={styles.input} keyboardType="decimal-pad" value={quoteItemUnitPrice} onChangeText={setQuoteItemUnitPrice} />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>TVA (%)</Text>
                  <TextInput style={styles.input} keyboardType="decimal-pad" value={quoteVatRate} onChangeText={setQuoteVatRate} />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Validité (AAAA-MM-JJ)</Text>
                  <TextInput style={styles.input} value={validityDate} onChangeText={setValidityDate} />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={async () => {
                if (!user) return;
                if (!quoteClientId) {
                  Alert.alert('Client requis', 'Veuillez sélectionner un client.');
                  return;
                }
                const q = parseFloat(quoteItemQuantity) || 0;
                const up = parseFloat(quoteItemUnitPrice) || 0;
                const vr = parseFloat(quoteVatRate) || 0;
                const total_ht = parseFloat((q * up).toFixed(2));
                const vat_amount = parseFloat(((total_ht * vr) / 100).toFixed(2));
                const total_ttc = parseFloat((total_ht + vat_amount).toFixed(2));
                try {
                  setLoading(true);
                  const { data: number, error: numErr } = await supabase
                    .rpc('generate_quote_number', { _user_id: user.id });
                  if (numErr) throw numErr;
                  const { data: created, error: insErr } = await supabase
                    .from('quotes')
                    .insert({
                      client_id: quoteClientId,
                      user_id: user.id,
                      quote_number: number,
                      quote_date: new Date().toISOString().split('T')[0],
                      validity_date: validityDate || new Date().toISOString().split('T')[0],
                      subtotal_ht: total_ht,
                      vat_rate: vr,
                      vat_amount,
                      total_ttc,
                      payment_terms: 'Paiement à 30 jours',
                      status: 'draft',
                      legal_mentions: "Devis valable jusqu'à la date indiquée.",
                    })
                    .select()
                    .single();
                  if (insErr) throw insErr;
                  if (quoteItemDescription && q > 0 && up > 0) {
                    const { error: lineErr } = await supabase
                      .from('quote_items')
                      .insert({
                        quote_id: (created as any).id,
                        description: quoteItemDescription,
                        quantity: q,
                        unit_price: up,
                        total_ht,
                        vat_rate: vr,
                      });
                    if (lineErr) throw lineErr;
                  }
                  await loadQuotes();
                  setShowCreateQuoteModal(false);
                  setQuoteClientId('');
                  setQuoteItemDescription('');
                  setQuoteItemQuantity('1');
                  setQuoteItemUnitPrice('0');
                  setQuoteVatRate('20');
                  Alert.alert('Succès', 'Devis créé avec succès.');
                  setActiveTab('quotes');
                } catch (e) {
                  console.error('Error creating quote (mobile):', e);
                  Alert.alert('Erreur', "Impossible de créer le devis.");
                } finally {
                  setLoading(false);
                }
              }} disabled={loading || !quoteClientId}>
                <Text style={styles.saveButtonText}>{loading ? 'Création…' : '💾 Créer le devis'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingBottom: Platform.OS === 'android' ? 90 : 100, // Espace pour la barre remontée
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#06b6d4',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#b45309',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d97706',
  },
  alertTitle: {
    color: '#fef3c7',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  alertText: {
    color: '#fde68a',
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  statTitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    color: '#06b6d4',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  pendingValue: {
    color: '#f59e0b',
  },
  statSubtitle: {
    color: '#6b7280',
    fontSize: 11,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  createBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  createBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    color: '#06b6d4',
    fontWeight: '700',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  clientName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  serviceDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  amountDetails: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  amountLine: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 2,
  },
  amount: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  invoiceDate: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 12,
  },
  paymentTerms: {
    color: '#8b5cf6',
    fontSize: 12,
    marginBottom: 12,
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  actionBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  clientCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientAddress: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  clientSiret: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  clientContact: {
    color: '#06b6d4',
    fontSize: 13,
    marginBottom: 2,
  },
  companyButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  companyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  companyInfo: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  companyName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  companyDetail: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: '#9ca3af',
    fontSize: 24,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    width: '48%',
    marginBottom: 16,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchText: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 12,
  },
  saveButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  clientOption: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  clientOptionSelected: {
    borderColor: '#06b6d4',
  },
});

export default FacturationScreenComplete;