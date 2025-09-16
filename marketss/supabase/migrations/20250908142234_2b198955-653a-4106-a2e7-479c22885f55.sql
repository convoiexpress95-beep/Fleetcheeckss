-- Créer la table des messages pour la communication détaillée
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'devis', 'price_contest', 'system'
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS sur la table messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies pour les messages
CREATE POLICY "Users can read messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id 
    AND (c.owner_id = auth.uid() OR c.convoyeur_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id 
    AND (c.owner_id = auth.uid() OR c.convoyeur_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid());

-- Améliorer la table marketplace_devis pour les contestations de prix
ALTER TABLE public.marketplace_devis 
ADD COLUMN IF NOT EXISTS contested_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS contest_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS original_price NUMERIC NULL,
ADD COLUMN IF NOT EXISTS counter_offer NUMERIC NULL,
ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP WITH TIME ZONE NULL;

-- Fonction pour créer automatiquement une conversation lors d'un devis
CREATE OR REPLACE FUNCTION public.create_conversation_for_devis()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
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

-- Trigger pour créer automatiquement une conversation
CREATE TRIGGER create_conversation_on_devis
  AFTER INSERT ON public.marketplace_devis
  FOR EACH ROW
  EXECUTE FUNCTION public.create_conversation_for_devis();

-- Fonction pour mettre à jour le dernier message de la conversation
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
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

-- Trigger pour mettre à jour le dernier message
CREATE TRIGGER update_last_message_on_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_devis_mission_id ON public.marketplace_devis(mission_id);
CREATE INDEX IF NOT EXISTS idx_conversations_mission_id ON public.conversations(mission_id);