import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  mission_title: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  due_date: string;
  paid_at?: string;
}

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  valid_until: string;
}

interface PaymentStats {
  total_revenue: number;
  pending_amount: number;
  overdue_amount: number;
  this_month_revenue: number;
}

export const FacturationScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'quotes'>('dashboard');
  const [createInvoiceModalVisible, setCreateInvoiceModalVisible] = useState(false);
  const [createQuoteModalVisible, setCreateQuoteModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data - à remplacer par de vraies données depuis Supabase
  const [stats] = useState<PaymentStats>({
    total_revenue: 15480,
    pending_amount: 2350,
    overdue_amount: 890,
    this_month_revenue: 4250
  });

  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoice_number: 'FACT-2025-001',
      client_name: 'AutoLux Distribution',
      client_email: 'contact@autolux-distrib.fr',
      mission_title: 'Convoyage BMW X5 Paris → Lyon',
      amount: 200,
      tax_amount: 40,
      total_amount: 240,
      status: 'sent',
      created_at: '2025-09-15T10:00:00Z',
      due_date: '2025-09-30T00:00:00Z'
    },
    {
      id: '2',
      invoice_number: 'FACT-2025-002',
      client_name: 'FleetPro Services',
      client_email: 'billing@fleetpro.com',
      mission_title: 'Transport véhicules de société',
      amount: 150,
      tax_amount: 30,
      total_amount: 180,
      status: 'paid',
      created_at: '2025-09-10T14:30:00Z',
      due_date: '2025-09-25T00:00:00Z',
      paid_at: '2025-09-18T09:15:00Z'
    }
  ]);

  const [quotes] = useState<Quote[]>([
    {
      id: '1',
      quote_number: 'DEVIS-2025-001',
      client_name: 'Transport Express SARL',
      client_email: 'devis@transport-express.fr',
      description: 'Convoyage urgence Marseille → Nice',
      amount: 120,
      tax_amount: 24,
      total_amount: 144,
      status: 'pending',
      created_at: '2025-09-17T16:00:00Z',
      valid_until: '2025-09-24T23:59:59Z'
    }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    client_name: '',
    client_email: '',
    mission_title: '',
    amount: 0,
    tax_rate: 20 // 20% TVA par défaut
  });

  const [newQuote, setNewQuote] = useState({
    client_name: '',
    client_email: '',
    description: '',
    amount: 0,
    tax_rate: 20,
    valid_days: 15
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': case 'accepted': return '#10b981';
      case 'sent': case 'pending': return '#f59e0b';
      case 'overdue': case 'expired': return '#ef4444';
      case 'draft': case 'rejected': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string, type: 'invoice' | 'quote') => {
    if (type === 'invoice') {
      switch (status) {
        case 'draft': return 'Brouillon';
        case 'sent': return 'Envoyée';
        case 'paid': return 'Payée';
        case 'overdue': return 'En retard';
        default: return status;
      }
    } else {
      switch (status) {
        case 'pending': return 'En attente';
        case 'accepted': return 'Accepté';
        case 'rejected': return 'Rejeté';
        case 'expired': return 'Expiré';
        default: return status;
      }
    }
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.client_name || !newInvoice.mission_title || !newInvoice.amount) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Facture créée',
      text2: 'Votre facture a été générée avec succès'
    });
    
    setCreateInvoiceModalVisible(false);
    setNewInvoice({
      client_name: '',
      client_email: '',
      mission_title: '',
      amount: 0,
      tax_rate: 20
    });
  };

  const handleCreateQuote = () => {
    if (!newQuote.client_name || !newQuote.description || !newQuote.amount) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Devis créé',
      text2: 'Votre devis a été généré avec succès'
    });
    
    setCreateQuoteModalVisible(false);
    setNewQuote({
      client_name: '',
      client_email: '',
      description: '',
      amount: 0,
      tax_rate: 20,
      valid_days: 15
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    subtitle?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemNumber}>{invoice.invoice_number}</Text>
          <Text style={styles.itemClient}>{invoice.client_name}</Text>
        </View>
        <View style={styles.itemAmount}>
          <Text style={styles.amount}>{invoice.total_amount}€</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(invoice.status, 'invoice')}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.itemDescription}>{invoice.mission_title}</Text>
      
      <View style={styles.itemDetails}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            Créée le {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={styles.dateInfo}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={16} color="#2563eb" />
          <Text style={styles.actionText}>Voir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color="#2563eb" />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>
        {invoice.status === 'sent' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="checkmark-outline" size={16} color="#10b981" />
            <Text style={[styles.actionText, { color: '#10b981' }]}>Marquer payé</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const QuoteCard = ({ quote }: { quote: Quote }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemNumber}>{quote.quote_number}</Text>
          <Text style={styles.itemClient}>{quote.client_name}</Text>
        </View>
        <View style={styles.itemAmount}>
          <Text style={styles.amount}>{quote.total_amount}€</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(quote.status, 'quote')}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.itemDescription}>{quote.description}</Text>
      
      <View style={styles.itemDetails}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={styles.dateInfo}>
          <Ionicons name="hourglass-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            Valide jusqu'au {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={16} color="#2563eb" />
          <Text style={styles.actionText}>Voir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color="#2563eb" />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>
        {quote.status === 'accepted' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={16} color="#10b981" />
            <Text style={[styles.actionText, { color: '#10b981' }]}>Facturer</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({ title, tab, icon }: { 
    title: string; 
    tab: typeof activeTab; 
    icon: keyof typeof Ionicons.glyphMap 
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tab ? '#2563eb' : '#666'} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton title="Tableau de bord" tab="dashboard" icon="stats-chart-outline" />
        <TabButton title="Factures" tab="invoices" icon="document-text-outline" />
        <TabButton title="Devis" tab="quotes" icon="clipboard-outline" />
      </View>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Chiffre d'affaires total"
              value={`${stats.total_revenue}€`}
              icon="trending-up"
              color="#10b981"
            />
            <StatCard
              title="En attente de paiement"
              value={`${stats.pending_amount}€`}
              icon="hourglass-outline"
              color="#f59e0b"
            />
            <StatCard
              title="Factures en retard"
              value={`${stats.overdue_amount}€`}
              icon="warning-outline"
              color="#ef4444"
            />
            <StatCard
              title="Ce mois-ci"
              value={`${stats.this_month_revenue}€`}
              icon="calendar-outline"
              color="#2563eb"
            />
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => setCreateInvoiceModalVisible(true)}
              >
                <Ionicons name="document-text" size={32} color="#2563eb" />
                <Text style={styles.quickActionTitle}>Créer une facture</Text>
                <Text style={styles.quickActionSubtitle}>Facturer un client</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => setCreateQuoteModalVisible(true)}
              >
                <Ionicons name="clipboard" size={32} color="#10b981" />
                <Text style={styles.quickActionTitle}>Nouveau devis</Text>
                <Text style={styles.quickActionSubtitle}>Proposer un tarif</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Factures récentes</Text>
          {invoices.slice(0, 3).map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </ScrollView>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes factures</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setCreateInvoiceModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {invoices.map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </ScrollView>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes devis</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setCreateQuoteModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {quotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </ScrollView>
      )}

      {/* Create Invoice Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createInvoiceModalVisible}
        onRequestClose={() => setCreateInvoiceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle facture</Text>
              <TouchableOpacity onPress={() => setCreateInvoiceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du client *</Text>
                <TextInput
                  style={styles.input}
                  value={newInvoice.client_name}
                  onChangeText={(text: string) => setNewInvoice({...newInvoice, client_name: text})}
                  placeholder="Nom de l'entreprise ou personne"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email du client</Text>
                <TextInput
                  style={styles.input}
                  value={newInvoice.client_email}
                  onChangeText={(text: string) => setNewInvoice({...newInvoice, client_email: text})}
                  placeholder="email@client.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mission/Service *</Text>
                <TextInput
                  style={styles.input}
                  value={newInvoice.mission_title}
                  onChangeText={(text: string) => setNewInvoice({...newInvoice, mission_title: text})}
                  placeholder="Description du service facturé"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant HT (€) *</Text>
                <TextInput
                  style={styles.input}
                  value={newInvoice.amount.toString()}
                  onChangeText={(text: string) => setNewInvoice({...newInvoice, amount: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="Montant sans TVA"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Taux de TVA (%)</Text>
                <TextInput
                  style={styles.input}
                  value={newInvoice.tax_rate.toString()}
                  onChangeText={(text: string) => setNewInvoice({...newInvoice, tax_rate: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Récapitulatif</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Montant HT:</Text>
                  <Text style={styles.summaryValue}>{newInvoice.amount}€</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>TVA ({newInvoice.tax_rate}%):</Text>
                  <Text style={styles.summaryValue}>{(newInvoice.amount * newInvoice.tax_rate / 100).toFixed(2)}€</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total TTC:</Text>
                  <Text style={styles.summaryTotalValue}>{(newInvoice.amount * (1 + newInvoice.tax_rate / 100)).toFixed(2)}€</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCreateInvoiceModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleCreateInvoice}
              >
                <Text style={styles.submitButtonText}>Créer la facture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Quote Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createQuoteModalVisible}
        onRequestClose={() => setCreateQuoteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau devis</Text>
              <TouchableOpacity onPress={() => setCreateQuoteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du prospect *</Text>
                <TextInput
                  style={styles.input}
                  value={newQuote.client_name}
                  onChangeText={(text: string) => setNewQuote({...newQuote, client_name: text})}
                  placeholder="Nom de l'entreprise ou personne"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email du prospect</Text>
                <TextInput
                  style={styles.input}
                  value={newQuote.client_email}
                  onChangeText={(text: string) => setNewQuote({...newQuote, client_email: text})}
                  placeholder="email@prospect.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description du service *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newQuote.description}
                  onChangeText={(text: string) => setNewQuote({...newQuote, description: text})}
                  placeholder="Décrivez le service proposé..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant HT (€) *</Text>
                <TextInput
                  style={styles.input}
                  value={newQuote.amount.toString()}
                  onChangeText={(text: string) => setNewQuote({...newQuote, amount: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="Montant sans TVA"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Durée de validité (jours)</Text>
                <TextInput
                  style={styles.input}
                  value={newQuote.valid_days.toString()}
                  onChangeText={(text: string) => setNewQuote({...newQuote, valid_days: parseInt(text) || 15})}
                  keyboardType="numeric"
                  placeholder="15"
                />
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Récapitulatif</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Montant HT:</Text>
                  <Text style={styles.summaryValue}>{newQuote.amount}€</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>TVA ({newQuote.tax_rate}%):</Text>
                  <Text style={styles.summaryValue}>{(newQuote.amount * newQuote.tax_rate / 100).toFixed(2)}€</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total TTC:</Text>
                  <Text style={styles.summaryTotalValue}>{(newQuote.amount * (1 + newQuote.tax_rate / 100)).toFixed(2)}€</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCreateQuoteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleCreateQuote}
              >
                <Text style={styles.submitButtonText}>Créer le devis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 16,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemClient: {
    fontSize: 14,
    color: '#64748b',
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  itemDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  itemDetails: {
    marginBottom: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  summaryTotal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});