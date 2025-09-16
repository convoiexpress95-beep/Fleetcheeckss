-- Unification des tables missions: usage unique de marketplace_missions
-- Ajout trigger de débit 1 crédit sur publication mission (atomicité côté DB)

-- 1. Migration des données depuis fleetmarket_missions vers marketplace_missions si nécessaire
DO $$
DECLARE
  fleet_exists boolean;
  market_exists boolean;
  fleet_count bigint;
  market_count bigint;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='fleetmarket_missions' AND table_schema='public') INTO fleet_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='marketplace_missions' AND table_schema='public') INTO market_exists;
  IF fleet_exists AND market_exists THEN
    EXECUTE 'SELECT count(*) FROM public.fleetmarket_missions' INTO fleet_count;
    EXECUTE 'SELECT count(*) FROM public.marketplace_missions' INTO market_count;
    IF fleet_count > 0 AND market_count = 0 THEN
      -- Copier colonnes compatibles
      EXECUTE $$INSERT INTO public.marketplace_missions (id, created_by, convoyeur_id, titre, description, ville_depart, ville_arrivee, date_depart, prix_propose, statut, vehicule_requis, contact_visible, created_at, updated_at)
               SELECT id, created_by, convoyeur_id, titre, description, ville_depart, ville_arrivee, date_depart, prix_propose, statut, vehicule_requis, contact_visible, created_at, updated_at
                 FROM public.fleetmarket_missions$$;
    END IF;
  END IF;
END $$;

-- 2. Remplacer fleetmarket_missions par une vue de compatibilité
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='fleetmarket_missions' AND table_schema='public') THEN
    EXECUTE 'DROP TABLE public.fleetmarket_missions CASCADE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name='fleetmarket_missions' AND table_schema='public') THEN
    EXECUTE 'CREATE VIEW public.fleetmarket_missions AS SELECT * FROM public.marketplace_missions';
  END IF;
END $$;

COMMENT ON VIEW public.fleetmarket_missions IS 'Vue de compatibilité après unification: utiliser marketplace_missions';

-- 3. Fonction de débit crédits avant insertion mission
CREATE OR REPLACE FUNCTION public._debit_credit_on_mission()
RETURNS trigger AS $$
DECLARE bal int; BEGIN
  -- S'assurer wallet présent
  SELECT balance INTO bal FROM credits_wallets WHERE user_id = NEW.created_by FOR UPDATE;
  IF bal IS NULL THEN
    -- créer wallet à 0 si absent
    INSERT INTO credits_wallets(user_id, balance) VALUES (NEW.created_by, 0) ON CONFLICT (user_id) DO NOTHING;
    bal := 0;
  END IF;
  IF bal < 1 THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;
  UPDATE credits_wallets SET balance = balance - 1, updated_at = now() WHERE user_id = NEW.created_by;
  INSERT INTO credits_ledger(user_id, amount, reason, ref_type, ref_id) VALUES (NEW.created_by, -1, 'mission_publish', 'mission', NEW.id);
  RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Trigger (id généré côté client ou Postgres; on suppose DEFAULT gen_random_uuid())
DROP TRIGGER IF EXISTS trg_debit_credit_on_mission ON public.marketplace_missions;
CREATE TRIGGER trg_debit_credit_on_mission
BEFORE INSERT ON public.marketplace_missions
FOR EACH ROW EXECUTE FUNCTION public._debit_credit_on_mission();

-- 5. Policy (optionnel: empêcher insert direct si pas connecté) - supposer RLS activé
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='marketplace_missions' AND policyname='allow_insert_authenticated') THEN
    EXECUTE 'CREATE POLICY allow_insert_authenticated ON public.marketplace_missions FOR INSERT TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- 6. Commentaires
COMMENT ON FUNCTION public._debit_credit_on_mission IS 'Débite 1 crédit du créateur lors de la publication d\'une mission.';
