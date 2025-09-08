-- Ajout des colonnes optionales pour la Marketplace sur la table missions
DO $$
BEGIN
	-- vehicle_image_path
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'vehicle_image_path'
	) THEN
		ALTER TABLE public.missions ADD COLUMN vehicle_image_path text NULL;
	END IF;

	-- vehicle_body_type (texte libre: berline, utilitaire, camion, ...)
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'vehicle_body_type'
	) THEN
		ALTER TABLE public.missions ADD COLUMN vehicle_body_type text NULL;
	END IF;

	-- kind (marketplace | inspection)
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'kind'
	) THEN
		ALTER TABLE public.missions ADD COLUMN kind text NULL;
	END IF;

	-- exigences booléennes
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'requirement_assurance_tous_risques'
	) THEN
		ALTER TABLE public.missions ADD COLUMN requirement_assurance_tous_risques boolean DEFAULT false;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'requirement_w_garage'
	) THEN
		ALTER TABLE public.missions ADD COLUMN requirement_w_garage boolean DEFAULT false;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'requirement_transporteur_plateau'
	) THEN
		ALTER TABLE public.missions ADD COLUMN requirement_transporteur_plateau boolean DEFAULT false;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'requirement_porte_10'
	) THEN
		ALTER TABLE public.missions ADD COLUMN requirement_porte_10 boolean DEFAULT false;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'requirement_convoyeur'
	) THEN
		ALTER TABLE public.missions ADD COLUMN requirement_convoyeur boolean DEFAULT false;
	END IF;

	-- index utiles
	IF NOT EXISTS (
		SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'missions_kind_idx'
	) THEN
		CREATE INDEX missions_kind_idx ON public.missions (kind);
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'missions_vehicle_body_type_idx'
	) THEN
		CREATE INDEX missions_vehicle_body_type_idx ON public.missions (vehicle_body_type);
	END IF;
END $$;

