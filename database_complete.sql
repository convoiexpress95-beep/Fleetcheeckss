-- Script SQL complet pour recréer la base de données FleetCheck
-- Ce script contient toutes les tables, fonctions, politiques RLS et données nécessaires
-- Pour l'application mobile et web

-- =============================================================================
-- 1. SUPPRESSION ET NETTOYAGE (si nécessaire)
-- =============================================================================

-- Supprimer les tables existantes en cascade
DROP TABLE IF EXISTS public.ride_message_reads CASCADE;
DROP TABLE IF EXISTS public.ride_messages CASCADE;
DROP TABLE IF EXISTS public.ride_reservations CASCADE;
DROP TABLE IF EXISTS public.shared_rides CASCADE;
DROP TABLE IF EXISTS public.user_reviews CASCADE;
DROP TABLE IF EXISTS public.mission_applications CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.vehicle_models CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.push_notification_tokens CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;

-- Supprimer les types enum existants
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.mission_status_extended CASCADE;
DROP TYPE IF EXISTS public.contact_status CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.wallet_transaction_type CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.upsert_profile CASCADE;
DROP FUNCTION IF EXISTS public.generate_mission_summary CASCADE;
DROP FUNCTION IF EXISTS public.get_contacts_with_stats CASCADE;

-- =============================================================================
-- 2. CRÉATION DES TYPES ENUM
-- =============================================================================

-- Rôles d'application
CREATE TYPE public.app_role AS ENUM ('admin', 'donneur_d_ordre', 'convoyeur');

-- Statuts de mission étendus
CREATE TYPE public.mission_status_extended AS ENUM (
    'draft', 'published', 'assigned', 'picked_up', 'in_transit', 
    'delivered', 'completed', 'cancelled', 'pending', 'in_progress'
);

-- Statuts de contact
CREATE TYPE public.contact_status AS ENUM ('pending', 'accepted', 'rejected');

-- Types de notification
CREATE TYPE public.notification_type AS ENUM ('mission', 'message', 'system', 'payment');

-- Types de transaction wallet
CREATE TYPE public.wallet_transaction_type AS ENUM ('credit', 'debit', 'transfer', 'payment', 'refund');

-- =============================================================================
-- 3. CRÉATION DES TABLES PRINCIPALES
-- =============================================================================

-- Table des profils utilisateur
CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    avatar_url text,
    display_name text,
    bio text,
    location text,
    app_role public.app_role DEFAULT 'convoyeur',
    is_verified boolean DEFAULT false,
    is_premium boolean DEFAULT false,
    credits integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table des contacts
CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    invited_user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    invited_email text,
    status public.contact_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, invited_user_id),
    UNIQUE(user_id, invited_email)
);

-- Table des modèles de véhicules
CREATE TABLE public.vehicle_models (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    make text NOT NULL,
    model text NOT NULL,
    body_type text NOT NULL,
    generation text,
    image_path text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(make, model, generation)
);

-- Table des missions
CREATE TABLE public.missions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reference text UNIQUE NOT NULL,
    title text NOT NULL,
    description text,
    
    -- Adresses et contacts
    pickup_address text NOT NULL,
    delivery_address text NOT NULL,
    pickup_date timestamptz NOT NULL,
    delivery_date timestamptz,
    pickup_contact_name text,
    pickup_contact_phone text,
    pickup_contact_email text,
    delivery_contact_name text,
    delivery_contact_phone text,
    delivery_contact_email text,
    
    -- Véhicule
    vehicle_type text,
    vehicle_brand text,
    vehicle_model text,
    vehicle_model_name text,
    vehicle_body_type text,
    vehicle_model_id uuid REFERENCES public.vehicle_models(id),
    vehicle_image_path text,
    license_plate text NOT NULL,
    
    -- Finances
    donor_earning decimal(10,2),
    driver_earning decimal(10,2),
    
    -- Statut et workflow
    status public.mission_status_extended DEFAULT 'pending',
    status_original text,
    
    -- Acteurs
    created_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    donor_id uuid REFERENCES public.profiles(user_id),
    driver_id uuid REFERENCES public.profiles(user_id),
    
    -- Exigences
    requirement_convoyeur boolean DEFAULT false,
    requirement_transporteur_plateau boolean DEFAULT false,
    
    -- Métadonnées
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table des candidatures de mission
CREATE TABLE public.mission_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    applicant_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    message text,
    proposed_price decimal(10,2),
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(mission_id, applicant_id)
);

-- Table des devis
CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    provider_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    amount decimal(10,2) NOT NULL,
    description text,
    status text DEFAULT 'pending',
    valid_until timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table du portefeuille
CREATE TABLE public.wallets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    balance decimal(10,2) DEFAULT 0,
    total_earned decimal(10,2) DEFAULT 0,
    total_spent decimal(10,2) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table des trajets partagés (covoiturage)
