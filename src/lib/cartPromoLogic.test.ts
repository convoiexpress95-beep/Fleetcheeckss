import { describe, it, expect } from 'vitest';

function computeDiscount(subtotal: number, percent: number, usageLeft: boolean, perUserLeft: boolean) {
  if (!usageLeft || !perUserLeft) return 0;
  return subtotal * (percent/100);
}

describe('promo logic (simplified)', () => {
  it('applies discount when usage & user limits available', () => {
    expect(computeDiscount(100, 20, true, true)).toBe(20);
  });
  it('no discount when global usage exceeded', () => {
    expect(computeDiscount(100, 20, false, true)).toBe(0);
  });
  it('no discount when per user exceeded', () => {
    expect(computeDiscount(200, 10, true, false)).toBe(0);
  });
});
