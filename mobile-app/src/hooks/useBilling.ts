import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import type { Database } from '../config/types.extended';

export interface CompanyInfo {
  id?: string;
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
  capital_amount?: number;
  website?: string;
  logo_url?: string;
}

export interface Client {
  id?: string;
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
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_ht: number;
  vat_rate: number;
}

export interface Invoice {
  id?: string;
  client_id: string;
  client?: Client;
  invoice_number?: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal_ht: number;
  vat_rate: number;
  vat_amount: number;
  total_ttc: number;
  payment_terms: string;
  payment_method?: string;
  notes?: string;
  legal_mentions: string;
  items?: InvoiceItem[];
}

// Devis (quotes)
export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_ht: number;
  vat_rate: number;
}

export interface Quote {
  id?: string;
  client_id: string;
  client?: Client;
  quote_number?: string;
  quote_date: string;
  validity_date: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  subtotal_ht: number;
  vat_rate: number;
  vat_amount: number;
  total_ttc: number;
  payment_terms?: string;
  payment_method?: string;
  notes?: string;
  legal_mentions?: string;
  items?: QuoteItem[];
}

export const useBilling = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const toast = (title: string, description?: string, type: 'success' | 'error' = 'success') => {
    Toast.show({
      type: type === 'success' ? 'success' : 'error',
      text1: title,
      text2: description,
    });
  };

  // Charger les informations de l'entreprise
  const loadCompanyInfo = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && (error as any).code !== 'PGRST116') {
        console.error('Error loading company info:', error);
        return;
      }
      setCompanyInfo(data as CompanyInfo | null);
    } catch (e) {
      console.error('Error loading company info:', e);
    }
  };

  // Sauvegarder les informations de l'entreprise
  const saveCompanyInfo = async (info: CompanyInfo) => {
    if (!user) return false;
    setLoading(true);
    try {
      const payload = {
        ...info,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      } as any;

      const { error } = await supabase.from('company_info').upsert(payload);
      if (error) throw error;

      setCompanyInfo(info);
      toast('Informations sauvegardées', "Les informations de votre entreprise ont été mises à jour.");
      return true;
    } catch (e) {
      console.error('Error saving company info:', e);
      toast('Erreur', "Impossible de sauvegarder les informations.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Valider un SIRET via Edge Function
  const validateSiret = async (siret: string) => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-company-insee', {
        body: { siret },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Validation INSEE échouée');
      return data.data as CompanyInfo;
    } catch (e: any) {
      console.error('Error validating SIRET:', e);
      toast('Erreur de validation', e?.message || 'Impossible de valider le SIRET', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clients
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
      console.error('Error loading clients:', e);
    }
  };

  const saveClient = async (client: Client) => {
    if (!user) return false;
    setLoading(true);
    try {
      const clientData: any = {
        ...client,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      if (client.id) {
        const { error } = await supabase.from('clients').update(clientData).eq('id', client.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clients').insert(clientData);
        if (error) throw error;
      }
      await loadClients();
      toast('Client sauvegardé', 'Les informations du client ont été mises à jour.');
      return true;
    } catch (e) {
      console.error('Error saving client:', e);
      toast('Erreur', "Impossible de sauvegarder le client.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Factures
  const loadInvoices = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`*, client:clients(*), items:invoice_items(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data || []) as Invoice[]);
    } catch (e) {
      console.error('Error loading invoices:', e);
    }
  };

  // Devis
  const loadQuotes = async () => {
    if (!user) return;
    try {
  const { data, error } = await supabase
        .from('quotes')
        .select(`*, client:clients(*), items:quote_items(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
  setQuotes(((data || []) as unknown) as Quote[]);
    } catch (e) {
      console.error('Error loading quotes:', e);
    }
  };

  const createQuote = async (quoteData: Partial<Quote>) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { data: quoteNumber, error: numberError } = await supabase.rpc('generate_quote_number', { _user_id: user.id });
      if (numberError) throw numberError;
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          client_id: quoteData.client_id!,
          user_id: user.id,
          quote_number: quoteNumber,
          quote_date: quoteData.quote_date || new Date().toISOString().split('T')[0],
          validity_date: quoteData.validity_date!,
          subtotal_ht: quoteData.subtotal_ht || 0,
          vat_rate: quoteData.vat_rate ?? 20,
          vat_amount: quoteData.vat_amount || 0,
          total_ttc: quoteData.total_ttc || 0,
          payment_terms: quoteData.payment_terms || 'Paiement à réception',
          payment_method: quoteData.payment_method,
          notes: quoteData.notes,
          legal_mentions: quoteData.legal_mentions || "Devis valable jusqu'à la date indiquée. Prestations exécutées après acceptation du devis.",
          status: 'draft',
        })
        .select()
        .single();
      if (error) throw error;
      await loadQuotes();
      toast('Devis créé', `Devis ${quoteNumber} créé avec succès.`);
      return data as Quote;
    } catch (e) {
      console.error('Error creating quote:', e);
      toast('Erreur', "Impossible de créer le devis.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addQuoteItems = async (quoteId: string, items: QuoteItem[]) => {
    if (!user) return false;
    setLoading(true);
    try {
      const payload = items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_ht: i.total_ht,
        vat_rate: i.vat_rate,
        quote_id: quoteId,
      }));
      const { error } = await supabase
        .from('quote_items')
        .insert(payload as Database['public']['Tables']['quote_items']['Insert'][]);
      if (error) throw error;
      await loadQuotes();
      toast('Lignes ajoutées', 'Les lignes ont été ajoutées au devis.');
      return true;
    } catch (e) {
      console.error('Error adding quote items:', e);
      toast('Erreur', "Impossible d'ajouter les lignes au devis.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: Quote['status']) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', quoteId);
      if (error) throw error;
      await loadQuotes();
      toast('Statut mis à jour', 'Le statut du devis a été mis à jour.');
      return true;
    } catch (e) {
      console.error('Error updating quote status:', e);
      toast('Erreur', "Impossible de mettre à jour le statut du devis.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Partial<Invoice>) => {
    if (!user) return false;
    setLoading(true);
    try {
      // Numéro de facture
      const { data: invoiceNumber, error: numberError } = await supabase.rpc('generate_invoice_number', {
        _user_id: user.id,
      });
      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          client_id: invoiceData.client_id!,
          user_id: user.id,
          invoice_number: invoiceNumber,
          invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
          due_date: invoiceData.due_date!,
          subtotal_ht: invoiceData.subtotal_ht || 0,
          vat_rate: invoiceData.vat_rate || 20,
          vat_amount: invoiceData.vat_amount || 0,
          total_ttc: invoiceData.total_ttc || 0,
          payment_terms: invoiceData.payment_terms || 'Paiement à 30 jours',
          payment_method: invoiceData.payment_method,
          notes: invoiceData.notes,
          legal_mentions:
            invoiceData.legal_mentions ||
            "En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.",
          status: 'draft',
        })
        .select()
        .single();
      if (error) throw error;

      await loadInvoices();
      toast('Facture créée', `Facture ${invoiceNumber} créée avec succès.`);
      return data as Invoice;
    } catch (e) {
      console.error('Error creating invoice:', e);
      toast('Erreur', "Impossible de créer la facture.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Convertir un devis accepté en facture
  const convertQuoteToInvoice = async (quoteId: string) => {
    if (!user) return false;
    setLoading(true);
    try {
      // Récupérer le devis avec client et lignes
      const { data: quote, error: qErr } = await supabase
        .from('quotes')
        .select(`*, client:clients(*), items:quote_items(*)`)
        .eq('user_id', user.id)
        .eq('id', quoteId)
        .single();
      if (qErr) throw qErr;
      if (!quote) throw new Error('Devis introuvable');

      // Créer la facture correspondante (échéance +30 jours par défaut)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const newInvoice = await createInvoice({
        client_id: (quote as any).client_id,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        subtotal_ht: (quote as any).subtotal_ht || 0,
        vat_rate: (quote as any).vat_rate ?? 20,
        vat_amount: (quote as any).vat_amount || 0,
        total_ttc: (quote as any).total_ttc || 0,
        payment_terms: (quote as any).payment_terms || 'Paiement à 30 jours',
        payment_method: (quote as any).payment_method,
        notes: (quote as any).notes,
        legal_mentions:
          (quote as any).legal_mentions ||
          "En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.",
        status: 'draft',
      });
      if (!newInvoice || (newInvoice as any) === false) throw new Error("Erreur lors de la création de la facture");

      // Ajouter les lignes du devis à la facture
      const items = ((quote as any).items || []).map((i: any) => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_ht: i.total_ht,
        vat_rate: i.vat_rate,
      }));
      const invId = (newInvoice as any).id as string;
      if (items.length > 0) {
        await addInvoiceItems(invId, items);
      }

      // Mettre à jour le statut du devis en 'accepted'
      await updateQuoteStatus(quoteId, 'accepted');

      await loadInvoices();
      await loadQuotes();
      toast('Conversion réussie', 'Le devis a été converti en facture.');
      return true;
    } catch (e) {
      console.error('Error converting quote to invoice:', e);
      toast('Erreur', "Impossible de convertir le devis en facture.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addInvoiceItems = async (invoiceId: string, items: InvoiceItem[]) => {
    if (!user) return false;
    setLoading(true);
    try {
      const payload = items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_ht: i.total_ht,
        vat_rate: i.vat_rate,
        invoice_id: invoiceId,
      }));
      const { error } = await supabase
        .from('invoice_items')
        .insert(payload as Database['public']['Tables']['invoice_items']['Insert'][]);
      if (error) throw error;
      await loadInvoices();
      toast('Lignes ajoutées', 'Les lignes ont été ajoutées à la facture.');
      return true;
    } catch (e) {
      console.error('Error adding invoice items:', e);
      toast('Erreur', "Impossible d'ajouter les lignes à la facture.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invoiceId);
      if (error) throw error;
      await loadInvoices();
      toast('Statut mis à jour', 'Le statut de la facture a été mis à jour.');
      return true;
    } catch (e) {
      console.error('Error updating invoice status:', e);
      toast('Erreur', "Impossible de mettre à jour le statut.", 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCompanyInfo();
      loadClients();
      loadInvoices();
  loadQuotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    loading,
    companyInfo,
    clients,
    invoices,
  quotes,
    // actions
    loadCompanyInfo,
    saveCompanyInfo,
    validateSiret,
    loadClients,
    saveClient,
    loadInvoices,
  loadQuotes,
    createInvoice,
    addInvoiceItems,
    updateInvoiceStatus,
  createQuote,
  addQuoteItems,
  updateQuoteStatus,
  convertQuoteToInvoice,
  };
};

export type { CompanyInfo as TCompanyInfo, Client as TClient, Invoice as TInvoice, InvoiceItem as TInvoiceItem, Quote as TQuote, QuoteItem as TQuoteItem };
