import * as React from 'react';
import { useRealtimeCredits } from '@/hooks/useRealtimeCredits';

interface CreditsDisplayProps { variant?: 'full' | 'compact'; refreshSignal?: any }

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ variant='compact', refreshSignal }) => {
  // Realtime uniquement (polling retiré)
  const { balance, loading, refresh } = useRealtimeCredits();
  React.useEffect(() => { if (refreshSignal) refresh(); }, [refreshSignal, refresh]);
  const val = balance ?? 0;
  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Crédits</span>
        <span className="font-semibold">{loading ? '…' : val}</span>
      </div>
    );
  }
  return <div className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700">{loading ? '…' : `${val} crédits`}</div>;
};