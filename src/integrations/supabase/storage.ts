import { supabase } from './client';

// Convertit une clé Storage (ex: "missions/123/departure/abc.jpg") en URL publique
export const getPublicUrlForMissionPhoto = (path: string | null | undefined) => {
  if (!path) return null;
  const { data } = supabase.storage.from('mission-photos').getPublicUrl(path);
  return data.publicUrl || null;
};

// Génère une URL signée pour une clé Storage, valable expiresIn secondes
export const getSignedUrlForMissionPhoto = async (path: string, expiresIn = 60 * 60) => {
  const { data, error } = await supabase.storage
    .from('mission-photos')
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
};

// Normalise le tableau JSON de photos en tableau de chaînes
export const normalizePhotoList = (photos: any): string[] => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.filter((p) => typeof p === 'string');
  return [];
};
