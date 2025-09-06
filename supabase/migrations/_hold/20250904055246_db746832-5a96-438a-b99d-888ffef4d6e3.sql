-- Table pour stocker les tokens de notification push
CREATE TABLE push_notification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  device_type text NOT NULL DEFAULT 'web',
  device_info jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- Policies pour les tokens de notification
CREATE POLICY "Users can manage their own push tokens" 
ON push_notification_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON push_notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour envoyer une notification push
CREATE OR REPLACE FUNCTION send_push_notification(
  _user_id uuid,
  _title text,
  _message text,
  _data jsonb DEFAULT '{}'
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tokens_count INTEGER;
BEGIN
  -- Compter les tokens actifs pour cet utilisateur
  SELECT COUNT(*) INTO tokens_count
  FROM push_notification_tokens
  WHERE user_id = _user_id AND is_active = true;
  
  -- Créer la notification dans la DB
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (_user_id, _title, _message, 'info');
  
  -- Retourner le résultat
  RETURN json_build_object(
    'success', true,
    'tokens_count', tokens_count,
    'message', 'Notification created'
  );
END;
$$;