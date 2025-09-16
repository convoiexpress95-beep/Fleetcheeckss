-- Création de la table subscriptions pour gérer les crédits
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'decouverte',
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  credits_total INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy pour que les utilisateurs puissent voir leur propre abonnement
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy pour que les utilisateurs puissent créer leur abonnement
CREATE POLICY "Users can create their own subscription" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy pour que les utilisateurs puissent mettre à jour leur abonnement
CREATE POLICY "Users can update their own subscription" 
ON public.subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Création de la table pour les transactions de crédits
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NULL,
  credits_used INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy pour que les utilisateurs puissent voir leurs transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy pour insérer des transactions (via les fonctions)
CREATE POLICY "Allow insert transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour initialiser l'abonnement découverte (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION public.init_discovery_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, credits_remaining, credits_total)
  VALUES (NEW.id, 'decouverte', 5, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger pour les nouveaux utilisateurs (si il n'existe pas)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created_init_subscription') THEN
    CREATE TRIGGER on_profile_created_init_subscription
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.init_discovery_subscription();
  END IF;
END $$;