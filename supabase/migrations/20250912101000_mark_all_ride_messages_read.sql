-- Marquer tous les messages de covoiturage non lus comme lus pour un utilisateur
CREATE OR REPLACE FUNCTION public.mark_all_ride_messages_read(p_user uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE inserted_count int; BEGIN
  INSERT INTO ride_message_reads(message_id, user_id, read_at)
  SELECT m.id, p_user, now()
  FROM ride_messages m
  WHERE m.sender_id <> p_user
    AND (
      EXISTS (SELECT 1 FROM rides r WHERE r.id = m.ride_id AND r.driver_id = p_user)
      OR EXISTS (SELECT 1 FROM ride_reservations rr WHERE rr.ride_id = m.ride_id AND rr.passenger_id = p_user)
    )
    AND NOT EXISTS (
      SELECT 1 FROM ride_message_reads r2 WHERE r2.message_id = m.id AND r2.user_id = p_user
    );
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END; $$;

COMMENT ON FUNCTION public.mark_all_ride_messages_read(uuid) IS 'Insère des lignes de lecture pour tous les messages non lus accessibles par cet utilisateur et retourne le nombre inséré.';
