-- Correction des failles de sécurité critiques

-- 1. SUPPRIMER la politique dangereuse qui expose toutes les missions
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir toutes les missions" ON public.missions;

-- 2. CORRIGER les politiques de notifications - restreindre les insertions
DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;

-- Créer une politique plus restrictive pour les notifications
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Seuls les admins ou le système peuvent créer des notifications
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR 
  -- Ou l'utilisateur crée une notification pour lui-même (auto-notification)
  user_id = auth.uid()
);

-- 3. CORRIGER les politiques de credit_transactions - restreindre les insertions
DROP POLICY IF EXISTS "Allow insert transactions" ON public.credit_transactions;

-- Créer une politique restrictive pour les transactions de crédits
CREATE POLICY "Restrict credit transaction creation" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (
  -- Seuls les admins peuvent créer des transactions de crédits
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. VÉRIFIER que les missions sont correctement protégées
-- Les politiques existantes suivantes doivent suffire :
-- - "Les admins peuvent voir toutes les missions" (pour les admins)
-- - "Les convoyeurs peuvent voir leurs missions assignées" (driver_id = auth.uid())
-- - "Les créateurs peuvent gérer leurs missions" (created_by = auth.uid())
-- - "Les donneurs d'ordre peuvent voir leurs missions" (donor_id = auth.uid())

-- 5. OPTIONNEL: Ajouter une politique pour les utilisateurs publics avec token de suivi
CREATE POLICY "Public tracking access" 
ON public.missions 
FOR SELECT 
USING (
  -- Permettre l'accès via les liens de suivi publics
  EXISTS (
    SELECT 1 FROM public.tracking_links tl
    WHERE tl.mission_id = missions.id 
    AND tl.is_active = true 
    AND tl.expires_at > now()
  )
);