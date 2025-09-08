import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from '@/integrations/supabase/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Build a public URL for vehicle images stored in Supabase storage bucket 'vehicle-assets'
export function getVehicleImageUrl(params: {
  image_path?: string | null;
  body_type?: string | null;
}): string {
  // Prefer specific image from storage bucket if provided
  if (params.image_path) {
    try {
      const { data } = supabase.storage.from('vehicle-assets').getPublicUrl(params.image_path);
      if (data.publicUrl) return data.publicUrl;
    } catch {
      // fall through to silhouettes
    }
  }
  // Fallback to local public silhouettes for reliability
  const type = (params.body_type || 'autre').toLowerCase();
  const fileMap: Record<string, string> = {
    suv: '/silhouettes/suv.svg',
    berline: '/silhouettes/berline.svg',
    utilitaire: '/silhouettes/utilitaire.svg',
    hatchback: '/silhouettes/hatchback.svg',
    break: '/silhouettes/break.svg',
    monospace: '/silhouettes/monospace.svg',
    pickup: '/silhouettes/pickup.svg',
    camion: '/silhouettes/camion.svg',
    moto: '/silhouettes/moto.svg',
    autre: '/silhouettes/autre.svg',
  };
  return fileMap[type] || fileMap['autre'];
}

export function mapVehicleTypeToBodyType(input?: string | null): string | null {
  if (!input) return null;
  const s = input.toLowerCase();
  if (s.includes('suv')) return 'suv';
  if (s.includes('berline') || s.includes('sedan')) return 'berline';
  if (s.includes('fourgon') || s.includes('utilitaire') || s.includes('van')) return 'utilitaire';
  if (s.includes('hatch')) return 'hatchback';
  if (s.includes('break') || s.includes('wagon')) return 'break';
  if (s.includes('mono') || s.includes('mpv')) return 'monospace';
  if (s.includes('pickup') || s.includes('pick-up')) return 'pickup';
  if (s.includes('camion') || s.includes('poids')) return 'camion';
  if (s.includes('moto') || s.includes('scooter')) return 'moto';
  return 'autre';
}
