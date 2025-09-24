import { supabase } from '@/integrations/supabase/client';
import { instrumentProfilesQuery } from '@/lib/profileTracer';

/**
 * Service utilitaire pour gérer les profils utilisateur de manière sécurisée
 * Évite les conflits 409 en utilisant des stratégies de fallback
 */
export class ProfileService {
  /**
   * Cache pour éviter de recréer des profils multiples fois
   */
  private static processedUsers = new Set<string>();

  /**
   * Upsert sécurisé d'un profil utilisateur
   */
  static async safeUpsertProfile(profile: {
    user_id: string;
    email: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    display_name?: string;
    bio?: string;
    location?: string;
  }): Promise<boolean> {
    console.log('ProfileService: Démarrage safeUpsertProfile pour user:', profile.user_id);
    
    // Éviter les doubles traitements
    if (this.processedUsers.has(profile.user_id)) {
      console.log('ProfileService: Utilisateur déjà traité, retour true');
      return true;
    }

    try {
      // Utiliser la fonction RPC upsert_profile qui gère les conflits RLS proprement
      console.log('ProfileService: Utilisation de la fonction RPC upsert_profile...');
      
      // Cast en any temporairement pour éviter le problème de types TypeScript
      const { data, error } = await (supabase as any).rpc('upsert_profile', {
        _user_id: profile.user_id,
        _email: profile.email,
        _full_name: profile.full_name,
        _phone: profile.phone || null,
        _avatar_url: profile.avatar_url || null,
        _display_name: profile.display_name || null,
        _bio: profile.bio || null,
        _location: profile.location || null
      });

      if (error) {
        console.error('ProfileService: Erreur RPC upsert_profile:', error);
        return false;
      }

      console.log('ProfileService: RPC upsert_profile réussi:', data);
      this.processedUsers.add(profile.user_id);
      return true;
    } catch (error: any) {
      console.error('ProfileService.safeUpsertProfile exception globale:', error.message, error);
      return false;
    }
  }

  /**
   * Nettoyer le cache (utile lors de la déconnexion)
   */
  static clearCache(): void {
    this.processedUsers.clear();
  }

  /**
   * Créer un profil minimal pour un nouvel utilisateur
   */
  static async ensureMinimalProfile(userId: string, email: string, fullName?: string): Promise<boolean> {
    return this.safeUpsertProfile({
      user_id: userId,
      email,
      full_name: fullName || email.split('@')[0] || 'Utilisateur'
    });
  }
}