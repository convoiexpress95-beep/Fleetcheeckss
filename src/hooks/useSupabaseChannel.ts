import { useEffect, useRef, useState, useCallback } from 'react';
import { logEvent } from '@/lib/metrics';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface ChannelStatusInfo {
  status: 'initial' | 'subscribing' | 'joined' | 'error' | 'closed' | 'retry';
  attempt: number;
  lastError?: string;
  lastJoinedAt?: number;
}

interface UseSupabaseChannelOptions {
  channelName: string;
  client: SupabaseClient;
  configure: (channel: RealtimeChannel) => RealtimeChannel; // attach filters, handlers, etc.
  onStatusChange?: (info: ChannelStatusInfo) => void;
  maxRetries?: number; // default infinite (-1)
  backoffBaseMs?: number; // starting backoff
  backoffMaxMs?: number; // cap
  autoSubscribe?: boolean;
}

export function useSupabaseChannel<T = any>({
  channelName,
  client,
  configure,
  onStatusChange,
  maxRetries = -1,
  backoffBaseMs = 500,
  backoffMaxMs = 8000,
  autoSubscribe = true,
}: UseSupabaseChannelOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<ChannelStatusInfo>({ status: 'initial', attempt: 0 });
  const retryRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubscribedRef = useRef(false);

  const emitStatus = useCallback((partial: Partial<ChannelStatusInfo>) => {
    setStatus(prev => {
      const next = { ...prev, ...partial } as ChannelStatusInfo;
      onStatusChange?.(next);
      logEvent('realtime.channel.status', { channel: channelName, status: next.status, attempt: next.attempt, error: next.lastError });
      return next;
    });
  }, [onStatusChange]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (channelRef.current) {
      try { channelRef.current.unsubscribe(); } catch {}
      channelRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback((err?: string) => {
    if (unsubscribedRef.current) return;
    const attempt = retryRef.current + 1;
    if (maxRetries >= 0 && attempt > maxRetries) {
      emitStatus({ status: 'closed', lastError: err });
      return;
    }
    retryRef.current = attempt;
    const delay = Math.min(backoffBaseMs * Math.pow(2, attempt - 1), backoffMaxMs);
    emitStatus({ status: 'retry', attempt, lastError: err });
    timeoutRef.current = setTimeout(() => {
      subscribeInternal();
    }, delay);
  }, [backoffBaseMs, backoffMaxMs, emitStatus, maxRetries]);

  const subscribeInternal = useCallback(() => {
    cleanup();
    emitStatus({ status: 'subscribing' });
    const channel = configure(client.channel(channelName));
    channelRef.current = channel;
    channel
      .on('presence', { event: 'sync' }, () => {}) // keep reference example
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') {
          emitStatus({ status: 'joined', attempt: retryRef.current, lastJoinedAt: Date.now() });
          retryRef.current = 0; // reset after success
        } else if (s === 'CHANNEL_ERROR') {
          emitStatus({ status: 'error' });
          scheduleRetry('CHANNEL_ERROR');
        } else if (s === 'TIMED_OUT') {
          emitStatus({ status: 'error', lastError: 'TIMED_OUT' });
          scheduleRetry('TIMED_OUT');
        } else if (s === 'CLOSED') {
          emitStatus({ status: 'closed' });
          scheduleRetry('CLOSED');
        }
      });
  }, [channelName, client, configure, cleanup, emitStatus, scheduleRetry]);

  useEffect(() => {
    if (autoSubscribe) {
      subscribeInternal();
    }
    return () => {
      unsubscribedRef.current = true;
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  const forceResubscribe = useCallback(() => {
    retryRef.current = 0;
    subscribeInternal();
  }, [subscribeInternal]);

  return { channel: channelRef.current, status, forceResubscribe };
}
