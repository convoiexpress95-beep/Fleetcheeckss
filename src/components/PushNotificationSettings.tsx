import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Check, X, AlertTriangle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationSettings = () => {
  const {
    isSupported,
    permission,
    token,
    requestPermission,
    unsubscribe,
  } = usePushNotifications();

  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        icon: <X className="h-4 w-4" />,
        status: 'Non supporté',
        description: 'Votre navigateur ne supporte pas les notifications push',
        variant: 'destructive' as const,
      };
    }

    switch (permission) {
      case 'granted':
        return {
          icon: <Check className="h-4 w-4" />,
          status: 'Activé',
          description: 'Vous recevez les notifications push en temps réel',
          variant: 'default' as const,
        };
      case 'denied':
        return {
          icon: <X className="h-4 w-4" />,
          status: 'Refusé',
          description: 'Les notifications ont été refusées. Vous pouvez les réactiver dans les paramètres du navigateur.',
          variant: 'destructive' as const,
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          status: 'Non configuré',
          description: 'Activez les notifications pour être alerté en temps réel',
          variant: 'secondary' as const,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications Push
        </CardTitle>
        <CardDescription>
          Recevez des alertes en temps réel pour vos missions et messages importants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Statut</span>
              <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                {statusInfo.icon}
                {statusInfo.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {permission === 'default' && isSupported && (
            <Button onClick={requestPermission} className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Activer les notifications
            </Button>
          )}
          
          {permission === 'granted' && token && (
            <Button 
              variant="outline" 
              onClick={unsubscribe}
              className="flex items-center gap-2"
            >
              <BellOff className="h-4 w-4" />
              Désactiver
            </Button>
          )}

          {permission === 'denied' && (
            <div className="text-sm text-muted-foreground">
              Pour réactiver les notifications, allez dans les paramètres de votre navigateur :
              <br />
              <strong>Paramètres › Confidentialité et sécurité › Paramètres du site › Notifications</strong>
            </div>
          )}
        </div>

        {!isSupported && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              Les notifications push ne sont pas disponibles sur ce navigateur. 
              Essayez avec Chrome, Firefox, Safari ou Edge pour une meilleure expérience.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};