/**
 * Service de synchronisation des profils utilisateur
 * Assure la cohérence des données utilisateur entre app principale, marketplace et convoiturage
 */

import { supabase } from '@/integrations/supabase/client';

export interface UnifiedProfile {
  user_id: string;
  full_name: string;
  email: string;
  user_role?: string;
  user_type?: string; // convoyeur, donneur_ordre, etc.
  balance?: number;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

class ProfileSyncService {
  /**
   * Synchronise le profil utilisateur entre tous les services
   */
  async syncUserProfile(userId: string): Promise<UnifiedProfile | null> {
    try {
      // Récupérer le profil depuis la base de données
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      if (!profile) {
        console.warn('Profil non trouvé pour l\'utilisateur:', userId);
        return null;
      }

      // Récupérer le solde utilisateur
      const { data: balanceData } = await supabase
        .from('credits_wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      const unifiedProfile: UnifiedProfile = {
        user_id: profile.user_id,
        full_name: profile.full_name || '',
        email: profile.email || '',
        user_role: (profile as any).user_role || 'user',
        balance: balanceData?.balance || 0,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      // Broadcaster le profil aux iframes (marketplace)
      this.broadcastProfileUpdate(unifiedProfile);

      return unifiedProfile;
    } catch (error) {
      console.error('Erreur lors de la synchronisation du profil:', error);
      return null;
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  async updateProfile(userId: string, updates: Partial<UnifiedProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return false;
      }

      // Re-synchroniser après mise à jour
      await this.syncUserProfile(userId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  /**
   * Diffuse les mises à jour de profil aux sous-applications
   */
  private broadcastProfileUpdate(profile: UnifiedProfile) {
    // Envoyer aux iframes marketplace
    const iframe = document.querySelector('iframe[src*="marketplace"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'PROFILE_UPDATE',
        payload: profile
      }, window.location.origin);
    }

    // Les composants convoiturage utilisent directement le contexte, pas besoin de broadcast
  }

  /**
   * Récupère le profil en cache ou depuis la DB
   */
  async getProfile(userId: string): Promise<UnifiedProfile | null> {
    return this.syncUserProfile(userId);
  }
}

export const profileSyncService = new ProfileSyncService();