import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

export const useBilling = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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
    }
  }, [user]);

  return {
    loading,
    companyInfo,
    clients,
    invoices,
    saveCompanyInfo,
    validateSiret,
    saveClient,
    createInvoice,
    addInvoiceItems,
    updateInvoiceStatus,
    loadClients,
    loadInvoices
  };
};