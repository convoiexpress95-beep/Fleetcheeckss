import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as any[];
      return rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        message: r.message,
        type: r.type,
        metadata: r.metadata ?? {},
        read_at: r.read_at ?? null,
        created_at: r.created_at,
      })) as Notification[];
    },
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (error) throw error;
      return count || 0;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Prefer the helper RPC for consistency
      const { error } = await (supabase as any).rpc('mark_notification_read', { _id: notificationId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
    onError: () => {
      const { toast: t } = { toast };
      t({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).rpc('mark_all_notifications_read');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast({ title: "Succès", description: "Toutes les notifications ont été marquées comme lues" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
      });
    },
  });
};