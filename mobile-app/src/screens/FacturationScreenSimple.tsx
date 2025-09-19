import React, { useState } from 'react';
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

const FacturationScreenSimple = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'clients' | 'create'>('dashboard');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  
  // État pour nouvelle facture
  const [newInvoice, setNewInvoice] = useState({
    client_name: '',
    service_description: '',
    amount: 0,
    due_date: '',
  });
  
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
      client: {
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
  ];

  const handleCreateInvoice = () => {
    Alert.alert('Création', `Nouvelle facture créée avec succès`);
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

  const totalRevenue = mockInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_ttc, 0);

  const pendingAmount = mockInvoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_ttc, 0);

  const totalInvoices = mockInvoices.length;
  const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid').length;

  const getClientName = (client: Client) => {
    return client.is_company 
      ? client.company_name || 'Entreprise' 
      : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Particulier';
  };

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
            📊 Tableau de bord
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            ➕ Nouvelle facture
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' && (
          <View>
            {/* Statistiques */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Revenus totaux</Text>
                <Text style={styles.statValue}>{totalRevenue}€</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>En attente</Text>
                <Text style={[styles.statValue, styles.pendingValue]}>{pendingAmount}€</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Factures récentes</Text>
            {mockInvoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                  <Text style={[styles.statusBadge, { color: getStatusColor(invoice.status) }]}>
                    {getStatusText(invoice.status)}
                  </Text>
                </View>
                
                <Text style={styles.clientName}>
                  {invoice.client.company_name || `${invoice.client.first_name} ${invoice.client.last_name}`}
                </Text>
                <Text style={styles.serviceDescription}>
                  {invoice.items.map(item => item.description).join(', ')}
                </Text>
                <Text style={styles.amount}>💰 {invoice.total_ttc}€</Text>
                <Text style={styles.dates}>
                  📅 Créée: {invoice.invoice_date} | Échéance: {invoice.due_date}
                </Text>

                <View style={styles.invoiceActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Voir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Envoyer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'create' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Créer une nouvelle facture</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du client</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom ou raison sociale"
                  value={newInvoice.client_name}
                  onChangeText={(text) => setNewInvoice({...newInvoice, client_name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description du service</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Décrivez les services facturés..."
                  value={newInvoice.service_description}
                  onChangeText={(text) => setNewInvoice({...newInvoice, service_description: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant (€)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Montant HT en euros"
                  value={newInvoice.amount.toString()}
                  onChangeText={(text) => setNewInvoice({...newInvoice, amount: parseFloat(text) || 0})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date d'échéance</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AAAA-MM-JJ"
                  value={newInvoice.due_date}
                  onChangeText={(text) => setNewInvoice({...newInvoice, due_date: text})}
                />
              </View>

              <TouchableOpacity style={styles.createButton} onPress={handleCreateInvoice}>
                <Text style={styles.createButtonText}>Créer la facture</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  pendingValue: {
    color: '#dc2626',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 8,
  },
  dates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FacturationScreenSimple;