import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useMissions } from '../../hooks/useMissions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

function wrapperFactory() {
  const qc = new QueryClient();
  return ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useMissions pagination détaillée', () => {
  it('page 0 size 2', async () => {
    const wrapper = wrapperFactory();
    const { result } = renderHook(() => useMissions({}, 0, 2), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.length).toBe(2);
  });
  it('page 1 size 2 (reste 1)', async () => {
    const wrapper = wrapperFactory();
    const { result } = renderHook(() => useMissions({}, 1, 2), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.length).toBe(1);
  });
});
