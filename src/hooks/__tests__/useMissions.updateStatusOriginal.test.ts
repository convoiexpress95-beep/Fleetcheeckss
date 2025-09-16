import { describe, it, expect } from 'vitest';
import { dbStatusToUI, uiStatusToDb } from '@/components/missions/mission-ui';

describe('status conversion legacy compatibility', () => {
  const rawVariants = ['in_progress','inspection_start','inspection_end','completed','delivered','cancelled','archived'];
  it('dbStatusToUI regroupe les variantes attendues', () => {
    expect(dbStatusToUI('in_progress')).toBe('in-progress');
    expect(dbStatusToUI('inspection_start')).toBe('in-progress');
    expect(dbStatusToUI('inspection_end')).toBe('in-progress');
    expect(dbStatusToUI('completed')).toBe('delivered');
    expect(dbStatusToUI('delivered')).toBe('delivered');
    expect(dbStatusToUI('cancelled')).toBe('cancelled');
    expect(dbStatusToUI('archived')).toBe('cancelled');
  });
  it('uiStatusToDb produit une valeur cohérente utilisable en update', () => {
    const simplifiedRoundTrip = rawVariants.map(v => uiStatusToDb(dbStatusToUI(v as any)));
    // Doit être un sous-ensemble connu
    simplifiedRoundTrip.forEach(r => expect(['pending','in_progress','completed','cancelled']).toContain(r));
  });
});
