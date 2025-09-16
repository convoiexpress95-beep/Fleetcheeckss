-- Créer les buckets de stockage nécessaires
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documents', 'documents', false),
  ('mission-photos', 'mission-photos', false),
  ('reports', 'reports', false),
  ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour les documents
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques pour les photos de missions
CREATE POLICY "Mission participants can view photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'mission-photos' AND 
  EXISTS (
    SELECT 1 FROM missions 
    WHERE id::text = (storage.foldername(name))[1] 
    AND (created_by = auth.uid() OR donor_id = auth.uid() OR driver_id = auth.uid())
  )
);

CREATE POLICY "Drivers can upload mission photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mission-photos' AND 
  EXISTS (
    SELECT 1 FROM missions 
    WHERE id::text = (storage.foldername(name))[1] 
    AND driver_id = auth.uid()
  )
);

-- Politiques pour les rapports
CREATE POLICY "Users can view their own reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques pour les factures
CREATE POLICY "Users can view their own invoices" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own invoices" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);