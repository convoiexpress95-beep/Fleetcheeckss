/**
 * Bridge d'authentification pour la communication iframe
 * Permet aux sous-applications (marketplace) d'utiliser l'auth de l'app parente
 */

import { useAuth } from '@/contexts/AuthContext';
import { profileSyncService } from '@/services/profileSync';
import { useEffect } from 'react';

export function useAuthBridge() {
  const { user, session, loading, signOut } = useAuth();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine pour la sécurité
      if (event.origin !== window.location.origin) return;

      const { type, source } = event.data;

      if (type === 'REQUEST_AUTH_STATE' && source === 'marketplace') {
        // Synchroniser le profil utilisateur et envoyer l'état d'auth au marketplace
        const syncAndSend = async () => {
          let syncedProfile = null;
          if (user) {
            syncedProfile = await profileSyncService.syncUserProfile(user.id);
          }

          const iframe = document.querySelector('iframe[src*="marketplace"]') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'AUTH_STATE_UPDATE',
              payload: {
                user: user ? {
                  id: user.id,
                  email: user.email || '',
                  user_metadata: {
                    full_name: syncedProfile?.full_name || user.user_metadata?.full_name || '',
                    user_type: syncedProfile?.user_type || user.user_metadata?.user_type || 'convoyeur',
                    balance: syncedProfile?.balance || 0,
                    ...user.user_metadata
                  }
                } : null,
                session: session ? {
                  access_token: session.access_token,
                  user: {
                    id: user?.id || '',
                    email: user?.email || '',
                    user_metadata: user?.user_metadata || {}
                  }
                } : null,
                loading
              }
            }, window.location.origin);
          }
        };
        
        syncAndSend();
      }

      if (type === 'REQUEST_SIGN_OUT' && source === 'marketplace') {
        // Déconnecter l'utilisateur dans l'app parente
        signOut();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, session, loading, signOut]);

  // Envoyer les mises à jour d'état d'auth au marketplace
  useEffect(() => {
    const iframe = document.querySelector('iframe[src*="marketplace"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'AUTH_STATE_UPDATE',
        payload: {
          user: user ? {
            id: user.id,
            email: user.email || '',
            user_metadata: {
              full_name: user.user_metadata?.full_name || '',
              user_type: user.user_metadata?.user_type || 'convoyeur',
              ...user.user_metadata
            }
          } : null,
          session: session ? {
            access_token: session.access_token,
            user: {
              id: user?.id || '',
              email: user?.email || '',
              user_metadata: user?.user_metadata || {}
            }
          } : null,
          loading
        }
      }, window.location.origin);
    }
  }, [user, session, loading]);
}