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

// Normalise une clé éventuellement préfixée par le nom du bucket ou une URL complète
export const normalizeKeyForBucket = (bucket: string, key: string) => {
  if (!key) return key;
  let k = key.trim();
  // Si c'est déjà une URL, essayer d'extraire la portion après /object/(public|sign)/<bucket>/
  if (/^https?:\/\//i.test(k)) {
    try {
      const u = new URL(k);
      const idx = u.pathname.indexOf(`/storage/v1/object/`);
      if (idx >= 0) {
        const rest = u.pathname.slice(idx + "/storage/v1/object/".length);
        // rest starts with 'public/<bucket>/' or 'sign/<bucket>/' or just '<bucket>/'
        const parts = rest.split('/');
        // remove possible 'public' or 'sign'
        if (parts[0] === 'public' || parts[0] === 'sign') parts.shift();
        // now expect bucket
        if (parts[0] === bucket) parts.shift();
        k = decodeURIComponent(parts.join('/'));
      }
    } catch {
      // leave as is if URL parsing fails
    }
  }
  // Retire préfixe leading slashes
  k = k.replace(/^\/+/, '');
  // Retire préfixe '<bucket>/' si présent
  if (k.toLowerCase().startsWith(`${bucket.toLowerCase()}/`)) {
    k = k.slice(bucket.length + 1);
  }
  return k;
};

// Crée une URL signée (lecture) pour un objet d'un bucket privé
export const createSignedUrlForBucketObject = async (
  bucket: string,
  key: string,
  expiresIn = 60 * 60
): Promise<string | null> => {
  const normalized = normalizeKeyForBucket(bucket, key);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(normalized, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
};

// Helper spécifique: documents (bucket privé)
export const getSignedUrlForDocument = async (path: string, expiresIn = 60 * 60) => {
  return createSignedUrlForBucketObject('documents', path, expiresIn);
};

// Normalise le tableau JSON de photos en tableau de chaînes
export const normalizePhotoList = (photos: any): string[] => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.filter((p) => typeof p === 'string');
  return [];
};
