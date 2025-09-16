import { useContext } from 'react';
import { UnifiedAuthContext } from './useUnifiedAuthProvider';

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}

// Compatibilité avec l'ancien hook useAuth
export const useAuth = useUnifiedAuth;