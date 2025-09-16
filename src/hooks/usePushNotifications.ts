import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si les notifications push sont supportées
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: 'Non supporté',
        description: 'Les notifications push ne sont pas supportées sur ce navigateur',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez désormais des notifications push',
        });
        return true;
      } else {
        toast({
          title: 'Permission refusée',
          description: 'Les notifications push ont été refusées',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de demander la permission pour les notifications',
        variant: 'destructive',
      });
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!user || permission !== 'granted') return;

    try {
      // Enregistrer le service worker uniquement en production pour éviter les soucis en dev
      if (!import.meta.env.PROD) {
        console.warn('[Push] Service worker non enregistré en mode dev.');
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Attendre que le service worker soit prêt
      await navigator.serviceWorker.ready;

      // Créer une subscription push avec une clé publique VAPID
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIeMHiLdjawUBrG5QUD8wg8_IjjT7M1hwSdJ4H3CyEaH__e6to5WY'
        ),
      });

      const token = JSON.stringify(subscription);
      setToken(token);

      // Sauvegarder le token en base de données
      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: user.id,
          token,
          device_type: 'web',
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde du token:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la souscription aux notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de s\'abonner aux notifications push',
        variant: 'destructive',
      });
    }
  };

  const unsubscribe = async () => {
    if (!user || !token) return;

    try {
      // Désactiver le token en base
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', token);

      if (error) throw error;

      setToken(null);
      toast({
        title: 'Désabonné',
        description: 'Vous ne recevrez plus de notifications push',
      });
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de se désabonner des notifications',
        variant: 'destructive',
      });
    }
  };

  return {
    isSupported,
    permission,
    token,
    requestPermission,
    unsubscribe,
  };
};

// Utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}