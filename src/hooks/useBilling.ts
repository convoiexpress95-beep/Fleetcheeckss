import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';

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
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Charger les informations de l'entreprise
  const loadCompanyInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading company info:', error);
        return;
      }

      setCompanyInfo(data);
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  };

  // Sauvegarder les informations de l'entreprise
  const saveCompanyInfo = async (info: CompanyInfo) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('company_info')
        .upsert({
          ...info,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCompanyInfo(info);
      toast({
        title: "Informations sauvegardées",
        description: "Les informations de votre entreprise ont été mises à jour.",
      });
      return true;
    } catch (error) {
      console.error('Error saving company info:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les informations.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Valider un SIRET avec l'API INSEE
  const validateSiret = async (siret: string) => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-company-insee', {
        body: { siret }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.data;
    } catch (error) {
      console.error('Error validating SIRET:', error);
      toast({
        title: "Erreur de validation",
        description: error instanceof Error ? error.message : "Impossible de valider le SIRET",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Charger les clients
  const loadClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  // Sauvegarder un client
  const saveClient = async (client: Client) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const clientData = {
        ...client,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (client.id) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(clientData);
        if (error) throw error;
      }

      await loadClients();
      toast({
        title: "Client sauvegardé",
        description: "Les informations du client ont été mises à jour.",
      });
      return true;
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le client.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Charger les factures avec leurs lignes
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
      // Cast pour assurer la compatibilité des types
      setInvoices((data || []) as Invoice[]);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  // Charger les devis avec leurs lignes
  const loadQuotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(*),
          items:quote_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes((data || []) as unknown as Quote[]);
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
  };

  // Créer une nouvelle facture
  const createInvoice = async (invoiceData: Partial<Invoice>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      // Consommer un crédit pour créer une facture
      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_credit', {
          _user_id: user.id,
          _mission_id: null,
          _credits: 1,
          _type: 'invoice_creation',
          _description: 'Création d\'une facture'
        });

      if (creditError || !creditResult) {
        toast({
          title: "Crédits insuffisants",
          description: "Vous n'avez pas assez de crédits pour créer une facture.",
          variant: "destructive"
        });
        return false;
      }
      // Générer le numéro de facture
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc('generate_invoice_number', { _user_id: user.id });

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
          legal_mentions: invoiceData.legal_mentions || 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.',
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      await loadInvoices();
      toast({
        title: "Facture créée",
        description: `Facture ${invoiceNumber} créée avec succès.`,
      });
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Créer un devis (ne consomme pas de crédits)
  const createQuote = async (quoteData: Partial<Quote>) => {
    if (!user) return false;
    setLoading(true);
    try {
      // Générer le numéro de devis
      const { data: quoteNumber, error: numberError } = await supabase
        .rpc('generate_quote_number', { _user_id: user.id });
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
          payment_terms: quoteData.payment_terms,
          payment_method: quoteData.payment_method,
          notes: quoteData.notes,
          legal_mentions:
            quoteData.legal_mentions ||
            "Devis valable jusqu'à la date indiquée. Les prix sont exprimés HT et TTC. Travaux/prestations réalisés après acceptation et signature du devis.",
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      await loadQuotes();
      toast({ title: 'Devis créé', description: `Devis ${quoteNumber} créé avec succès.` });
  return (data as unknown) as Quote;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({ title: 'Erreur', description: "Impossible de créer le devis.", variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter des lignes à un devis
  const addQuoteItems = async (quoteId: string, items: QuoteItem[]) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quote_items')
        .insert(items.map((i) => ({ ...i, quote_id: quoteId })));
      if (error) throw error;
      await loadQuotes();
      toast({ title: 'Lignes ajoutées', description: 'Les lignes ont été ajoutées au devis.' });
      return true;
    } catch (error) {
      console.error('Error adding quote items:', error);
      toast({ title: 'Erreur', description: "Impossible d'ajouter les lignes au devis.", variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un devis
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
      toast({ title: 'Statut mis à jour', description: 'Le statut du devis a été mis à jour.' });
      return true;
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut du devis.', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Convertir un devis accepté en facture
  const convertQuoteToInvoice = async (quoteId: string) => {
    if (!user) return false;
    setLoading(true);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const computeDueDateFromTerms = (terms?: string) => {
      const base = new Date();
      if (!terms) return formatDate(base);
      const t = terms.toLowerCase();
      const days = t.includes('30') ? 30 : t.includes('15') ? 15 : 0;
      if (days > 0) {
        const due = new Date(base);
        due.setDate(due.getDate() + days);
        return formatDate(due);
      }
      return formatDate(base);
    };
    try {
      // Charger le devis avec ses lignes
      const { data: quote, error } = await supabase
        .from('quotes')
        .select(`*, items:quote_items(*), client:clients(*)`)
        .eq('id', quoteId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!quote) throw new Error('Devis introuvable');
      if (quote.status !== 'accepted') {
        toast({ title: 'Action impossible', description: 'Le devis doit être accepté pour être converti en facture.', variant: 'destructive' });
        return false;
      }

      // Créer la facture
      const created = await createInvoice({
        client_id: quote.client_id,
        invoice_date: formatDate(new Date()),
        due_date: computeDueDateFromTerms(quote.payment_terms),
        subtotal_ht: quote.subtotal_ht,
        vat_rate: quote.vat_rate ?? 20,
        vat_amount: quote.vat_amount,
        total_ttc: quote.total_ttc,
        payment_terms: quote.payment_terms || 'Paiement à 30 jours',
        payment_method: quote.payment_method,
        notes: quote.notes,
        legal_mentions:
          quote.legal_mentions ||
          'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.',
      });

      if (!created || !(created as any).id) {
        // createInvoice gère déjà les toasts (y compris crédits insuffisants)
        return false;
      }

      const newInvoice = created as Invoice;
      const items: InvoiceItem[] = ((quote.items || []) as QuoteItem[]).map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_ht: i.total_ht,
        vat_rate: i.vat_rate,
      }));
      if (items.length) {
        await addInvoiceItems(newInvoice.id!, items);
      }

      // Recharger listes
      await Promise.all([loadInvoices(), loadQuotes()]);
      toast({ title: 'Facture créée', description: 'La facture a été générée depuis le devis accepté.' });
      return newInvoice;
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      toast({ title: 'Erreur', description: "Impossible de convertir le devis en facture.", variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter des éléments à une facture
  const addInvoiceItems = async (invoiceId: string, items: InvoiceItem[]) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoice_items')
        .insert(
          items.map(item => ({
            ...item,
            invoice_id: invoiceId
          }))
        );

      if (error) throw error;

      await loadInvoices();
      toast({
        title: "Lignes ajoutées",
        description: "Les lignes ont été ajoutées à la facture.",
      });
      return true;
    } catch (error) {
      console.error('Error adding invoice items:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les lignes à la facture.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une facture
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
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la facture a été mis à jour.",
      });
      return true;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive"
      });
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
  }, [user]);

  return {
    loading,
    companyInfo,
    clients,
    invoices,
  quotes,
    saveCompanyInfo,
    validateSiret,
    saveClient,
    createInvoice,
    addInvoiceItems,
    updateInvoiceStatus,
  createQuote,
  addQuoteItems,
  updateQuoteStatus,
  convertQuoteToInvoice,
    loadClients,
  loadInvoices,
  loadQuotes
  };
};