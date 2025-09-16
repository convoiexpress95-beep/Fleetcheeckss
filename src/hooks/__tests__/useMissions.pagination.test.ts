import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useMissions } from '../useMissions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

function setup(page: number, size: number) {
  const qc = new QueryClient();
  const wrapper = ({ children }: any) => React.createElement(QueryClientProvider, { client: qc }, children);
  const h = renderHook(() => useMissions({}, page, size), { wrapper });
  return h;
}

describe('useMissions pagination', () => {
  it('page 0 size 2 => 2 éléments', async () => {
    const { result } = setup(0, 2);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.length).toBe(2);
  });
  it('page 1 size 2 => 1 élément restant', async () => {
    const { result } = setup(1, 2);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.length).toBe(1);
  });
});
