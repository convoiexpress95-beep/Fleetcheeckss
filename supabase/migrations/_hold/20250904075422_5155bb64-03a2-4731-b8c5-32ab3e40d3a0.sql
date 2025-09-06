-- Modifier la fonction consume_credit pour exempter les admins
CREATE OR REPLACE FUNCTION public.consume_credit(_user_id uuid, _mission_id uuid, _credits integer, _type text, _description text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Vérifier si l'utilisateur est admin
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  ) THEN
    -- Les admins ont accès illimité
    INSERT INTO public.credit_transactions (user_id, mission_id, credits_used, transaction_type, description)
    VALUES (_user_id, _mission_id, 0, _type, _description || ' (Accès admin illimité)');
    RETURN TRUE;
  END IF;
  
  -- Vérifier les crédits disponibles
  SELECT credits_remaining INTO current_credits
  FROM public.subscriptions
  WHERE user_id = _user_id AND status = 'active';
  
  -- Si pas d'abonnement ou pas assez de crédits (sauf pour illimité)
  IF current_credits IS NULL THEN
    -- Créer un abonnement découverte par défaut
    INSERT INTO public.subscriptions (user_id, plan_type, credits_remaining, credits_total)
    VALUES (_user_id, 'decouverte', 5, 5);
    current_credits := 5;
  END IF;
  
  -- Vérifier le plan illimité
  IF EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = _user_id AND plan_type = 'illimite' AND status = 'active'
  ) THEN
    -- Plan illimité, pas de décrément
    INSERT INTO public.credit_transactions (user_id, mission_id, credits_used, transaction_type, description)
    VALUES (_user_id, _mission_id, 0, _type, _description || ' (Plan illimité)');
    RETURN TRUE;
  END IF;
  
  -- Vérifier si assez de crédits
  IF current_credits < _credits THEN
    RETURN FALSE;
  END IF;
  
  -- Décrémenter les crédits
  UPDATE public.subscriptions
  SET credits_remaining = credits_remaining - _credits,
      updated_at = now()
  WHERE user_id = _user_id;
  
  -- Enregistrer la transaction
  INSERT INTO public.credit_transactions (user_id, mission_id, credits_used, transaction_type, description)
  VALUES (_user_id, _mission_id, _credits, _type, _description);
  
  RETURN TRUE;
END;
$function$