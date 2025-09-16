import { describe, it, expect } from 'vitest';
import { buildMissionSummary, aggregateMargin } from '../missionBuild';

describe('missionBuild', () => {
  it('builds a summary with margin', () => {
    const summary = buildMissionSummary({ id: '1', donor_earning: 120, driver_earning: 90, pickup_address: 'A', delivery_address: 'B', status: 'in_progress' });
    expect(summary.earnings.margin).toBe(30);
    expect(summary.status).toBe('in-progress');
    expect(summary.route).toBe('A → B');
  });
  it('aggregateMargin sums margins', () => {
    const total = aggregateMargin([
      { id: '1', donor_earning: 100, driver_earning: 70 },
      { id: '2', donor_earning: 80, driver_earning: 50 }
    ]);
    expect(total).toBe(60);
  });
});
