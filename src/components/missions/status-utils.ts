import type { MissionStatus } from './mock-data-internal';

export interface MissionStatusMeta {
  value: MissionStatus | string;
  label: string;
  badgeClass: string; // classes util pour Badge
  dotClass: string;   // petite pastille optionnelle
}

const base = 'px-2 py-0.5 text-xs rounded-full font-medium';

const MAP: Record<string, MissionStatusMeta> = {
  pending: {
    value: 'pending',
    label: 'En attente',
    badgeClass: base + ' bg-amber-500/15 text-amber-500 border border-amber-500/30',
    dotClass: 'bg-amber-500'
  },
  'in-progress': {
    value: 'in-progress',
    label: 'En cours',
    badgeClass: base + ' bg-primary/15 text-primary border border-primary/30',
    dotClass: 'bg-primary'
  },
  delivered: {
    value: 'delivered',
    label: 'Livrée',
    badgeClass: base + ' bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
    dotClass: 'bg-emerald-500'
  },
  cancelled: {
    value: 'cancelled',
    label: 'Annulée',
    badgeClass: base + ' bg-slate-500/15 text-slate-400 border border-slate-500/30',
    dotClass: 'bg-slate-400'
  }
};

const FALLBACK: MissionStatusMeta = {
  value: 'unknown',
  label: 'Inconnu',
  badgeClass: base + ' bg-muted text-muted-foreground border border-border',
  dotClass: 'bg-muted-foreground'
};

export function getMissionStatusMeta(status: string | undefined | null): MissionStatusMeta {
  if (!status) return FALLBACK;
  return MAP[status] || FALLBACK;
}

export const missionStatuses: MissionStatusMeta[] = Object.values(MAP);
