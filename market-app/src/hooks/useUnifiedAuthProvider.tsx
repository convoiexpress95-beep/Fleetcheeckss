import { useState, useEffect, createContext, useContext } from 'react';
import { unifiedAuthService, UnifiedAuthState, UnifiedUser, UnifiedSession } from './useUnifiedAuth';

interface UnifiedAuthContextType extends UnifiedAuthState {
  signOut: () => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export { UnifiedAuthContext };

export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<UnifiedAuthState>({
    user: null,
    session: null,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = unifiedAuthService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await unifiedAuthService.signOut();
  };

  return (
    <UnifiedAuthContext.Provider value={{
      ...authState,
      signOut
    }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export { UnifiedAuthProvider as AuthProvider };