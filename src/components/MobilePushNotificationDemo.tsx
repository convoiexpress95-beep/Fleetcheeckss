import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send, Smartphone } from 'lucide-react';
import { useSendNotification } from '@/hooks/useSendNotification';
import { useAuth } from '@/contexts/AuthContext';

export const MobilePushNotificationDemo = () => {
  const { user } = useAuth();
  const sendNotification = useSendNotification();
  const [title, setTitle] = useState('FleetCheecks - Nouvelle mission');
  const [message, setMessage] = useState('Une nouvelle mission vous a été assignée. Cliquez pour voir les détails.');
  const [data, setData] = useState('{"mission_id": "demo-123"}');

  const handleSendDemo = async () => {
    if (!user) return;

    try {
      let parsedData = {};
      if (data) {
        parsedData = JSON.parse(data);
      }

      await sendNotification.mutateAsync({
        user_id: user.id,
        title,
        message,
        data: parsedData,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test Notifications Push
        </CardTitle>
        <CardDescription>
          Testez les notifications push natives sur votre appareil mobile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Titre de la notification</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de votre notification"
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contenu de votre notification"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="data">Données JSON (optionnel)</Label>
          <Textarea
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='{"mission_id": "123", "type": "assignment"}'
            rows={2}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSendDemo}
            disabled={sendNotification.isPending || !title || !message}
            className="flex items-center gap-2"
          >
            {sendNotification.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Envoi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer la notification
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              setTitle('FleetCheecks - Nouvelle mission');
              setMessage('Une nouvelle mission vous a été assignée. Cliquez pour voir les détails.');
              setData('{"mission_id": "demo-123"}');
            }}
          >
            Réinitialiser
          </Button>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4" />
            <span className="font-medium">Aperçu de la notification</span>
          </div>
          <div className="bg-background p-3 rounded border">
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-sm text-muted-foreground mt-1">{message}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};