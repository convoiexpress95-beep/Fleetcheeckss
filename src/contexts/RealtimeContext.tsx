import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks';

const RTC_DEBUG = import.meta.env.VITE_RTC_DEBUG === '1';

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSED';
}

export const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  connectionStatus: 'CLOSED'
});

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = React.useState<'CONNECTING' | 'OPEN' | 'CLOSED'>('CLOSED');
  const connectionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) {
      setConnectionStatus('CLOSED');
      if (connectionRef.current) {
        supabase.removeAllChannels();
        connectionRef.current = null;
      }
      return;
    }

    // Monitor global connection status
    const setupConnectionMonitoring = () => {
      setConnectionStatus('CONNECTING');
      
      // Heartbeat channel pour monitorer la connexion
      const heartbeatChannel = supabase
        .channel('heartbeat')
        .on('presence', { event: 'sync' }, () => {
          if (RTC_DEBUG) console.debug('[RTC] Heartbeat sync');
          setConnectionStatus('OPEN');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (RTC_DEBUG) console.debug('[RTC] Presence join', { key, newPresences });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          if (RTC_DEBUG) console.debug('[RTC] Presence leave', { key, leftPresences });
        });

      heartbeatChannel.subscribe((status) => {
        if (RTC_DEBUG) console.debug('[RTC] Heartbeat channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('OPEN');
          // Track user presence
          heartbeatChannel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CLOSED') {
          setConnectionStatus('CLOSED');
          // Attempt reconnection after delay
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (RTC_DEBUG) console.debug('[RTC] Attempting reconnection...');
            setupConnectionMonitoring();
          }, 5000);
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('CLOSED');
          toast({
            title: 'Connexion temps réel interrompue',
            description: 'Tentative de reconnexion en cours...',
            variant: 'destructive',
          });
        }
      });

      connectionRef.current = heartbeatChannel;
    };

    setupConnectionMonitoring();

    // Global realtime health monitoring
    const healthCheckInterval = setInterval(() => {
      if (connectionStatus === 'OPEN') {
        // Send health check via presence update
        connectionRef.current?.track({
          user_id: user.id,
          email: user.email,
          online_at: new Date().toISOString(),
          health_check: Date.now(),
        });
      }
    }, 30000); // Health check every 30 seconds

    return () => {
      clearInterval(healthCheckInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (connectionRef.current) {
        supabase.removeChannel(connectionRef.current);
        connectionRef.current = null;
      }
    };
  }, [user, toast]);

  // Auto-reconnection on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (connectionStatus === 'CLOSED' && user) {
        if (RTC_DEBUG) console.debug('[RTC] Window focus - checking connection');
        // Force connection check
        setConnectionStatus('CONNECTING');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [connectionStatus, user]);

  const value: RealtimeContextType = {
    isConnected: connectionStatus === 'OPEN',
    connectionStatus,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};