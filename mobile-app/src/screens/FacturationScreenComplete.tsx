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

const FacturationScreenComplete = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'clients' | 'settings'>('dashboard');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  
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
              👥 Clients ({mockClients.length})
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
                {mockInvoices.slice(0, 3).map((invoice) => (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceHeader}>
                      <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                      </View>
                    </View>
                    <Text style={styles.clientName}>{getClientName(invoice.client)}</Text>
                    <Text style={styles.serviceDescription}>{invoice.items[0]?.description}</Text>
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
                {mockInvoices.map((invoice) => (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceHeader}>
                      <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                      </View>
                    </View>
                    <Text style={styles.clientName}>{getClientName(invoice.client)}</Text>
                    <Text style={styles.serviceDescription}>{invoice.items[0]?.description}</Text>
                    
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
                {mockClients.map((client) => (
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
              
              <TouchableOpacity style={styles.saveButton} onPress={() => {
                Alert.alert('Sauvegarde', 'Informations de l\'entreprise sauvegardées');
                setShowCompanyModal(false);
              }}>
                <Text style={styles.saveButtonText}>💾 Sauvegarder</Text>
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
                  <Switch value={false} />
                  <Text style={styles.switchText}>🏢 Entreprise</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.saveButton} onPress={() => {
                Alert.alert('Création', 'Nouveau client créé avec succès');
                setShowClientModal(false);
              }}>
                <Text style={styles.saveButtonText}>💾 Créer le client</Text>
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
});

export default FacturationScreenComplete;