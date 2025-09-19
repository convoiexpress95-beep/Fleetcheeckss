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
      // Version simplifiée : aller directement à l'approche manuelle INSERT/UPDATE
      // On contourne temporairement la RPC pour diagnostiquer
      console.log('ProfileService: Démarrage approche directe INSERT/UPDATE...');
      
      // Stratégie: Essayer INSERT d'abord, puis UPDATE si conflit
      console.log('ProfileService: Tentative INSERT...');
        const insertRes = await instrumentProfilesQuery('insert-profile', async () =>
          await supabase
            .from('profiles')
            .insert({
              user_id: profile.user_id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              display_name: profile.display_name,
              bio: profile.bio,
              location: profile.location
            })
            .select('user_id')
            .single()
        );
        const { data: insertData, error: insertError } = insertRes || {} as any;

      if (!insertError && insertData) {
        console.log('ProfileService: INSERT réussi directement:', insertData);
        this.processedUsers.add(profile.user_id);
        return true;
      }

      // Si INSERT échoue, essayer UPDATE
      if (insertError) {
        console.log('ProfileService: INSERT échoué, tentative UPDATE:', insertError.message);
          const updateRes = await instrumentProfilesQuery('update-profile', async () =>
            await supabase
              .from('profiles')
              .update({
                email: profile.email,
                full_name: profile.full_name,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
                display_name: profile.display_name,
                bio: profile.bio,
                location: profile.location,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', profile.user_id)
              .select('user_id')
              .single()
          );
          const { data: updateData, error: updateError } = updateRes || {} as any;

        if (!updateError && updateData) {
          console.log('ProfileService: UPDATE réussi:', updateData);
          this.processedUsers.add(profile.user_id);
          return true;
        } else {
          console.error('ProfileService: UPDATE aussi échoué:', updateError);
          return false;
        }
      }

      return false;
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