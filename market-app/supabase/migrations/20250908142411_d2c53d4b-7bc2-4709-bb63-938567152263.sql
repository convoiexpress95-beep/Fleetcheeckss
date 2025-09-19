-- Corriger les fonctions créées précédemment pour fixer les problèmes de sécurité
CREATE OR REPLACE FUNCTION public.create_conversation_for_devis()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  mission_owner UUID;
  conversation_exists BOOLEAN;
BEGIN
  -- Récupérer le propriétaire de la mission
  SELECT created_by INTO mission_owner 
  FROM public.marketplace_missions 
  WHERE id = NEW.mission_id;
  
  -- Vérifier si une conversation existe déjà
  SELECT EXISTS(
    SELECT 1 FROM public.conversations 
    WHERE mission_id = NEW.mission_id 
    AND ((owner_id = mission_owner AND convoyeur_id = NEW.convoyeur_id) 
         OR (owner_id = NEW.convoyeur_id AND convoyeur_id = mission_owner))
  ) INTO conversation_exists;
  
  -- Créer la conversation si elle n'existe pas
  IF NOT conversation_exists THEN
    INSERT INTO public.conversations (mission_id, owner_id, convoyeur_id)
    VALUES (NEW.mission_id, mission_owner, NEW.convoyeur_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message = NEW.content,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;