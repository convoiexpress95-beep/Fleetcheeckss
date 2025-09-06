-- Créer la table des informations légales de l'entreprise
CREATE TABLE public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  siret TEXT,
  vat_number TEXT,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'France',
  phone TEXT,
  email TEXT,
  legal_form TEXT,
  capital_amount DECIMAL,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table des clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  siret TEXT,
  vat_number TEXT,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'France',
  phone TEXT,
  email TEXT,
  is_company BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table des factures
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_terms TEXT DEFAULT 'Paiement à 30 jours',
  payment_method TEXT,
  notes TEXT,
  legal_mentions TEXT DEFAULT 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table des lignes de facture
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_ht DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table pour la numérotation séquentielle
CREATE TABLE public.invoice_sequence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix TEXT DEFAULT 'FAC',
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequence ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour company_info
CREATE POLICY "Users can manage their company info" ON public.company_info
FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour clients
CREATE POLICY "Users can manage their clients" ON public.clients
FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour invoices
CREATE POLICY "Users can manage their invoices" ON public.invoices
FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour invoice_items
CREATE POLICY "Users can manage their invoice items" ON public.invoice_items
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

-- Politiques RLS pour invoice_sequence
CREATE POLICY "Users can manage their invoice sequence" ON public.invoice_sequence
FOR ALL USING (auth.uid() = user_id);

-- Fonction pour générer le prochain numéro de facture
CREATE OR REPLACE FUNCTION public.generate_invoice_number(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year INTEGER;
  sequence_record RECORD;
  new_number INTEGER;
  invoice_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Récupérer ou créer la séquence pour l'utilisateur
  SELECT * INTO sequence_record 
  FROM invoice_sequence 
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    -- Créer une nouvelle séquence
    INSERT INTO invoice_sequence (user_id, current_number, year)
    VALUES (_user_id, 1, current_year)
    RETURNING * INTO sequence_record;
    new_number := 1;
  ELSE
    -- Vérifier si on change d'année
    IF sequence_record.year != current_year THEN
      -- Réinitialiser pour la nouvelle année
      UPDATE invoice_sequence 
      SET current_number = 1, year = current_year, updated_at = now()
      WHERE user_id = _user_id;
      new_number := 1;
    ELSE
      -- Incrémenter le numéro
      new_number := sequence_record.current_number + 1;
      UPDATE invoice_sequence 
      SET current_number = new_number, updated_at = now()
      WHERE user_id = _user_id;
    END IF;
  END IF;
  
  -- Format: FAC-2024-001
  invoice_number := sequence_record.prefix || '-' || current_year || '-' || LPAD(new_number::TEXT, 3, '0');
  
  RETURN invoice_number;
END;
$$;

-- Trigger pour recalculer les totaux des factures
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_total_ht DECIMAL(10,2);
  invoice_vat_amount DECIMAL(10,2);
  invoice_total_ttc DECIMAL(10,2);
BEGIN
  -- Calculer les totaux pour la facture
  SELECT 
    COALESCE(SUM(total_ht), 0),
    COALESCE(SUM(total_ht * vat_rate / 100), 0)
  INTO invoice_total_ht, invoice_vat_amount
  FROM invoice_items 
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  invoice_total_ttc := invoice_total_ht + invoice_vat_amount;
  
  -- Mettre à jour la facture
  UPDATE invoices 
  SET 
    subtotal_ht = invoice_total_ht,
    vat_amount = invoice_vat_amount,
    total_ttc = invoice_total_ttc,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer les triggers
CREATE TRIGGER trigger_update_invoice_totals_insert
  AFTER INSERT ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER trigger_update_invoice_totals_update
  AFTER UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER trigger_update_invoice_totals_delete
  AFTER DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Trigger pour calculer le total_ht automatiquement
CREATE OR REPLACE FUNCTION public.calculate_item_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total_ht := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calculate_item_total
  BEFORE INSERT OR UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_item_total();