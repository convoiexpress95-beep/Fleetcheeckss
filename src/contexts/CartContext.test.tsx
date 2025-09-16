import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const Probe: React.FC = () => {
  const cart = useCart();
  return <div data-testid="count">{cart.totalCount}</div>;
};

describe('CartContext', () => {
  it('throws when used without provider', () => {
    const spy = () => render(<Probe />);
    expect(spy).toThrow(/useCart must be used within CartProvider/);
  });
  it('provides default values with provider', () => {
    const { getByTestId } = render(<CartProvider><Probe /></CartProvider>);
    expect(getByTestId('count').textContent).toBe('0');
  });
});
