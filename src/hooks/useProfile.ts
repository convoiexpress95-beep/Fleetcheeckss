import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/profileService';

/**
 * Hook pour s'assurer qu'un profil utilisateur existe et est à jour
 * Utile pour les pages qui nécessitent un profil valide
 */
export const useEnsureProfile = () => {
  const { user } = useAuth();

  useEffect(() => {
    const ensureProfile = async () => {
      if (!user?.id) return;

      try {
        const success = await ProfileService.ensureMinimalProfile(
          user.id,
          user.email || '',
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'
        );

        if (!success) {
          console.warn('Failed to ensure profile for user:', user.id);
        }
      } catch (error) {
        console.error('Error ensuring profile:', error);
      }
    };

    // Délai court pour éviter les appels simultanés au premier chargement
    const timer = setTimeout(ensureProfile, 100);
    return () => clearTimeout(timer);
  }, [user?.id, user?.email, user?.user_metadata]);

  return { user };
};

/**
 * Hook pour nettoyer les caches lors de changements d'utilisateur
 */
export const useProfileCleanup = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Nettoyer les caches quand l'utilisateur change
    if (!user) {
      ProfileService.clearCache();
    }
  }, [user?.id]);
};