CREATE TABLE public.shared_rides (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    departure_city text NOT NULL,
    arrival_city text NOT NULL,
    departure_time timestamptz NOT NULL,
    available_seats integer NOT NULL CHECK (available_seats > 0),
    price_per_seat decimal(10,2) NOT NULL,
    description text,
    vehicle_info text,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table des réservations de trajets
CREATE TABLE public.ride_reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ride_id uuid NOT NULL REFERENCES public.shared_rides(id) ON DELETE CASCADE,
    passenger_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    seats_reserved integer NOT NULL CHECK (seats_reserved > 0),
    total_price decimal(10,2) NOT NULL,
    status text DEFAULT 'pending',
    message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(ride_id, passenger_id)
);

-- Table des messages de trajet
CREATE TABLE public.ride_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ride_id uuid NOT NULL REFERENCES public.shared_rides(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Table des lectures de messages
CREATE TABLE public.ride_message_reads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.ride_messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    read_at timestamptz DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Table des avis utilisateur
CREATE TABLE public.user_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    reviewed_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    ride_id uuid REFERENCES public.shared_rides(id) ON DELETE SET NULL,
    mission_id uuid REFERENCES public.missions(id) ON DELETE SET NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(reviewer_id, reviewed_id, ride_id),
    UNIQUE(reviewer_id, reviewed_id, mission_id)
);

-- Table des tokens de notification push
CREATE TABLE public.push_notification_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    token text NOT NULL,
    platform text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, token)
);

-- Table des paramètres admin
CREATE TABLE public.admin_settings (
    id integer PRIMARY KEY DEFAULT 1,
    maintenance_enabled boolean DEFAULT false,
    maintenance_message text,
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    max_login_attempts integer DEFAULT 5,
    session_duration integer DEFAULT 86400,
    two_factor_auth boolean DEFAULT false,
    smtp_server text,
    smtp_port integer DEFAULT 587,
    sender_email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT single_admin_settings CHECK (id = 1)
);

-- =============================================================================
-- 4. CRÉATION DES INDEX POUR LA PERFORMANCE
-- =============================================================================

-- Index sur les profils
CREATE INDEX idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_app_role ON public.profiles (app_role);

-- Index sur les contacts
CREATE INDEX idx_contacts_user_id ON public.contacts (user_id);
CREATE INDEX idx_contacts_invited_user_id ON public.contacts (invited_user_id);
CREATE INDEX idx_contacts_status ON public.contacts (status);

-- Index sur les missions
CREATE INDEX idx_missions_created_by ON public.missions (created_by);
CREATE INDEX idx_missions_donor_id ON public.missions (donor_id);
CREATE INDEX idx_missions_driver_id ON public.missions (driver_id);
CREATE INDEX idx_missions_status ON public.missions (status);
CREATE INDEX idx_missions_reference ON public.missions (reference);
CREATE INDEX idx_missions_pickup_date ON public.missions (pickup_date);
CREATE INDEX idx_missions_vehicle_model_id ON public.missions (vehicle_model_id);

-- Index sur les trajets partagés
CREATE INDEX idx_shared_rides_driver_id ON public.shared_rides (driver_id);
CREATE INDEX idx_shared_rides_departure_time ON public.shared_rides (departure_time);
CREATE INDEX idx_shared_rides_departure_city ON public.shared_rides (departure_city);
CREATE INDEX idx_shared_rides_arrival_city ON public.shared_rides (arrival_city);
CREATE INDEX idx_shared_rides_status ON public.shared_rides (status);

-- Index sur les réservations
CREATE INDEX idx_ride_reservations_ride_id ON public.ride_reservations (ride_id);
CREATE INDEX idx_ride_reservations_passenger_id ON public.ride_reservations (passenger_id);

-- Index sur les messages
CREATE INDEX idx_ride_messages_ride_id ON public.ride_messages (ride_id);
CREATE INDEX idx_ride_messages_sender_id ON public.ride_messages (sender_id);
CREATE INDEX idx_ride_messages_created_at ON public.ride_messages (created_at);

-- Index sur les portefeuilles
CREATE INDEX idx_wallets_user_id ON public.wallets (user_id);

-- =============================================================================
-- 5. ACTIVATION DE RLS (ROW LEVEL SECURITY)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. POLITIQUES RLS POUR LES PROFILS
-- =============================================================================

-- Lecture: Tous peuvent voir tous les profils
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (true);

-- Insertion: Utilisateur ne peut créer que son propre profil
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour: Utilisateur ne peut modifier que son propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Suppression: Pas de suppression directe
CREATE POLICY "profiles_no_delete" ON public.profiles
    FOR DELETE USING (false);

-- =============================================================================
-- 7. POLITIQUES RLS POUR LES MISSIONS
-- =============================================================================

-- Lecture: Tous les utilisateurs authentifiés peuvent voir toutes les missions
CREATE POLICY "missions_select_all" ON public.missions
    FOR SELECT TO authenticated USING (true);

-- Insertion: Utilisateur authentifié peut créer des missions
CREATE POLICY "missions_insert_auth" ON public.missions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Mise à jour: Créateur peut modifier sa mission
CREATE POLICY "missions_update_creator" ON public.missions
    FOR UPDATE TO authenticated 
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Suppression: Créateur peut supprimer sa mission
CREATE POLICY "missions_delete_creator" ON public.missions
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- =============================================================================
-- 8. POLITIQUES RLS POUR LES AUTRES TABLES
-- =============================================================================

