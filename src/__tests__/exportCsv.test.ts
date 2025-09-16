import { describe, it, expect } from 'vitest';
import { missionsMock } from '@/lib/mission-mock-data';

function buildCsv(rows: any[]) {
  if(!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(','), ...rows.map(r=> headers.map(h=>`"${String(r[h]).replace(/"/g,'""')}"`).join(','))];
  return lines.join('\n');
}

describe('CSV export', () => {
  it('génère en-têtes + lignes', () => {
    const rows = missionsMock.slice(0,2).map(m => ({ id:m.id, client:m.client.name }));
    const csv = buildCsv(rows);
    expect(csv.split('\n').length).toBe(3); // header + 2 rows
    expect(csv.startsWith('id,client')).toBe(true);
  });
});
