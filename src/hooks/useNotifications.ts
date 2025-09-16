import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  updated_at: string;
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
      return data as Notification[];
    },
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      
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
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
    onError: (error: any) => {
      toast({
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
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
      });
    },
  });
};