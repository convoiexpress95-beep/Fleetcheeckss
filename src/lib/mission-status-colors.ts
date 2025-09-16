import { MissionStatus } from './mission-types';

interface StatusStyle {
  badge: string; // classes pour Badge / pill
  cardBorder: string; // border accent (ex: ring or left border)
  dot: string; // petite pastille
}

// Palette "premium" assombrie / plus saturée pour meilleur contraste sur fond sombre
// - Fonds augmentés (25-30% alpha) + teintes plus profondes (500/600)
// - Texte éclairci pour lisibilité
// - Bordures renforcées + légère lueur interne (utilisée via shadow util dans composants)
const styles: Record<MissionStatus, StatusStyle> = {
  'En attente': {
  badge: 'badge-premium bg-amber-600/30 text-amber-200 border border-amber-400/60 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]',
    cardBorder: 'before:bg-amber-500/90',
  dot: 'mission-status-dot bg-amber-400'
  },
  'En cours': {
  badge: 'badge-premium bg-sky-600/30 text-sky-200 border border-sky-400/60 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]',
    cardBorder: 'before:bg-sky-500/90',
  dot: 'mission-status-dot bg-sky-400'
  },
  'En retard': {
  badge: 'badge-premium bg-red-600/30 text-red-200 border border-red-500/60 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]',
    cardBorder: 'before:bg-red-600/90',
  dot: 'mission-status-dot bg-red-500'
  },
  'Livrée': {
  badge: 'badge-premium bg-emerald-600/30 text-emerald-200 border border-emerald-500/60 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]',
    cardBorder: 'before:bg-emerald-600/90',
  dot: 'mission-status-dot bg-emerald-500'
  },
  'Annulée': {
  badge: 'badge-premium bg-zinc-700/35 text-zinc-200 border border-zinc-500/60 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]',
    cardBorder: 'before:bg-zinc-500/80',
  dot: 'mission-status-dot bg-zinc-500'
  }
};

export function getMissionStatusStyle(status: MissionStatus): StatusStyle {
  return styles[status];
}
