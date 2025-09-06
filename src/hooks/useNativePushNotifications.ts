import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNativePushNotifications = () => {
  const [isNative, setIsNative] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    try {
      // @ts-ignore
      const { Capacitor } = require('@capacitor/core');
      setIsNative(!!Capacitor?.isNativePlatform?.() && Capacitor.isNativePlatform());
    } catch {
      setIsNative(false);
    }
  }, []);

  const initializePushNotifications = async () => {
    if (!isNative) return;

    try {
      const modPath = '@capacitor/push-notifications';
      // @ts-ignore
      const { PushNotifications } = await import(/* @vite-ignore */ modPath);
      // Demander les permissions
      const result = await PushNotifications.requestPermissions();
      setPermission(result.receive);

      if (result.receive === 'granted') {
        // Enregistrer pour les notifications push
        await PushNotifications.register();

  // Écouter les événements
  PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          saveTokenToDatabase(token.value);
        });

  PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast({
            title: 'Erreur de notification',
            description: 'Impossible d\'enregistrer les notifications push',
            variant: 'destructive',
          });
        });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
          toast({
            title: notification.title || 'Notification',
            description: notification.body || 'Vous avez reçu une notification',
          });
        });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
          // Gérer l'action de la notification (ouvrir une page spécifique, etc.)
          if (notification.notification.data?.mission_id) {
            // Navigation vers la mission spécifique
            window.location.href = `/missions/${notification.notification.data.mission_id}`;
          }
        });
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const saveTokenToDatabase = async (token: string) => {
    if (!user) return;

    try {
      let platform = 'web';
      try {
        // @ts-ignore
        const { Capacitor } = require('@capacitor/core');
        platform = typeof Capacitor?.getPlatform === 'function' ? Capacitor.getPlatform() : platform;
      } catch {}

      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: user.id,
          token,
          device_type: platform,
          device_info: {
            platform,
            isNative,
          },
        });

      if (error) {
        console.error('Error saving token:', error);
      }
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  };

  const disablePushNotifications = async () => {
    if (!isNative) return;

    try {
      const modPath = '@capacitor/push-notifications';
      // @ts-ignore
      const { PushNotifications } = await import(/* @vite-ignore */ modPath);
      await PushNotifications.removeAllListeners();
      if (token && user) {
        // Désactiver le token en base
        await supabase
          .from('push_notification_tokens')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('token', token);
      }
      setToken(null);
      setPermission('denied');
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  };

  return {
    isNative,
    permission,
    token,
    initializePushNotifications,
    disablePushNotifications,
  };
};