import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useMissions } from './useMissions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Auth sans utilisateur pour forcer le chemin démo
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

describe('useMissions (demo mode)', () => {
  function wrapper({ children }: any) {
    const qc = new QueryClient();
    return React.createElement(QueryClientProvider, { client: qc }, children);
  }

  it('retourne les 3 missions démo complètes', async () => {
    const { result } = renderHook(() => useMissions({}, 0, 10), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.count).toBe(3);
    expect(result.current.data?.data.length).toBe(3);
  });

  it('applique la pagination (pageSize=2)', async () => {
    const { result } = renderHook(() => useMissions({}, 0, 2), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.length).toBe(2);
    expect(result.current.data?.count).toBe(3);
  });
});
