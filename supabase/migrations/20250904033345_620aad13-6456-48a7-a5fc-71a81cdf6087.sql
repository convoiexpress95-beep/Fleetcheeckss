-- Insert sample data with a placeholder user_id that will be replaced when users log in
-- We'll use a specific UUID for demo data that can be easily identified and updated later

-- Generate a demo user ID for sample data
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Insert sample clients with demo user_id
    INSERT INTO public.clients (user_id, company_name, first_name, last_name, email, phone, address, city, postal_code, country, is_company, siret, vat_number)
    VALUES 
      (
        demo_user_id,
        'Transport Express SARL',
        'Jean',
        'Dupont',
        'jean.dupont@transport-express.fr',
        '01.23.45.67.89',
        '123 rue de la Logistique',
        'Paris',
        '75001',
        'France',
        true,
        '12345678901234',
        'FR12345678901'
      ),
      (
        demo_user_id,
        NULL,
        'Marie',
        'Martin',
        'marie.martin@email.fr',
        '01.98.76.54.32',
        '456 avenue des Particuliers',
        'Lyon',
        '69001',
        'France',
        false,
        NULL,
        NULL
      )
    ON CONFLICT DO NOTHING;

    -- Insert sample missions with demo user_id
    INSERT INTO public.missions (
      created_by,
      donor_id,
      title,
      reference,
      description,
      pickup_address,
      delivery_address,
      pickup_date,
      delivery_date,
      pickup_contact_name,
      pickup_contact_phone,
      pickup_contact_email,
      delivery_contact_name,
      delivery_contact_phone,
      delivery_contact_email,
      vehicle_type,
      vehicle_brand,
      vehicle_model,
      license_plate,
      donor_earning,
      driver_earning,
      status
    )
    VALUES 
      (
        demo_user_id,
        demo_user_id,
        'Transport véhicule de collection',
        'REF-2025-001',
        'Transport d''une Porsche 911 de 1973 de Paris à Nice pour exposition',
        '123 rue de Rivoli, 75001 Paris',
        '456 Promenade des Anglais, 06000 Nice',
        '2025-01-15 09:00:00+01',
        '2025-01-16 17:00:00+01',
        'Jean Dupont',
        '01.23.45.67.89',
        'j.dupont@email.fr',
        'Marie Leclerc',
        '04.93.87.65.43',
        'm.leclerc@nice.fr',
        'Porte-voiture',
        'Iveco',
        'Daily',
        'AB-123-CD',
        800.00,
        600.00,
        'pending'
      ),
      (
        demo_user_id,
        demo_user_id,
        'Livraison urgente pièces détachées',
        'REF-2025-002',
        'Transport urgent de pièces détachées automobiles',
        '789 Zone Industrielle, 69100 Villeurbanne',
        '321 rue de l''Industrie, 13000 Marseille',
        '2025-01-10 08:00:00+01',
        '2025-01-10 18:00:00+01',
        'Pierre Garage',
        '04.78.12.34.56',
        'p.garage@auto.fr',
        'Sophie Mécaniques',
        '04.91.23.45.67',
        's.mecaniques@pieces.fr',
        'Fourgon',
        'Renault',
        'Master',
        'EF-456-GH',
        450.00,
        350.00,
        'completed'
      ),
      (
        demo_user_id,
        demo_user_id,
        'Déménagement partiel',
        'REF-2025-003',
        'Transport de mobilier et électroménager pour déménagement',
        '654 rue du Départ, 33000 Bordeaux',
        '987 avenue de l''Arrivée, 31000 Toulouse',
        '2025-01-20 10:00:00+01',
        '2025-01-20 16:00:00+01',
        'Laurent Déménage',
        '05.56.78.90.12',
        'l.demenage@email.fr',
        'Isabelle Nouvelleille',
        '05.61.34.56.78',
        'i.nouvelle@toulouse.fr',
        'Camion 20m³',
        'Mercedes',
        'Sprinter',
        'IJ-789-KL',
        600.00,
        500.00,
        'in_progress'
      )
    ON CONFLICT DO NOTHING;

    -- Insert analytics data for testing with demo user_id
    INSERT INTO public.analytics_data (
      user_id,
      date,
      missions_count,
      total_revenue,
      total_km,
      fuel_costs,
      vehicle_costs,
      other_costs,
      net_profit,
      avg_mission_value
    )
    VALUES 
      (
        demo_user_id,
        '2025-01-01',
        2,
        1200.00,
        850.5,
        120.00,
        80.00,
        50.00,
        950.00,
        600.00
      ),
      (
        demo_user_id,
        '2025-01-02',
        1,
        800.00,
        450.0,
        65.00,
        40.00,
        25.00,
        670.00,
        800.00
      ),
      (
        demo_user_id,
        '2025-01-03',
        3,
        1800.00,
        1200.0,
        180.00,
        120.00,
        75.00,
        1425.00,
        600.00
      )
    ON CONFLICT DO NOTHING;

    -- Insert sample company info with demo user_id
    INSERT INTO public.company_info (
      user_id,
      company_name,
      address,
      city,
      postal_code,
      country,
      phone,
      email,
      siret,
      vat_number,
      legal_form,
      capital_amount,
      website
    )
    VALUES (
      demo_user_id,
      'ConvoiExpress Pro',
      '15 Avenue des Transporteurs',
      'Paris',
      '75008',
      'France',
      '01.42.86.75.43',
      'contact@convoiexpress.fr',
      '12345678901234',
      'FR12345678901',
      'SARL',
      50000.00,
      'https://www.convoiexpress.fr'
    )
    ON CONFLICT DO NOTHING;

    -- Insert demo profiles entry
    INSERT INTO public.profiles (
      user_id,
      full_name,
      email,
      status,
      preferences
    )
    VALUES (
      demo_user_id,
      'Demo User',
      'demo@convoiexpress.fr',
      'active',
      '{}'::jsonb
    )
    ON CONFLICT DO NOTHING;
END $$;

-- Create a function to transfer demo data to actual user when they log in
CREATE OR REPLACE FUNCTION public.transfer_demo_data_to_user(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Only transfer if user doesn't already have data
    IF NOT EXISTS (SELECT 1 FROM clients WHERE user_id = _user_id) THEN
        -- Update demo data to belong to the actual user
        UPDATE clients SET user_id = _user_id WHERE user_id = demo_user_id;
        UPDATE missions SET created_by = _user_id, donor_id = _user_id WHERE created_by = demo_user_id;
        UPDATE analytics_data SET user_id = _user_id WHERE user_id = demo_user_id;
        UPDATE company_info SET user_id = _user_id WHERE user_id = demo_user_id;
        
        -- Delete demo profile
        DELETE FROM profiles WHERE user_id = demo_user_id;
    END IF;
END;
$$;