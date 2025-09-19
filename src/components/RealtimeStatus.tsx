import React from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const RealtimeStatus: React.FC = () => {
  const { isConnected, connectionStatus } = useRealtime();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'OPEN':
        return {
          variant: 'default' as const,
          icon: <Wifi className="w-3 h-3" />,
          text: 'Temps réel',
          className: 'bg-green-500 text-white border-green-600'
        };
      case 'CONNECTING':
        return {
          variant: 'secondary' as const,
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Connexion...',
          className: 'bg-yellow-500 text-white border-yellow-600'
        };
      case 'CLOSED':
        return {
          variant: 'destructive' as const,
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Hors ligne',
          className: 'bg-red-500 text-white border-red-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1.5 text-xs font-medium ${config.className}`}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
};