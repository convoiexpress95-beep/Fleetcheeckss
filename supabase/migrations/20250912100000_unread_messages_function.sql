-- Fonction comptage des messages de covoiturage non lus pour un utilisateur
-- Calcule le nombre de messages où l'utilisateur est participant (driver ou passager)
-- sans en être l'expéditeur et sans enregistrement dans ride_message_reads

CREATE OR REPLACE FUNCTION public.count_unread_ride_messages(p_user uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT count(*)::int
  FROM ride_messages m
  WHERE m.sender_id <> p_user
    AND (
      EXISTS (SELECT 1 FROM rides r WHERE r.id = m.ride_id AND r.driver_id = p_user)
      OR EXISTS (SELECT 1 FROM ride_reservations rr WHERE rr.ride_id = m.ride_id AND rr.passenger_id = p_user)
    )
    AND NOT EXISTS (
      SELECT 1 FROM ride_message_reads r2
      WHERE r2.message_id = m.id AND r2.user_id = p_user
    );
$$;

COMMENT ON FUNCTION public.count_unread_ride_messages(uuid) IS 'Retourne le nombre de messages de covoiturage non lus pour un utilisateur.';
