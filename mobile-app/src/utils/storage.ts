import { supabase } from '../config/supabase';

export const getPublicUrlForMissionPhoto = (path?: string | null) => {
  if (!path) return null;
  const { data } = supabase.storage.from('mission-photos').getPublicUrl(path);
  return data.publicUrl || null;
};

export const getSignedUrlForMissionPhoto = async (path: string, expiresIn = 60 * 60) => {
  const { data, error } = await supabase.storage.from('mission-photos').createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
};

export const normalizePhotoList = (photos: any): string[] => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.filter((p) => typeof p === 'string');
  return [];
};
