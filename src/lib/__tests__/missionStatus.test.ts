import { describe, it, expect } from 'vitest';
import { simplifyStatus, expandStatus, isTerminal, statusProgressOrder } from '../missionStatus';

describe('missionStatus utils', () => {
  it('simplifyStatus maps raw variants', () => {
    expect(simplifyStatus('in_progress')).toBe('in-progress');
    expect(simplifyStatus('inspection_start')).toBe('in-progress');
    expect(simplifyStatus('completed')).toBe('delivered');
    expect(simplifyStatus('archived')).toBe('cancelled');
    expect(simplifyStatus('unknown')).toBe('pending');
  });
  it('expandStatus reverses simplified', () => {
    expect(expandStatus('in-progress')).toBe('in_progress');
    expect(expandStatus('delivered')).toBe('completed');
  });
  it('isTerminal detects terminal states', () => {
    expect(isTerminal('delivered')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('pending')).toBe(false);
  });
  it('statusProgressOrder orders correctly', () => {
    expect(statusProgressOrder('pending')).toBeLessThan(statusProgressOrder('in-progress'));
    expect(statusProgressOrder('in-progress')).toBeLessThan(statusProgressOrder('delivered'));
    expect(statusProgressOrder('cancelled')).toBeGreaterThan(statusProgressOrder('delivered'));
  });
});