-- Contacts: Voir ses propres contacts et ceux où on est invité
CREATE POLICY "contacts_select_own" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = invited_user_id);

CREATE POLICY "contacts_insert_own" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_update_own" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = invited_user_id);

-- Trajets partagés: Lecture libre, modification par le conducteur
CREATE POLICY "shared_rides_select_all" ON public.shared_rides
    FOR SELECT USING (true);

CREATE POLICY "shared_rides_insert_own" ON public.shared_rides
    FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "shared_rides_update_own" ON public.shared_rides
    FOR UPDATE USING (auth.uid() = driver_id);

-- Réservations: Voir ses propres réservations et celles de ses trajets
CREATE POLICY "reservations_select_own" ON public.ride_reservations
    FOR SELECT USING (
        auth.uid() = passenger_id OR 
        auth.uid() IN (SELECT driver_id FROM public.shared_rides WHERE id = ride_id)
    );

CREATE POLICY "reservations_insert_own" ON public.ride_reservations
    FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- Portefeuilles: Chacun voit le sien
CREATE POLICY "wallets_select_own" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_update_own" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- 9. FONCTIONS RPC IMPORTANTES
-- =============================================================================

-- Fonction pour upsert de profil sécurisé
CREATE OR REPLACE FUNCTION public.upsert_profile(
    _user_id uuid, 
    _email text, 
    _full_name text,
    _phone text DEFAULT NULL,
    _avatar_url text DEFAULT NULL,
    _display_name text DEFAULT NULL,
    _bio text DEFAULT NULL,
    _location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_id uuid;
BEGIN
    -- Vérifier que l'utilisateur est autorisé
    IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
        RAISE EXCEPTION 'Non autorisé à modifier ce profil';
    END IF;

    INSERT INTO profiles (
        user_id, email, full_name, phone, avatar_url, 
        display_name, bio, location, created_at, updated_at
    ) VALUES (
        _user_id, _email, _full_name, _phone, _avatar_url,
        _display_name, _bio, _location, now(), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, profiles.email),
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        bio = COALESCE(EXCLUDED.bio, profiles.bio),
        location = COALESCE(EXCLUDED.location, profiles.location),
        updated_at = now()
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$;

-- Fonction pour obtenir les contacts avec statistiques
CREATE OR REPLACE FUNCTION public.get_contacts_with_stats(_user_id uuid)
RETURNS TABLE(
    contact_id uuid,
    contact_name text,
    contact_email text,
    contact_phone text,
    status text,
    missions_count bigint,
    last_mission_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as contact_id,
        p.full_name as contact_name,
        p.email as contact_email,
        p.phone as contact_phone,
        c.status::text,
        COALESCE(COUNT(m.id), 0) as missions_count,
        MAX(m.created_at) as last_mission_date
    FROM profiles p
    JOIN contacts c ON (c.invited_user_id = p.user_id)
    LEFT JOIN missions m ON (m.created_by = p.user_id OR m.driver_id = p.user_id)
    WHERE c.user_id = _user_id AND c.status = 'accepted'
    GROUP BY p.id, p.full_name, p.email, p.phone, c.status
    ORDER BY last_mission_date DESC NULLS LAST;
END;
$$;

-- =============================================================================
-- 10. TRIGGERS POUR LA MISE À JOUR AUTOMATIQUE
-- =============================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER missions_updated_at BEFORE UPDATE ON public.missions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER shared_rides_updated_at BEFORE UPDATE ON public.shared_rides
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 11. DONNÉES DE DÉMONSTRATION
-- =============================================================================

-- Quelques modèles de véhicules
INSERT INTO public.vehicle_models (make, model, body_type, generation) VALUES
('BMW', 'X5', 'SUV', '2019-2023'),
('Mercedes', 'Sprinter', 'Utilitaire', '2018-2023'),
('Renault', 'Master', 'Utilitaire', '2019-2023'),
('Peugeot', '308', 'Berline', '2021-2023'),
('Volkswagen', 'Crafter', 'Utilitaire', '2017-2023'),
('Ford', 'Transit', 'Utilitaire', '2020-2023');

-- Paramètres admin par défaut
INSERT INTO public.admin_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 12. PERMISSIONS FINALES
-- =============================================================================

-- Permissions pour les utilisateurs authentifiés
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permissions pour les utilisateurs anonymes (lecture seule sur certaines tables)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.vehicle_models TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_profile TO anon;

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================

-- Commentaires de documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateur avec informations étendues';
COMMENT ON TABLE public.missions IS 'Missions de transport avec détails complets';
COMMENT ON TABLE public.shared_rides IS 'Trajets partagés pour covoiturage';
COMMENT ON TABLE public.wallets IS 'Portefeuilles utilisateur pour gestion des crédits';
COMMENT ON FUNCTION public.upsert_profile IS 'Création/mise à jour sécurisée des profils';

-- Affichage de confirmation
SELECT 'Base de données FleetCheck créée avec succès!' as message;
SELECT 'Tables créées: ' || count(*) || ' tables' as tables_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';