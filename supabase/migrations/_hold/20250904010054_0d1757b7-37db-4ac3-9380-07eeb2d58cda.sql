-- Correction de la faille de sécurité: restriction de l'accès aux profils
-- Suppression de la politique dangereuse qui permet à tous les utilisateurs de voir tous les profils
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON public.profiles;

-- Création d'une nouvelle politique sécurisée qui permet seulement aux utilisateurs de voir leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de voir les profils des contacts qu'ils ont ajoutés
-- Cela permet aux fonctionnalités de contact de continuer à fonctionner
CREATE POLICY "Les utilisateurs peuvent voir les profils de leurs contacts" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.user_id = auth.uid() 
    AND contacts.invited_user_id = profiles.user_id 
    AND contacts.status = 'active'
  )
);

-- Politique pour permettre aux utilisateurs de voir les profils dans le contexte des missions
-- où ils sont impliqués (créateur, donneur d'ordre ou convoyeur)
CREATE POLICY "Les utilisateurs peuvent voir les profils des participants aux missions partagées" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.missions 
    WHERE (missions.created_by = auth.uid() OR missions.donor_id = auth.uid() OR missions.driver_id = auth.uid())
    AND (missions.created_by = profiles.user_id OR missions.donor_id = profiles.user_id OR missions.driver_id = profiles.user_id)
  )
);