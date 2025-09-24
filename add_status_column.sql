-- Requête SQL pour ajouter la colonne status si elle n'existe pas
DO $$
BEGIN
    -- Vérifier si la colonne status existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'missions' 
        AND column_name = 'status'
    ) THEN
        -- Ajouter la colonne status
        ALTER TABLE public.missions 
        ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;
        
        -- Ajouter l'index pour les performances
        CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions (status);
        
        RAISE NOTICE 'Colonne status ajoutée à la table missions';
    ELSE
        RAISE NOTICE 'Colonne status existe déjà';
    END IF;
END $$;