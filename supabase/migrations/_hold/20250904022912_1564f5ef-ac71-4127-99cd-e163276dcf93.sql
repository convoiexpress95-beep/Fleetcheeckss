-- Corriger les fonctions avec search_path mutable
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.calculate_item_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.total_ht := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;