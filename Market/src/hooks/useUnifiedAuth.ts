/**
 * Service d'authentification unifié pour les iframes
 * Permet aux sous-applications (marketplace) de communiquer avec l'app parente
 * pour partager l'état d'authentification
 */

export interface UnifiedUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    user_type?: string;
    [key: string]: unknown;
  };
}

export interface UnifiedSession {
  access_token: string;
  user: UnifiedUser;
}

export interface UnifiedAuthState {
  user: UnifiedUser | null;
  session: UnifiedSession | null;
  loading: boolean;
}

class UnifiedAuthService {
  private listeners: Array<(state: UnifiedAuthState) => void> = [];
  private currentState: UnifiedAuthState = {
    user: null,
    session: null,
    loading: true
  };

  constructor() {
    // Écouter les messages de l'app parent
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
      // Demander l'état d'auth initial
      this.requestAuthState();
    }
  }

  private handleMessage(event: MessageEvent) {
    // Vérifier l'origine pour la sécurité
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'AUTH_STATE_UPDATE') {
      this.currentState = event.data.payload;
      this.notifyListeners();
    }
  }

  private requestAuthState() {
    // Envoyer une demande d'état d'auth à l'app parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'REQUEST_AUTH_STATE',
        source: 'marketplace'
      }, window.location.origin);
    }
  }

  subscribe(listener: (state: UnifiedAuthState) => void) {
    this.listeners.push(listener);
    // Envoyer immédiatement l'état actuel
    listener(this.currentState);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  getState(): UnifiedAuthState {
    return this.currentState;
  }

  async signOut() {
    // Demander à l'app parent de se déconnecter
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'REQUEST_SIGN_OUT',
        source: 'marketplace'
      }, window.location.origin);
    }
  }
}

export const unifiedAuthService = new UnifiedAuthService();