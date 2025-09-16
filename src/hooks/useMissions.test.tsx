import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useMissions } from './useMissions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

function wrapperFactory() {
  const qc = new QueryClient();
  return ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useMissions hook demo', () => {
  it('charges 3 missions démo', async () => {
    const wrapper = wrapperFactory();
    const { result } = renderHook(() => useMissions({}, 0, 10), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.length).toBe(3);
  });
});
