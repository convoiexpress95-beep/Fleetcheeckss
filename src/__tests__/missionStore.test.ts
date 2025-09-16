import { describe, it, expect } from 'vitest';
import { missionsMock } from '@/lib/mission-mock-data';
import { MissionStatus } from '@/lib/mission-types';

/**
 * Tests focussés sur la logique de filtrage et changement de statut.
 * On isole quelques fonctions utilitaires dérivées du mock via reproduction simple.
 */

function filterMissions(search:string, status:MissionStatus[]){
  return missionsMock.filter(m => {
    const matchesSearch = !search || m.client.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status.length===0 || status.includes(m.status);
    return matchesSearch && matchesStatus;
  });
}

describe('mission store (simplifié)', () => {
  it('filtre par client (search)', () => {
    const r = filterMissions('autolux', []);
    expect(r.every(m => m.client.name === 'AutoLux')).toBe(true);
    expect(r.length).toBeGreaterThan(0);
  });
  it('filtre par statut', () => {
    const r = filterMissions('', ['En cours']);
    expect(r.every(m => m.status==='En cours')).toBe(true);
  });
  it('combine search + statut', () => {
    const r = filterMissions('move', ['En attente']);
    expect(r.every(m => m.client.name==='MoveFleet' && m.status==='En attente')).toBe(true);
  });
});
