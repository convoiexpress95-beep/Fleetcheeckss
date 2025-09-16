import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
}

const KEY = (userId?: string) => ['conv','profile', userId];

export function useProfile(userId?: string){
  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: KEY(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if(error && error.code !== 'PGRST116') throw error; // ignore row not found
      return (data || null) as ProfileRow | null;
    }
  });

  const upsert = useMutation({
    mutationFn: async (patch: Partial<ProfileRow>) => {
      if(!userId) throw new Error('no user');
      const row = { id: userId, ...patch };
      const { data, error } = await supabase
        .from('profiles')
        .upsert(row, { onConflict: 'id' })
        .select('*')
        .single();
      if(error) throw error;
      return data as ProfileRow;
    },
    onSuccess: (row) => {
      qc.setQueryData(KEY(userId), row);
    }
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if(!userId) throw new Error('no user');
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if(upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = pub?.publicUrl || '';
      await upsert.mutateAsync({ avatar_url: url });
      return url;
    }
  });

  return { profile, upsert, uploadAvatar };
}
