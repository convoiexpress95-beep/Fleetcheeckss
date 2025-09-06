import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationParams {
  user_id: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  mission_id?: string;
}

export const useSendNotification = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendNotificationParams) => {
      console.log('Sending notification:', params);

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: params,
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Notification sent successfully:', data);
      toast({
        title: 'Notification envoyée',
        description: `Notification envoyée à ${data?.sent || 0} appareils`,
      });
    },
    onError: (error: any) => {
      console.error('Error sending notification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la notification push',
        variant: 'destructive',
      });
    },
  });
};

// Hook pour envoyer une notification à plusieurs utilisateurs
export const useSendBulkNotification = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { 
      user_ids: string[]; 
      title: string; 
      message: string; 
      data?: Record<string, any>;
      mission_id?: string; 
    }) => {
      const results = await Promise.allSettled(
        params.user_ids.map(user_id =>
          supabase.functions.invoke('send-push-notification', {
            body: {
              user_id,
              title: params.title,
              message: params.message,
              data: params.data,
              mission_id: params.mission_id,
            },
          })
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return { successful, failed, total: params.user_ids.length };
    },
    onSuccess: (data) => {
      console.log('Bulk notifications sent:', data);
      toast({
        title: 'Notifications envoyées',
        description: `${data.successful}/${data.total} notifications envoyées avec succès`,
      });
    },
    onError: (error: any) => {
      console.error('Error sending bulk notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer les notifications push',
        variant: 'destructive',
      });
    },
  });
};