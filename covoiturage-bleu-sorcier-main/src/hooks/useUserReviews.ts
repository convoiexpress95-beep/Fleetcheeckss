import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserReview {
  id: string;
  to_user_id: string;
  from_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const KEY = (userId?: string) => ['conv','user_reviews', userId];

export function useUserReviews(toUserId?: string){
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: KEY(toUserId),
    enabled: !!toUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('to_user_id', toUserId)
        .order('created_at', { ascending: false });
      if(error) throw error;
      return (data || []) as UserReview[];
    }
  });

  const add = useMutation({
    mutationFn: async (input: { rating: number; comment?: string }) => {
      if(!toUserId) throw new Error('no to_user');
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if(!uid) throw new Error('auth required');
      const { data, error } = await supabase
        .from('user_reviews')
        .upsert({
          to_user_id: toUserId,
          from_user_id: uid,
          rating: input.rating,
          comment: input.comment || null,
        }, { onConflict: 'to_user_id,from_user_id' })
        .select('*')
        .single();
      if(error) throw error;
      return data as UserReview;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY(toUserId) })
  });

  return { list, add };
}
